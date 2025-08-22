import { useState, useEffect, useCallback, useRef } from 'react';

export const useCountdown = (initialTime = 60) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeLeft]);

  const start = useCallback((startTime) => {
    if (startTime !== undefined) {
      setTimeLeft(startTime);
    }
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
  }, []);

  const reset = useCallback((resetTime = initialTime) => {
    setTimeLeft(resetTime);
    setIsActive(false);
    setIsPaused(false);
  }, [initialTime]);

  const restart = useCallback((restartTime = initialTime) => {
    setTimeLeft(restartTime);
    setIsActive(true);
    setIsPaused(false);
  }, [initialTime]);

  // Format time helper
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    restart,
    formattedTime: formatTime(timeLeft),
    isFinished: timeLeft === 0,
  };
};