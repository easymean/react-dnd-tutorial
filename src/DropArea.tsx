import './droparea.scss';
import React, { useEffect, useRef } from 'react';

type Props = {
  children?: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
};

export const DropArea = ({ children, direction = 'vertical' }: Props) => {
  const areaRef = useRef<HTMLUListElement>(null);
  const ghostRef = useRef<HTMLElement>();

  const makeCustomGhost = (target: Element) => {
    const ghost = target.cloneNode(true) as HTMLElement;
    ghost.classList.add('ghost');
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.left = '-1000px';
    return ghost;
  };

  const getDragItem = (target: Element) => {
    if (areaRef.current && target) {
      const dragItems = [...areaRef.current.querySelectorAll('.dragitem')];
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

    const ghost = makeCustomGhost(dragItem);
    ghostRef.current = ghost;

    const { x, y } = getOffset(draggable, dragItem);

    // 나중에 해제해야되기 때문에 저장
    areaRef.current?.appendChild(ghost);
    ev.dataTransfer?.setDragImage(ghost, x, y);
  };

  const handleDragEnd = (ev: DragEvent) => {
    if (ghostRef.current) areaRef.current?.removeChild(ghostRef.current);
  };

  const handleDragOver: React.DragEventHandler<HTMLUListElement> = (ev) => {
    ev.preventDefault();
  };

  useEffect(() => {
    if (areaRef.current) {
      const dragItems = [...areaRef.current.querySelectorAll('.dragitem')];

      dragItems.forEach((el) => {
        const draggable = el.querySelector('[draggable=true]');
        if (draggable instanceof HTMLElement) {
          draggable.addEventListener('dragstart', handleDragStart);
          draggable.addEventListener('dragend', handleDragEnd);
        }
      });
    }
  }, []);

  return (
    <ul
      ref={areaRef}
      className={'droparea ' + direction}
      onDragOver={handleDragOver}
    >
      {children}
    </ul>
  );
};
