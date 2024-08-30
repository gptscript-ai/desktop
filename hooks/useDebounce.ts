import { useCallback, useEffect, useState } from 'react';

function debounce<TParams extends any[]>(
  callback: (...args: TParams) => void,
  delay: number
) {
  let timeout: NodeJS.Timeout;

  return (params: TParams) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...params), delay);
  };
}

export function useDebounce<TParams extends any[]>(
  callback: (...args: TParams) => void,
  delay: number = 250
) {
  return useCallback(debounce(callback, delay), []);
}

export function useDebouncedValue<T>(value: T, delay: number = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value]);

  return debouncedValue;
}
