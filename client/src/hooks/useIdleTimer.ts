import { useState, useEffect, useRef, useCallback } from 'react';

interface IdleTimerOptions {
  timeoutSeconds: number;
  enabled?: boolean;
  onIdle?: () => void;
  onActive?: () => void;
}

export function useIdleTimer({
  timeoutSeconds,
  enabled = true,
  onIdle,
  onActive
}: IdleTimerOptions) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<any>(null);
  const isIdleRef = useRef(false);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      onActive?.();
    }

    if (enabled && timeoutSeconds > 0) {
      timerRef.current = setTimeout(() => {
        isIdleRef.current = true;
        setIsIdle(true);
        onIdle?.();
      }, timeoutSeconds * 1000);
    }
  }, [enabled, timeoutSeconds, onIdle, onActive]);

  const wake = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled || timeoutSeconds <= 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = ['mousedown', 'mousemove', 'touchstart', 'touchmove', 'keydown', 'scroll', 'click'];

    const handleUserActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Start initial timer
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, timeoutSeconds, resetTimer]);

  return { isIdle, resetTimer, wake };
}
