import { useCallback, useEffect, useRef, useState } from 'react';
import { adminRequest } from '@/lib/adminApi';

export type UploadedImage = {
  /** Stable identifier (public id / key / url). */
  id: string;
  /** Publicly reachable URL of the asset. */
  url: string;
  /** Human-friendly name used for display + search. */
  name: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  createdAt?: string;
};

type Options = {
  folder?: string;
  pageSize?: number;
  /** Hard ceiling to protect the backend / provider limits (e.g. Cloudinary caps at 500). */
  maxLimit?: number;
  /** Defer the first request until `enabled` becomes true (e.g. dropdown opened). */
  enabled?: boolean;
};

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|bmp)(\?.*)?$/i;

const pick = <T,>(obj: any, keys: string[]): T | undefined => {
  for (const key of keys) {
    const v = obj?.[key];
    if (v !== undefined && v !== null && v !== '') return v as T;
  }
  return undefined;
};

/**
 * The upload endpoint may be backed by different storage providers, so we
 * defensively normalise the payload instead of coupling the UI to one shape.
 */
function extractList(payload: any): { list: any[]; cursor?: string } {
  const layers = [payload, payload?.data, payload?.data?.data];
  for (const layer of layers) {
    if (Array.isArray(layer)) return { list: layer };
    if (layer && typeof layer === 'object') {
      const list = pick<any[]>(layer, ['resources', 'items', 'files', 'results', 'uploads', 'images']);
      if (Array.isArray(list)) {
        const cursor = pick<string>(layer, ['nextCursor', 'next_cursor', 'nextPageToken', 'cursor']);
        return { list, cursor };
      }
    }
  }
  return { list: [] };
}

function normalizeItem(raw: any): UploadedImage | null {
  if (typeof raw === 'string') {
    return { id: raw, url: raw, name: decodeURIComponent(raw.split('/').pop() || raw) };
  }
  const url = pick<string>(raw, ['secure_url', 'secureUrl', 'url', 'publicUrl', 'public_url', 'location', 'mediaLink', 'link']);
  if (!url) return null;

  const resourceType = pick<string>(raw, ['resource_type', 'resourceType', 'mimetype', 'mimeType', 'contentType']);
  if (resourceType && !/image/i.test(resourceType) && !IMAGE_EXT.test(url)) return null;

  const rawName =
    pick<string>(raw, ['original_filename', 'originalName', 'filename', 'fileName', 'name', 'public_id', 'publicId', 'key']) ??
    url.split('/').pop()!;
  const name = decodeURIComponent(String(rawName).split('/').pop() || String(rawName));

  return {
    id: String(pick(raw, ['public_id', 'publicId', 'id', 'key', 'asset_id']) ?? url),
    url,
    name,
    width: pick<number>(raw, ['width']),
    height: pick<number>(raw, ['height']),
    bytes: pick<number>(raw, ['bytes', 'size']),
    format: pick<string>(raw, ['format', 'extension']),
    createdAt: pick<string>(raw, ['created_at', 'createdAt', 'uploadedAt', 'timeCreated']),
  };
}

/**
 * Infinite-loading list of uploaded images.
 *
 * Strategy:
 *  - If the backend returns a cursor, we use true cursor pagination (append).
 *  - Otherwise we grow `maxResults` by `pageSize` on each `loadMore()` and
 *    replace the list. `hasMore` is false once the backend returns fewer items
 *    than requested.
 * In-flight requests are aborted when superseded to avoid race conditions.
 */
export function useUploadedImages({ folder = 'wgc', pageSize = 10, maxLimit = 500, enabled = true }: Options = {}) {
  const [items, setItems] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const limitRef = useRef(pageSize);
  const cursorRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const startedRef = useRef(false);
  const hasMoreRef = useRef(true);

  const fetchPage = useCallback(
    async (mode: 'reset' | 'more') => {
      if (mode === 'more' && (loadingRef.current || !hasMoreRef.current)) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (mode === 'reset') {
        limitRef.current = pageSize;
        cursorRef.current = undefined;
      }

      const useCursor = mode === 'more' && !!cursorRef.current;
      const requested = useCursor ? pageSize : Math.min(mode === 'more' ? limitRef.current + pageSize : limitRef.current, maxLimit);

      const params = new URLSearchParams({ folder, maxResults: String(requested) });
      if (useCursor) params.set('nextCursor', cursorRef.current!);

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const payload = await adminRequest<any>(`/uploads?${params.toString()}`, { signal: controller.signal });
        if (controller.signal.aborted) return;

        const { list, cursor } = extractList(payload);
        const normalized = list.map(normalizeItem).filter((x): x is UploadedImage => !!x);

        setItems((prev) => {
          const merged = useCursor ? [...prev, ...normalized] : normalized;
          const seen = new Set<string>();
          return merged.filter((i) => (seen.has(i.url) ? false : (seen.add(i.url), true)));
        });

        cursorRef.current = cursor;
        if (!useCursor) limitRef.current = requested;

        const more = cursor ? true : list.length >= requested && requested < maxLimit;
        hasMoreRef.current = more;
        setHasMore(more);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setError(e?.message || 'Failed to load images');
      } finally {
        if (abortRef.current === controller) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folder, pageSize, maxLimit],
  );

  useEffect(() => {
    if (!enabled || startedRef.current) return;
    startedRef.current = true;
    hasMoreRef.current = true;
    fetchPage('reset');
  }, [enabled, fetchPage]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const loadMore = useCallback(() => fetchPage('more'), [fetchPage]);
  const refresh = useCallback(() => {
    hasMoreRef.current = true;
    setHasMore(true);
    return fetchPage('reset');
  }, [fetchPage]);

  return { items, loading, error, hasMore, loadMore, refresh };
}
