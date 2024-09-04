import { useCallback, useEffect, useState } from 'react';

// This is Temporary... Will replace with useSWR in after confirmation of adding libraries to the project

export function useAsync<TData, TParams extends any[] = never[]>(
  callback: (...args: TParams) => Promise<TData>
) {
  const [data, setData] = useState<TData | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const executeAsync = useCallback(
    async (...args: TParams) => {
      setPending(true);
      const promise = callback(...args);

      promise
        .then(setData)
        .catch(setError)
        .finally(() => setPending(false));

      return promise;
    },
    [callback]
  );

  const execute = useCallback((...args: TParams) => {
    // Safe execution of the callback
    executeAsync(...args).catch();
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
    setPending(false);
  }, []);

  useEffect(() => {
    if (!error) return;
    console.error(error);
  }, [error]);

  return { data, pending, error, execute, executeAsync, clear };
}
