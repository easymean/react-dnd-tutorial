export const useSortable = () => {
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

    elements.forEach((el, idx) => {
      if (startIdx < idx && idx < endIdx) {
        (
          el as HTMLElement
        ).style.transform = `translate3d(${distX}px, ${distY}px, 0px)`;
        (el as HTMLElement).style.transition = `transform 500ms ease`;
      }
    });
  };

  return {
    setItemsTransition,
  };
};
