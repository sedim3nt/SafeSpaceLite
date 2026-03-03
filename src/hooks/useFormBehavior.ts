import { useState, useEffect, useCallback } from 'react';

const MIN_TIME_ON_FORM_MS = 10_000; // 10 seconds

/**
 * Invisible anti-bot behavioral check.
 * Tracks time on form and keystroke activity.
 * Returns `isHumanLikely` -- submit should be disabled until true.
 * Zero user friction: no CAPTCHAs, no visible indicators.
 */
export function useFormBehavior() {
  const [mountTime] = useState(() => Date.now());
  const [hasTyped, setHasTyped] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(false);

  // Check time elapsed periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - mountTime >= MIN_TIME_ON_FORM_MS) {
        setTimeElapsed(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mountTime]);

  // Call this on any keystroke in the form
  const onKeyActivity = useCallback(() => {
    if (!hasTyped) setHasTyped(true);
  }, [hasTyped]);

  return {
    isHumanLikely: timeElapsed && hasTyped,
    onKeyActivity,
  };
}
