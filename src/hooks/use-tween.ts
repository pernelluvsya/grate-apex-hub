import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { MOTION } from '@/constants/motion';

// easeOutCubic — fast start, gentle settle.
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * A number that glides to `target` (score arcs, XP counters, rings).
 * Runs on requestAnimationFrame for the few hundred milliseconds of the
 * change only, and jumps straight to the value under reduced motion.
 */
export function useTween(target: number, duration: number = MOTION.significant, delay = 0) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? target : 0);
  const current = useRef(value);

  useEffect(() => {
    if (reduceMotion) {
      current.current = target;
      return;
    }
    const from = current.current;
    if (from === target) return;
    let frame = 0;
    let start = 0;
    const timer = setTimeout(() => {
      const step = (time: number) => {
        if (!start) start = time;
        const t = Math.min(1, (time - start) / duration);
        const next = from + (target - from) * ease(t);
        current.current = next;
        setValue(next);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, duration, delay, reduceMotion]);

  // Reduced motion: no tween at all — always the final value.
  return reduceMotion ? target : value;
}
