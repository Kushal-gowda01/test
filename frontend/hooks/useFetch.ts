import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface UseFetchOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(url: string, options: UseFetchOptions = {}): UseFetchResult<T> {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<T>(url);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!refetchInterval || !enabled) return;
    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, refetchInterval, enabled]);

  return { data, loading, error, refetch: fetchData };
}
