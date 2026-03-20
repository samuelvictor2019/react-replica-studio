import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, Search, ChevronLeft, ChevronRight, List } from "lucide-react";
import mediaIcon from "@/assets/media_icon.png";

const tabs = ["SERMON", "WORSHIP", "RESOURCES"] as const;

interface MediaItem {
  id: number;
  date: string;
  title: string;
  speaker: string;
  duration: string;
  createdAt: string; // ISO date
  views?: number;
}

const mediaItems: MediaItem[] = [
  { id: 1, date: "AUG 2025", title: "Partakers Of The HolyGhost (PART ONE)", speaker: "APOSTLE ADEBOWALE ADESINA", duration: "1:19:00", createdAt: "2025-08-01T10:00:00Z", views: 1200 },
  { id: 2, date: "JUL 2025", title: "Walking in the Spirit", speaker: "APOSTLE ADEBOWALE ADESINA", duration: "0:45:00", createdAt: "2025-07-18T10:00:00Z", views: 900 },
  { id: 3, date: "JUN 2025", title: "Kingdom Living", speaker: "APOSTLE ADEBOWALE ADESINA", duration: "1:02:00", createdAt: "2025-06-10T10:00:00Z", views: 1500 },
  { id: 4, date: "MAY 2025", title: "Faith That Moves", speaker: "APOSTLE ADEBOWALE ADESINA", duration: "0:58:00", createdAt: "2025-05-05T10:00:00Z", views: 700 },
  { id: 5, date: "APR 2025", title: "Prayer & Fasting", speaker: "APOSTLE ADEBOWALE ADESINA", duration: "1:12:00", createdAt: "2025-04-12T10:00:00Z", views: 640 },
  { id: 6, date: "MAR 2025", title: "The Lord's Provision", speaker: "APOSTLE ADEBOWALE ADESINA", duration: "0:50:00", createdAt: "2025-03-22T10:00:00Z", views: 430 },
  { id: 7, date: "FEB 2025", title: "Called to Serve", speaker: "APOSTLE ADEBOWALE ADESINA", duration: "0:39:00", createdAt: "2025-02-14T10:00:00Z", views: 270 },
  { id: 8, date: "JAN 2025", title: "New Beginnings", speaker: "APOSTLE ADEBOWALE ADESINA", duration: "1:05:00", createdAt: "2025-01-06T10:00:00Z", views: 1900 },
];

const MediaRow = ({ item, index }: { item: MediaItem; index: number }) => (
  <div className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
    <span className="text-sm font-semibold text-black w-5">{index}</span>
    <img src={mediaIcon} alt="media" className="w-10 h-10 rounded object-cover flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-black/70">
        {item.date} · PARTAKERS OF THE HOLYGHOST
      </p>
      <p className="text-sm font-semibold text-black truncate">{item.title}</p>
      <p className="text-[10px] uppercase tracking-wider text-black/70">{item.speaker}</p>
    </div>
    <span className="text-xs text-black/70 flex-shrink-0">{item.duration}</span>
  </div>
);

const LatestMediaSection = () => {
  const [activeTab, setActiveTab] = useState<string>("SERMON");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<string>("recent");
  const [showSearch, setShowSearch] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = mediaItems.filter((m) => m.title.toLowerCase().includes(q) || m.speaker.toLowerCase().includes(q));

    switch (sort) {
      case "newest":
        list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "oldest":
        list = list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case "mostviewed":
        list = list.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "atoz":
        list = list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // recent (by createdAt desc)
        list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }

    return list;
  }, [query, sort]);

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
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-black">Latest Media</h2>
            {/* <p className="text-sm text-black/60">Sermons, worship and resources</p> */}
          </div>

          <a href="#" className="hidden md:inline-flex items-center gap-1 text-xs font-semibold tracking-widest text-black uppercase hover:text-primary transition-colors">
            VIEW ALL MEDIA <ArrowRight size={14} />
          </a>
        </div>

        {/* Tabs + controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4 sm:gap-6 border-b border-border pb-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <div>
            {leftColumn.map((item, i) => (
              <MediaRow key={item.id} item={item} index={i + 1} />
            ))}
          </div>
          <div>
            {rightColumn.map((item, i) => (
              <MediaRow key={item.id} item={item} index={i + 5} />
            ))}
          </div>
        </div>

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
            <a href="#" className="inline-flex items-center gap-1 text-xs font-semibold tracking-widest text-black uppercase">
              VIEW ALL MEDIA <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestMediaSection;
