import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface RootSmoothScrollProps {
  enabled?: boolean;
  children: React.ReactNode;
}

export const RootSmoothScroll: React.FC<RootSmoothScrollProps> = ({ enabled = true, children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    try {
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 1.5,
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
      console.warn('Root Lenis init failed, falling back to native scroll:', e);
      return;
    }
  }, [enabled]);

  return <>{children}</>;
};
