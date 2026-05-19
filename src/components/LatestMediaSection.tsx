import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Search, ChevronLeft, ChevronRight, List } from "lucide-react";
import mediaIcon from "@/assets/media_icon.png";
import { getMedia } from "@/lib/api";

const tabs = ["SERMON", "WORSHIP", "RESOURCES"] as const;

interface MediaItem {
  id: string;
  title: string;
  type: 'youtube' | 'image' | 'video';
  url: string;
  thumbnail?: string;
  category: 'sermons' | 'worship' | 'announcements' | 'other';
  author?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiMediaItem {
  id: string;
  title: string;
  type: 'youtube' | 'image' | 'video';
  url: string;
  thumbnail?: string;
  category: 'sermons' | 'worship' | 'announcements' | 'other';
  author?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const hardcodedMediaItems: MediaItem[] = [
  { id: 'hardcoded-1', title: 'Partakers Of The HolyGhost (PART ONE)', type: 'youtube', url: 'https://youtube.com/watch?v=example1', category: 'sermons', author: 'APOSTLE ADEBOWALE ADESINA', createdAt: '2025-08-01T10:00:00Z', updatedAt: '2025-08-01T10:00:00Z' },
  { id: 'hardcoded-2', title: 'Walking in the Spirit', type: 'youtube', url: 'https://youtube.com/watch?v=example2', category: 'sermons', author: 'APOSTLE ADEBOWALE ADESINA', createdAt: '2025-07-18T10:00:00Z', updatedAt: '2025-07-18T10:00:00Z' },
  { id: 'hardcoded-3', title: 'Kingdom Living', type: 'youtube', url: 'https://youtube.com/watch?v=example3', category: 'sermons', author: 'APOSTLE ADEBOWALE ADESINA', createdAt: '2025-06-10T10:00:00Z', updatedAt: '2025-06-10T10:00:00Z' },
  { id: 'hardcoded-4', title: 'Faith That Moves', type: 'youtube', url: 'https://youtube.com/watch?v=example4', category: 'sermons', author: 'APOSTLE ADEBOWALE ADESINA', createdAt: '2025-05-05T10:00:00Z', updatedAt: '2025-05-05T10:00:00Z' },
  { id: 'hardcoded-5', title: 'Prayer & Fasting', type: 'youtube', url: 'https://youtube.com/watch?v=example5', category: 'sermons', author: 'APOSTLE ADEBOWALE ADESINA', createdAt: '2025-04-12T10:00:00Z', updatedAt: '2025-04-12T10:00:00Z' },
  { id: 'hardcoded-6', title: "The Lord's Provision", type: 'youtube', url: 'https://youtube.com/watch?v=example6', category: 'sermons', author: 'APOSTLE ADEBOWALE ADESINA', createdAt: '2025-03-22T10:00:00Z', updatedAt: '2025-03-22T10:00:00Z' },
  { id: 'hardcoded-7', title: 'Called to Serve', type: 'youtube', url: 'https://youtube.com/watch?v=example7', category: 'sermons', author: 'APOSTLE ADEBOWALE ADESINA', createdAt: '2025-02-14T10:00:00Z', updatedAt: '2025-02-14T10:00:00Z' },
  { id: 'hardcoded-8', title: 'New Beginnings', type: 'youtube', url: 'https://youtube.com/watch?v=example8', category: 'sermons', author: 'APOSTLE ADEBOWALE ADESINA', createdAt: '2025-01-06T10:00:00Z', updatedAt: '2025-01-06T10:00:00Z' },
];

const MediaRow = ({ item, index }: { item: MediaItem; index: number }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  };

  const getCategoryDisplay = (category: string) => {
    switch (category) {
      case 'sermons': return 'SERMON';
      case 'worship': return 'WORSHIP';
      case 'announcements': return 'ANNOUNCEMENT';
      case 'other': return 'RESOURCE';
      default: return 'MEDIA';
    }
  };

  const displayDate = formatDate(item.createdAt);
  const displayCategory = getCategoryDisplay(item.category);
  const displayTitle = item.title;
  const displaySpeaker = String(item.author || 'UNKNOWN MINISTER').toUpperCase();
  const displayDuration = item.type === 'youtube' ? 'VIDEO' : item.type === 'video' ? 'VIDEO' : 'IMAGE';
  const displayThumbnail = item.thumbnail || mediaIcon;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 py-3 border-b border-border last:border-b-0 hover:bg-sky-50/40 transition-colors"
    >
      <span className="text-sm font-semibold text-black w-5">{index}</span>
      <img src={displayThumbnail} alt={displayTitle} className="w-10 h-10 rounded object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-black/70">
          {displayDate} · {displayCategory}
        </p>
        <p className="text-sm font-semibold text-black truncate">{displayTitle}</p>
        <p className="text-[10px] uppercase tracking-wider text-black/70">{displaySpeaker}</p>
      </div>
      <span className="text-xs text-black/70 flex-shrink-0">{displayDuration}</span>
    </a>
  );
};

