import { useEffect, useState } from "react";

export function useLiveSessionTimer(startedAt, isActive) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isActive || !startedAt) return;
    const compute = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
      setElapsedSeconds(elapsed);
    };
    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [isActive, startedAt]);

  return elapsedSeconds;
}
