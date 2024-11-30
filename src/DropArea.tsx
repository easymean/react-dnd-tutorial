import "./droparea.scss";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  children?: React.ReactNode;
  direction?: "horizontal" | "vertical";
};

export const DropArea = ({ children, direction = "vertical" }: Props) => {
  const containerRef = useRef<HTMLUListElement>(null);
  const ghostRef = useRef<HTMLElement>();

  const [idList, setIdList] = useState<string[]>([]);

  const makeCustomGhost = (target: Element) => {
    const ghost = target.cloneNode(true) as HTMLElement;
    ghost.classList.add("ghost");
    ghost.style.transform = `scale(1.0)`;
    ghost.style.position = "absolute";
    ghost.style.top = "-1000px";
    ghost.style.left = "-1000px";
    return ghost;
  };

  const getDragItem = (target: Element) => {
    if (containerRef.current && target) {
      const dragItems = [...containerRef.current.querySelectorAll(".dragitem")];
      const dragItem = dragItems.find((el) => el.contains(target));
      return dragItem;
    }
    return undefined;
  };

  const getOffset = (draggable: Element, item: Element) => {
    const draggableRect = draggable.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    return {
      x: Math.ceil(
        draggableRect.width / 2 + draggableRect.left - itemRect.left
      ),
      y: Math.ceil(draggableRect.height / 2 + draggableRect.top - itemRect.top),
    };
  };

  const handleDragStart = (ev: DragEvent) => {
    const draggable = ev.currentTarget as Element;
    const dragItem = getDragItem(draggable);
    if (!dragItem) return;
    dragItem.classList.add("dragging");

    const ghost = makeCustomGhost(dragItem);
    // 나중에 해제해야되기 때문에 저장
    ghostRef.current = ghost;
    document.body.appendChild(ghost);

    const { x, y } = getOffset(draggable, dragItem);

    ev.dataTransfer?.setDragImage(ghost, x, y);
  };

  const handleDragEnd = (ev: DragEvent) => {
    const draggable = ev.currentTarget as Element;
    const dragItem = getDragItem(draggable);
    if (!dragItem) return;
    dragItem.classList.remove("dragging");
  };

  const handleDragOver: React.DragEventHandler<HTMLUListElement> = (ev) => {
    ev.preventDefault();

    // 초기화
    ghostRef.current?.remove();
    ghostRef.current = undefined;

    const container = ev.currentTarget as Element;

    const getClosestElement = (mouseY: number) => {
      const dragItems = [
        ...container.querySelectorAll(".dragitem:not(.dragging"),
      ];
      const result = dragItems.reduce<{
        offset: number;
        element: Element | undefined;
      }>(
        (closest, child) => {
          const rect = child.getBoundingClientRect();
          const offset = mouseY - rect.top - rect.height / 2;
          if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
          } else {
            return closest;
          }
        },
        { offset: Number.NEGATIVE_INFINITY, element: undefined }
      );
      return result.element;
    };

    const closest = getClosestElement(ev.clientY);
    const dragging = container.querySelector(".dragging");
    if (!dragging || !closest) return;

    const items = [...container.querySelectorAll(".dragitem")];
    const fromIdx = items.findIndex((el) => el.id === dragging.id);
    const toIdx = items.findIndex((el) => el.id === closest.id);

    if (fromIdx < toIdx) {
      container.insertBefore(dragging, closest.nextElementSibling);
    } else if (fromIdx > toIdx) {
      container.insertBefore(dragging, closest);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const dragItems = [...containerRef.current.querySelectorAll(".dragitem")];

      dragItems.forEach((el) => {
        const draggable = el.querySelector("[draggable=true]");
        if (draggable instanceof HTMLElement) {
          draggable.addEventListener("dragstart", handleDragStart);
          draggable.addEventListener("dragend", handleDragEnd);
        }
      });
    }
  });

  return (
    <ul
      ref={containerRef}
      className={"droparea " + direction}
      onDragOver={handleDragOver}
    >
      {children}
    </ul>
  );
};
