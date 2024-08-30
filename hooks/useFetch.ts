import { useCallback, useEffect, useState } from 'react';

// This is Temporary... Will replace with useSWR in after confirmation of adding libraries to the project

export function useAsync<TData, TParams extends any[] = never[]>(
  callback: (...args: TParams) => Promise<TData>
) {
  const [data, setData] = useState<TData | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const execute = useCallback(async (...args: TParams) => {
    setPending(true);

    try {
      setData(await callback(...args));
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
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

  return { data, pending, error, execute, clear };
}

export function useFetch<TData>(
  url: string,
  config?: { disabled?: boolean; clearOnDisabled?: boolean }
) {
  const { disabled = false, clearOnDisabled = false } = config ?? {};

  const { execute, ...fetcher } = useAsync(async (url: string) => {
    const response = await fetch(url);
    return (await response.json()) as TData;
  });

  useEffect(() => {
    if (disabled) {
      if (clearOnDisabled) fetcher.clear();
      return;
    }

    execute(url);
  }, [url, disabled]);

  return fetcher;
}
