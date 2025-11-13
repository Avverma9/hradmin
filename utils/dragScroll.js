import { useEffect, useRef } from 'react';

export const useDragScroll = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDragging = false;
    let startX = 0;
    let initialPageX = 0;
    let initialPageY = 0;
    let scrollLeft = 0;

    const startDrag = (pageX, pageY = 0) => {
      isDragging = true;
      initialPageX = pageX;
      initialPageY = pageY;
      startX = pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.classList.add('drag-active');
    };

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove('drag-active');
    };

    const dragTo = (pageX) => {
      const x = pageX - el.offsetLeft;
      const walk = x - startX;
      el.scrollLeft = scrollLeft - walk;
    };

    const onMouseDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      startDrag(e.pageX, e.pageY);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      dragTo(e.pageX);
    };

    const onMouseUp = () => stopDrag();
    const onMouseLeave = () => stopDrag();

    const onTouchStart = (e) => {
      if (!e.touches?.length) return;
      const { pageX, pageY } = e.touches[0];
      startDrag(pageX, pageY);
    };

    const onTouchMove = (e) => {
      if (!isDragging || !e.touches?.length) return;
      const { pageX, pageY } = e.touches[0];
      const deltaX = Math.abs(pageX - initialPageX);
      const deltaY = Math.abs(pageY - initialPageY);
      if (deltaX < 3 && deltaY < 3) return;
      if (deltaX <= deltaY) {
        stopDrag();
        return;
      }
      e.preventDefault();
      dragTo(pageX);
    };

    const onTouchEnd = () => stopDrag();
    const onTouchCancel = () => stopDrag();

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchCancel);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, []);

  return ref;
};
