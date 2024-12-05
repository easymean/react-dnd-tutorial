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
      return dragItems.find((el) => el.contains(target));
    }
    return undefined;
  };

  const getOffsetBetweenInOut = (inElement: Element, outElement: Element) => {
    const inRect = inElement.getBoundingClientRect();
    const outRect = outElement.getBoundingClientRect();

    return {
      x: Math.ceil(inRect.width / 2 + inRect.left - outRect.left),
      y: Math.ceil(inRect.height / 2 + inRect.top - outRect.top),
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

    const { x, y } = getOffsetBetweenInOut(draggable, dragItem);
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

    // const getClosestElement = (getOffset: (rect: DOMRect) => number) => {
    //   const dragItems = [
    //     ...container.querySelectorAll(".dragitem:not(.dragging)"),
    //   ];
    //   const result = dragItems.reduce<{
    //     offset: number;
    //     element: Element | undefined;
    //   }>(
    //     (closest, child) => {
    //       const rect = child.getBoundingClientRect();
    //       const offset = getOffset(rect);
    //       if (offset < 0 && offset > closest.offset) {
    //         return { offset, element: child };
    //       } else {
    //         return closest;
    //       }
    //     },
    //     { offset: Number.NEGATIVE_INFINITY, element: undefined }
    //   );
    //   return result.element;
    // };

    // // dragging하는 아이템의 height, width를(correct) 고려합니다.
    // const getBaseLine = (
    //   prevMousePos: { x: number; y: number },
    //   curMousePos: { x: number; y: number },
    //   correct: { x: number; y: number }
    // ) => {
    //   if (direction === "horizontal") {
    //     const delta = prevMousePos.x - curMousePos.x > 0 ? -1 : 1;
    //     return (rect: DOMRect) =>
    //       curMousePos.x + correct.x * delta - rect.left - rect.width / 2;
    //   } else {
    //     const delta = prevMousePos.y - curMousePos.y > 0 ? -1 : 1;
    //     return (rect: DOMRect) =>
    //       curMousePos.y + correct.y * delta - rect.top - rect.height / 2;
    //   }
    // };

    // let correct = { x: 0, y: 0 };
    // if (ghostRef.current) {
    //   const draggable = ghostRef.current.querySelector(`[draggable=true]`);
    //   if (draggable)
    //     correct = getOffsetBetweenInOut(draggable, ghostRef.current);
    // }
    // const getRectOffset = getBaseLine(
    //   pos,
    //   { x: ev.clientX, y: ev.clientY },
    //   correct
    // );

    // const closest = getClosestElement(getRectOffset);
    const closest = document
      .elementFromPoint(ev.clientX, ev.clientY)
      ?.closest<HTMLElement>(".dragitem:not(.dragging)");
    const dragging = container.querySelector(".dragging");
    if (!dragging || !closest) return;

    const items = [...container.querySelectorAll(".dragitem")];
    const fromIdx = items.findIndex((el) => el.id === dragging.id);
    const toIdx = items.findIndex((el) => el.id === closest.id);

    if (fromIdx < toIdx) {
      containerRef.current?.insertBefore(closest, dragging);
    } else {
      containerRef.current?.insertBefore(dragging, closest);
    }
  };

  // const handleContainerDragEnd: React.DragEventHandler<HTMLUListElement> =
  //   useCallback((ev) => {
  //     const draggable = ev.currentTarget as Element;
  //     const dragItem = getDragItem(draggable);
  //     if (!dragItem) return;
  //     dragItem.classList.remove("dragging");
  //   }, []);

  useEffect(() => {
    if (containerRef.current) {
      const dragItems = [
        ...containerRef.current.querySelectorAll(".dragitem:not(.dragging)"),
      ];

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
