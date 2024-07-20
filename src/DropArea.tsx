import "./droparea.scss";
import React, { useEffect, useRef } from "react";

type Props = {
  children?: React.ReactNode;
  direction?: "horizontal" | "vertical";
  boundaryMargin?: number;
};

export const DropArea = ({
  children,
  direction = "vertical",
  boundaryMargin = 0,
}: Props) => {
  const areaRef = useRef<HTMLUListElement>(null);
  const ghostRef = useRef<HTMLElement>();

  const pos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const makeClone = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const cloned = target.cloneNode(true) as HTMLElement;
    cloned.classList.add("ghost");
    cloned.style.position = "absolute";
    cloned.style.top = `${rect.top}px`;
    cloned.style.left = `${rect.left}px`;
    return cloned;
  };

  const getClosestItem = (target: Element) => {
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return document
      .elementsFromPoint(centerX, centerY)
      .find((el) => el.classList.contains("drag-item"));
  };

  const mouseDownHandler = (ev: MouseEvent) => {
    ev.stopPropagation();
    if (ev.cancelable) ev.preventDefault();

    const target = ev.currentTarget as HTMLElement;
    const dragItem = getClosestItem(target) as HTMLElement;
    if (dragItem.classList.contains("placeholder")) {
      return;
    }

    const initX = dragItem.offsetLeft;
    const initY = dragItem.offsetTop;

    pos.current = {
      x: initX,
      y: initY,
    };

    const ghostItem = makeClone(dragItem);
    areaRef.current?.appendChild(ghostItem);
    ghostRef.current = ghostItem;

    dragItem.classList.add("placeholder");

    mouseMoveHandler(ev);

    const mouseUpHandler = () => {
      ghostItem.remove();
      ghostRef.current = undefined;

      dragItem.classList.remove("placeholder");
      document.removeEventListener("mousemove", mouseMoveHandler);
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler, {
      once: true,
    });
  };

  const moveTarget = (target: HTMLElement, pos: { x: number; y: number }) => {
    target.style.position = "absolute";
    target.style.top = `${pos.y}px`;
    target.style.left = `${pos.x}px`;
    target.style.pointerEvents = "none";
  };

  const mouseMoveHandler = (ev: MouseEvent) => {
    const getPosInRange = (
      curPos: { x: number; y: number },
      boundary: HTMLElement,
      item: HTMLElement
    ) => {
      const getRange = (boundary: HTMLElement, item: HTMLElement) => {
        const boundaryRect = boundary.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        let maxX = Math.floor(
          boundaryRect.width - boundaryMargin - itemRect.width
        );
        let minX = boundaryMargin;
        let maxY = Math.floor(
          boundaryRect.height - boundaryMargin - itemRect.height
        );
        let minY = boundaryMargin;

        if (maxX <= boundaryMargin) {
          minX = 0;
          maxX = 0;
        }

        if (maxY <= boundaryMargin) {
          minY = 0;
          maxY = 0;
        }
        return {
          x: [minX, maxX],
          y: [minY, maxY],
        };
      };

      const { x, y } = getRange(boundary, item);
      return {
        x: Math.min(Math.max(curPos.x, x[0]), x[1]),
        y: Math.min(Math.max(curPos.y, y[0]), y[1]),
      };
    };

    const deltaX = ev.movementX;
    const deltaY = ev.movementY;

    if (!areaRef.current || !ghostRef.current) return;

    pos.current = getPosInRange(
      { x: pos.current.x + deltaX, y: pos.current.y + deltaY },
      areaRef.current,
      ghostRef.current
    );

    moveTarget(ghostRef.current, pos.current);

    const closestItem = getClosestItem(ghostRef.current) as HTMLElement;

    if (closestItem && ghostRef.current.id !== closestItem.id) {
      // 원래 위치

      const items = [...areaRef.current.children].filter(
        (el) => !el.classList.contains("ghost")
      );

      const fromIdx = items.findIndex(
        (child) => child.id === ghostRef.current?.id
      );
      const toIdx = items.findIndex((child) => child.id === closestItem.id);

      const originalElement = items[fromIdx] as HTMLElement;

      const offsetX = originalElement.offsetLeft - closestItem.offsetLeft;
      const offsetY = originalElement.offsetTop - closestItem.offsetTop;

      setItemsTransition(items, fromIdx, toIdx, { x: offsetX, y: offsetY });

      const reorderElements = () => {
        if (fromIdx < toIdx) {
          // insert after
          areaRef.current?.insertBefore(
            originalElement,
            closestItem.nextElementSibling
          );
        } else if (fromIdx > toIdx) {
          areaRef.current?.insertBefore(originalElement, closestItem);
        }
      };

      const transitionHandler = () => {
        reorderElements();
        items.forEach((el) => el.removeAttribute("style"));
        originalElement.removeEventListener("transitionend", transitionHandler);
      };

      originalElement.addEventListener("transitionend", transitionHandler);
    }
  };

  const setItemsTransition = (
    elements: Element[],
    fromIdx: number,
    toIdx: number,
    offset: { x: number; y: number }
  ) => {
    const distX = offset.x / Math.abs(toIdx - fromIdx);
    const distY = offset.y / Math.abs(toIdx - fromIdx);

    let startIdx = fromIdx;
    let endIdx = toIdx + 1;

    if (fromIdx > toIdx) {
      startIdx = toIdx - 1;
      endIdx = fromIdx;
    }
    const originalElement = elements[fromIdx] as HTMLElement;
    originalElement.style.transform = `translate3d(${-distX}px, ${-distY}px, 0px)`;
    originalElement.style.transition = `transform 250ms ease-in-out`;

    elements.forEach((el, idx) => {
      if (startIdx < idx && idx < endIdx) {
        (
          el as HTMLElement
        ).style.transform = `translate3d(${distX}px, ${distY}px, 0px)`;
        (el as HTMLElement).style.transition = `transform 250ms ease-in-out`;
      }
    });
  };

  useEffect(() => {
    if (areaRef.current) {
      const dragItems = [...areaRef.current.children].filter((el) =>
        el.classList.contains("drag-item")
      );
      dragItems.forEach((el) => {
        const draggable = el.querySelector("[draggable=true]");
        if (draggable instanceof HTMLElement) {
          draggable.addEventListener("mousedown", mouseDownHandler);
        }
      });

      return () => {
        dragItems.forEach((el) => {
          const draggable = el.querySelector("[draggable=true]");
          if (draggable instanceof HTMLElement) {
            draggable.removeEventListener("mousedown", mouseDownHandler);
          }
        });
      };
    }
  }, [children, mouseDownHandler]);

  return (
    <ul ref={areaRef} className={"droparea " + direction}>
      {children}
    </ul>
  );
};
