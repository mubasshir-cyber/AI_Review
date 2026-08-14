import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface UseLenisSmoothScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  smoothTouch?: boolean;
  touchMultiplier?: number;
  orientation?: 'vertical' | 'horizontal';
}

export function useLenisSmoothScroll<T extends HTMLElement = HTMLElement>(
  enabled = true,
  options: UseLenisSmoothScrollOptions = {}
) {
  const wrapperRef = useRef<T | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const {
      duration = 1.15,
      easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel = true,
      wheelMultiplier = 1,
      smoothTouch = false,
      touchMultiplier = 1.5,
      orientation = 'vertical',
    } = options;

    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;

    try {
      const lenis = new Lenis({
        wrapper: wrapperEl,
        content: wrapperEl.firstElementChild as HTMLElement || wrapperEl,
        duration,
        easing,
        orientation,
        gestureOrientation: orientation,
        smoothWheel,
        wheelMultiplier,
        smoothTouch,
        touchMultiplier,
        infinite: false,
      });

      lenisRef.current = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        rafIdRef.current = requestAnimationFrame(raf);
      };
      rafIdRef.current = requestAnimationFrame(raf);

      return () => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        lenis.destroy();
        lenisRef.current = null;
      };
    } catch (e) {
      console.warn('Lenis init failed, falling back to native scroll:', e);
      return;
    }
  }, [
    enabled,
    options.duration,
    options.easing,
    options.smoothWheel,
    options.wheelMultiplier,
    options.smoothTouch,
    options.touchMultiplier,
    options.orientation,
  ]);

  return wrapperRef;
}
