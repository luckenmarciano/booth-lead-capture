import { useState, useEffect } from 'react';

/**
 * Returns true when the viewport is at or below `breakpoint` px wide.
 * Used to switch layouts that cannot collapse with flex/grid alone
 * (side tabs -> tab strip, 2-col grids -> stacked, fixed-width sheets).
 */
export function useIsMobile(breakpoint = 640): boolean {
  const query = `(max-width: ${breakpoint}px)`;

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return isMobile;
}
