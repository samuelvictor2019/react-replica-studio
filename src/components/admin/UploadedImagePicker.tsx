import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown, ImageIcon, ImageOff, Link as LinkIcon, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadedImages, type UploadedImage } from '@/hooks/useUploadedImages';

type Props = {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
  id?: string;
};

const isUrl = (v: string) => /^https?:\/\/\S+$/i.test(v.trim());

/** Ask Cloudinary for a tiny, optimised thumbnail instead of the full asset. */
const thumb = (url: string, size = 96) =>
  url.includes('res.cloudinary.com') && url.includes('/upload/')
    ? url.replace('/upload/', `/upload/c_fill,w_${size},h_${size},q_auto,f_auto/`)
    : url;

const formatBytes = (b?: number) => {
  if (!b) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), units.length - 1);
  return `${(b / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
};

function useDebounced<T>(value: T, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const UploadedImagePicker = ({
  value,
  onChange,
  folder = 'wgc',
  label = 'Banner Image',
  placeholder = 'Search uploaded images or paste a URL…',
  id,
}: Props) => {
  const autoId = useId();
  const baseId = id ?? `image-picker-${autoId.replace(/:/g, '')}`;
  const listboxId = `${baseId}-listbox`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebounced(query);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  // Lazy: nothing is fetched until the user opens the dropdown.
  const { items, loading, error, hasMore, loadMore, refresh } = useUploadedImages({ folder, enabled: open });

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q || isUrl(q)) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.url.toLowerCase().includes(q));
  }, [items, debouncedQuery]);

  const showCustomUrl = isUrl(query) && !items.some((i) => i.url === query.trim());
  const optionCount = filtered.length + (showCustomUrl ? 1 : 0);

  const selected: UploadedImage | undefined = useMemo(
    () => items.find((i) => i.url === value) ?? (value ? { id: value, url: value, name: decodeURIComponent(value.split('/').pop() || value) } : undefined),
    [items, value],
  );

  // Infinite scroll: whenever the sentinel becomes visible inside the list, grow the page.
  // Re-subscribing on `filtered` change means a short (filtered) list keeps pulling
  // more data until it fills the viewport or the backend is exhausted.
  useEffect(() => {
    if (!open || !hasMore || !sentinelRef.current || !listRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && loadMore(),
      { root: listRef.current, rootMargin: '0px 0px 80px 0px' },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [open, hasMore, loadMore, filtered.length]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  useEffect(() => setActiveIndex(0), [debouncedQuery]);

  // Keep the keyboard-highlighted option in view.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const commit = useCallback(
    (url: string) => {
      onChange(url);
      setQuery('');
      setOpen(false);
    },
    [onChange],
  );

  const selectIndex = (index: number) => {
    if (showCustomUrl && index === 0) return commit(query.trim());
    const item = filtered[index - (showCustomUrl ? 1 : 0)];
    if (item) commit(item.url);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) return setOpen(true);
        setActiveIndex((i) => Math.min(i + 1, Math.max(optionCount - 1, 0)));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        // Never let Enter submit the parent event form while picking.
        e.preventDefault();
        if (open && optionCount) selectIndex(activeIndex);
        break;
      case 'Escape':
        if (open) {
          // Don't let Escape bubble up and close the surrounding dialog.
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
        }
        break;
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={`${baseId}-input`} className="text-sm font-medium">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Combobox */}
        <div ref={containerRef} className="relative flex-1 min-w-0">
          <div
            className={cn(
              'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-shadow',
              open && 'ring-2 ring-ring ring-offset-2',
            )}
            onClick={() => {
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              ref={inputRef}
              id={`${baseId}-input`}
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={open && optionCount ? `${baseId}-opt-${activeIndex}` : undefined}
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder={selected && !open ? selected.name : placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
            />
            {value && (
              <button
                type="button"
                id={`${baseId}-clear`}
                aria-label="Clear selected image"
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  setQuery('');
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} aria-hidden />
          </div>

          {open && (
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Uploaded images"
              className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto overscroll-contain rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
            >
              {showCustomUrl && (
                <Option
                  id={`${baseId}-opt-0`}
                  index={0}
                  active={activeIndex === 0}
                  onHover={setActiveIndex}
                  onSelect={selectIndex}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <span className="truncate">Use this URL</span>
                </Option>
              )}

              {filtered.map((item, i) => {
                const index = i + (showCustomUrl ? 1 : 0);
                return (
                  <Option
                    key={item.id}
                    id={`${baseId}-opt-${index}`}
                    index={index}
                    active={activeIndex === index}
                    selected={item.url === value}
                    onHover={setActiveIndex}
                    onSelect={selectIndex}
                  >
                    <img
                      src={thumb(item.url)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-10 shrink-0 rounded object-cover bg-muted"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[item.format?.toUpperCase(), item.width && item.height ? `${item.width}×${item.height}` : '', formatBytes(item.bytes)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    {item.url === value && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </Option>
                );
              })}

              {!loading && !error && optionCount === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {debouncedQuery ? `No images match “${debouncedQuery}”` : 'No uploaded images yet'}
                </li>
              )}

              {error && (
                <li className="flex items-center justify-between gap-2 px-3 py-3 text-sm text-destructive">
                  <span className="truncate">Couldn’t load images</span>
                  <button type="button" onClick={() => refresh()} className="inline-flex items-center gap-1 text-xs underline">
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                </li>
              )}

              {loading && (
                <li className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground" aria-live="polite">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading images…
                </li>
              )}

              {hasMore && !error && <li ref={sentinelRef} aria-hidden className="h-px" />}
            </ul>
          )}
        </div>

        {/* Preview */}
        <ImagePreview image={selected} />
      </div>
    </div>
  );
};

type OptionProps = {
  id: string;
  index: number;
  active: boolean;
  selected?: boolean;
  onHover: (i: number) => void;
  onSelect: (i: number) => void;
  children: ReactNode;
};

const Option = ({ id, index, active, selected, onHover, onSelect, children }: OptionProps) => (
  <li
    id={id}
    role="option"
    aria-selected={!!selected}
    data-index={index}
    // mousedown (not click) so the input doesn't blur first.
    onMouseDown={(e) => {
      e.preventDefault();
      onSelect(index);
    }}
    onMouseEnter={() => onHover(index)}
    className={cn(
      'flex cursor-pointer select-none items-center gap-3 rounded-sm px-2 py-1.5 text-sm',
      active && 'bg-accent text-accent-foreground',
    )}
  >
    {children}
  </li>
);

const ImagePreview = ({ image }: { image?: UploadedImage }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  useEffect(() => setStatus('loading'), [image?.url]);

  return (
    <div className="relative aspect-video w-full sm:w-44 shrink-0 overflow-hidden rounded-md border bg-muted/50">
      {!image ? (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
          <span className="text-xs">No image selected</span>
        </div>
      ) : (
        <>
          {status === 'loading' && <div className="absolute inset-0 animate-pulse bg-muted" />}
          {status === 'error' ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImageOff className="h-6 w-6" />
              <span className="text-xs">Preview unavailable</span>
            </div>
          ) : (
            <a href={image.url} target="_blank" rel="noreferrer" title={image.name} className="block h-full">
              <img
                key={image.url}
                src={image.url}
                alt={image.name}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
                className={cn('h-full w-full object-cover transition-opacity duration-300', status === 'loaded' ? 'opacity-100' : 'opacity-0')}
              />
            </a>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4 text-[11px] text-white">
            {image.name}
          </div>
        </>
      )}
    </div>
  );
};

export default UploadedImagePicker;
