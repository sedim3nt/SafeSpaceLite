import { useState, useEffect, useCallback } from 'react';

const MIN_TIME_ON_FORM_MS = 10_000;

export function useFormBehavior() {
  const [mountTime] = useState(() => Date.now());
  const [hasTyped, setHasTyped] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - mountTime >= MIN_TIME_ON_FORM_MS) {
        setTimeElapsed(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mountTime]);

  const onKeyActivity = useCallback(() => {
    if (!hasTyped) setHasTyped(true);
  }, [hasTyped]);

  return {
    /** True when behavior looks human: 10s elapsed + keyboard activity + honeypot empty */
    isHumanLikely: timeElapsed && hasTyped && honeypot === '',
    onKeyActivity,
    /** Honeypot value — bind to a hidden input. If filled, submission is blocked. */
    honeypot,
    setHoneypot,
  };
}
