import { useCallback, useEffect, useRef } from 'react';
import { useFetch } from './useFetch';

export interface CursorScrollResponse<T> {
  data: T[];
  finish: boolean;
}

interface UseCursorScrollOptions<T> {
  endpoint: string;
  cursorParam: string;
  getCursor: (item: T) => number;
}

export function useCursorScroll<T>({
  endpoint,
  cursorParam,
  getCursor,
}: UseCursorScrollOptions<T>) {
  const { get, loading } = useFetch<CursorScrollResponse<T>>();
  const getCursorRef = useRef(getCursor);

  useEffect(() => {
    getCursorRef.current = getCursor;
  }, [getCursor]);

  const fetchPage = useCallback(
    async (cursor?: number): Promise<CursorScrollResponse<T>> => {
      const url = cursor != null ? `${endpoint}?${cursorParam}=${cursor}` : endpoint;
      const response = await get(url);

      return response ?? { data: [], finish: true };
    },
    [cursorParam, endpoint, get],
  );

  const fetchAll = useCallback(async () => {
    const rows: T[] = [];
    let cursor: number | undefined;

    while (true) {
      const response = await fetchPage(cursor);
      rows.push(...response.data);

      if (response.finish || response.data.length === 0) {
        break;
      }

      cursor = getCursorRef.current(response.data[response.data.length - 1]);
    }

    return rows;
  }, [fetchPage]);

  return { fetchPage, fetchAll, loading };
}
