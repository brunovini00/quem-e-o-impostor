import { useCallback, useEffect, useRef, useState } from 'react';
export function useCountdown(seconds: number, active: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const deadline = useRef(0);
  const started = useRef(false);
  const expired = useRef(false);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);
  useEffect(() => {
    if (!active || started.current || seconds === 0) return;
    started.current = true;
    deadline.current = Date.now() + seconds * 1000;
    setRunning(true);
  }, [active, seconds]);
  useEffect(() => {
    if (!running || !active) return;
    const tick = () => {
      const next = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        setRunning(false);
        if (!expired.current) {
          expired.current = true;
          onExpireRef.current();
        }
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running, active]);
  const toggle = useCallback(() => {
    if (!active) return;
    if (running) {
      setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
      setRunning(false);
    } else if (remaining > 0) {
      deadline.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  }, [remaining, running, active]);
  return { remaining, running: running && active, toggle };
}
