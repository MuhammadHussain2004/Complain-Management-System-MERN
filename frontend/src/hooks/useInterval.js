import { useEffect, useRef } from "react";

// Runs `callback` every `delay` ms without restarting the timer when the
// callback identity changes across renders. Pass `delay: null` to pause it.
export default function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