const LatestMediaSection = () => {
  const [activeTab, setActiveTab] = useState<string>("SERMON");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<string>("recent");
  const [showSearch, setShowSearch] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  // Fetch media from API
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiMedia = await getMedia();

        // Transform API media to match component's expected format
        const transformedMedia = apiMedia.map((item: any) => ({
          id: item.id,
          title: item.title,
          author: item.author || item.speaker || item.preacher || item.singer || '',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt || item.createdAt,
          type: item.type,
          url: item.url,
          thumbnail: item.thumbnail,
          category: item.category,
          description: item.description
        }));

        setMediaItems(transformedMedia);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load media');
        console.error('Error fetching media:', err);
        // Fallback to hardcoded media
        setMediaItems(hardcodedMediaItems);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const filtered = useMemo(() => {
    if (loading) return [];

    // Determine which data to use
    let dataToUse: MediaItem[] = [];

    if (mediaItems.length >= 3) {
      // Show only API data when 3 or more items
      dataToUse = mediaItems;
    } else {
      // Show API data + hardcoded data when 2 or fewer items
      dataToUse = [...mediaItems, ...hardcodedMediaItems];
    }

    const q = query.trim().toLowerCase();
    let list = dataToUse.filter((m) =>
      m.title.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      String(m.category).toLowerCase().includes(q) ||
      m.author?.toLowerCase().includes(q)
    );

    // Filter by active tab
    if (activeTab !== "ALL") {
      const categoryMap: Record<string, string[]> = {
        "SERMON": ["sermons"],
        "WORSHIP": ["worship"],
        "RESOURCES": ["announcements", "other"]
      };
      const targetCategories = categoryMap[activeTab];
      if (targetCategories) {
        list = list.filter(m => targetCategories.includes(String(m.category).toLowerCase()));
      }
    }

    switch (sort) {
      case "newest":
        list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "oldest":
        list = list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case "atoz":
        list = list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // recent (by createdAt desc)
        list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }

    return list;
  }, [query, sort, activeTab, mediaItems, loading]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const leftColumn = pageItems.slice(0, Math.ceil(pageItems.length / 2));
  const rightColumn = pageItems.slice(Math.ceil(pageItems.length / 2));

  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-heading text-[clamp(1.8rem,5vw,2.5rem)] font-medium text-black">Latest Media</h2>
            {/* <p className="text-sm text-black/60">Sermons, worship and resources</p> */}
          </div>

          <Link to="/media" className="hidden md:inline-flex items-center gap-1 text-xs font-semibold tracking-widest text-black uppercase hover:text-primary transition-colors">
            VIEW ALL MEDIA <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tabs + controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex gap-4 sm:gap-6 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[10px] sm:text-xs font-semibold tracking-widest transition-colors ${
                  activeTab === tab
                    ? "text-sky-600 border-b-2 border-sky-300"
                    : "text-black/60 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Controls: hidden on the homepage */}
          {!isHome && (
            <div className="flex items-center gap-1 sm:gap-3 ml-2 flex-shrink-0">
              {/* Search */}
              <div className="flex-shrink-0">
                {!showSearch ? (
                  <button onClick={() => setShowSearch(true)} aria-label="Open search" className="p-1.5 sm:p-2">
                    <Search className="text-foreground/60" size={16} />
                  </button>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-foreground/40" size={14} />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                      placeholder="Search"
                      className="pl-7 pr-2 py-1.5 border-b border-border bg-transparent text-xs w-24 sm:w-48 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="flex-shrink-0">
                {!showSort ? (
                  <button onClick={() => setShowSort(true)} aria-label="Open sort" className="p-1.5 sm:p-2">
                    <List className="text-foreground/60" size={16} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <List className="text-foreground/60 flex-shrink-0" size={14} />
                    <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="text-xs border-b border-border bg-transparent px-1 py-1.5 focus:outline-none">
                      <option value="recent">Recent</option>
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="mostviewed">Most Viewed</option>
                      <option value="atoz">A-Z</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Media Grid - two columns */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
              <p className="text-sm text-black/60">Loading media...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">Failed to load media</p>
              <p className="text-xs text-black/60">{error}</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-sm text-black/60">No media found</p>
              {query && <p className="text-xs text-black/40 mt-1">Try adjusting your search or filters</p>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <div>
              {leftColumn.map((item, i) => (
                <MediaRow key={item.id} item={item} index={start + i + 1} />
              ))}
            </div>
            <div>
              {rightColumn.map((item, i) => (
                <MediaRow key={item.id} item={item} index={start + leftColumn.length + i + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Pagination + mobile view all */}
        <div className="mt-8">
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-3 bg-background rounded-full border border-border hover:bg-sky-100 hover:text-black transition-colors">
              <ChevronLeft />
            </button>

            <div className="flex items-center gap-3">
              {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`text-sm ${currentPage === i + 1 ? 'text-sky-600 font-semibold' : 'text-black/60'}`}>
                    {i + 1}
                  </button>
                ))}
            </div>

            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-3 bg-background rounded-full border border-border hover:bg-sky-100 hover:text-black transition-colors">
              <ChevronRight />
            </button>
          </div>

          <div className="flex justify-center mt-4 md:hidden">
            <Link to="/media" className="inline-flex items-center gap-1 text-xs font-semibold tracking-widest text-black uppercase hover:text-primary transition-colors">
              VIEW ALL MEDIA <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestMediaSection;
