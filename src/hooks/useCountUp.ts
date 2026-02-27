import { useEffect, useState } from "react";

interface UseCountUpOptions {
  durationMs?: number;
  start?: number;
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export function useCountUp(target: number, options?: UseCountUpOptions) {
  const durationMs = options?.durationMs ?? 1800;
  const start = options?.start ?? 0;
  const [value, setValue] = useState(start);

  useEffect(() => {
    if (!Number.isFinite(target) || !Number.isFinite(start)) {
      setValue(0);
      return;
    }

    if (durationMs <= 0) {
      setValue(target);
      return;
    }

    let frameId = 0;
    let startedAt: number | null = null;

    const tick = (timestamp: number) => {
      if (startedAt === null) startedAt = timestamp;
      const progress = Math.min((timestamp - startedAt) / durationMs, 1);
      const eased = easeOutCubic(progress);
      setValue(start + (target - start) * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    setValue(start);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [durationMs, start, target]);

  return value;
}
