import { useEffect, useRef, useState } from "react";

/** Smoothly animates a number toward its target using rAF + easing. */
export function useAnimatedCounter(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const next = Math.round(from + (target - from) * eased);
      setValue(next);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, durationMs]);

  return value;
}
