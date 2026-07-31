import { useRef, useCallback } from "react";
import { showToast } from "./toast";

export function useLongPress(onLongPress: () => boolean | void, delay = 600) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moved = useRef(false);

  const onTouchStart = useCallback(() => {
    moved.current = false;
    timer.current = setTimeout(() => {
      if (!moved.current) {
        const added = onLongPress();
        if (added === true) showToast("已添加到收藏");
        else if (added === false) showToast("已取消收藏");
      }
    }, delay);
  }, [onLongPress, delay]);

  const onTouchMove = useCallback(() => { moved.current = true; }, []);

  const onTouchEnd = useCallback(() => { clearTimeout(timer.current ?? undefined); }, []);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
