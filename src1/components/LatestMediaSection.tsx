import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Search, ChevronLeft, ChevronRight, List } from "lucide-react";
import mediaIcon from "@/assets/media_icon.png";
import { getMedia } from "@/lib/api";

// --- Interfaces ---
interface MediaItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  category: 'sermons' | 'worship' | 'announcements' | 'other';
  author: string;
  description: string;
  createdAt: string;
  duration: string;
}

// --- Helper: Format PT1H15M58S -> 1:15:58 ---
const formatDuration = (isoDuration: string) => {
  if (!isoDuration) return "00:00";
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return isoDuration;

  const hours = match[1] ? `${match[1]}:` : "";
  const minutes = (match[2] || "0").padStart(2, '0');
  const seconds = (match[3] || "00").padStart(2, '0');

  return `${hours}${minutes}:${seconds}`;
};

// --- Sub-Component: Row ---
const MediaRow = ({ item, index }: { item: MediaItem; index: number }) => {
  const displayDate = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-3 border-b border-border hover:bg-sky-50/40 transition-colors">
      <span className="text-sm font-semibold text-black w-5">{index}</span>
      <img src={item.thumbnail || mediaIcon} alt={item.title} className="w-10 h-10 rounded object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-black/70">{displayDate} · {item.category.toUpperCase()}</p>
        <p className="text-sm font-semibold text-black truncate">{item.title}</p>
        <p className="text-[10px] uppercase tracking-wider text-black/70">{item.author.toUpperCase()}</p>
      </div>
      <span className="text-xs text-black/70">{item.duration}</span>
    </a>
  );
};

// --- Main Component ---
export default function LatestMediaSection() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("SERMON");
  const [sort, setSort] = useState("recent");
  const [query, setQuery] = useState("");

  // Fetch logic
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getMedia(page, 10);
      
      // Transform raw backend data to MediaItem
      const transformed = response.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        url: item.videoUrl || `https://youtube.com/watch?v=${item.videoId}`,
        thumbnail: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
        category: item.category?.[0]?.toLowerCase() || 'other',
        author: item.speaker || item.author || "UNKNOWN",
        description: item.description || '',
        createdAt: item.createdAt,
        duration: formatDuration(item.duration)
      }));

      setItems(transformed);
      setTotalPages(response.pagination.totalPages);
      setLoading(false);
    };
    fetchData();
  }, [page]); 
  
  const displayItems = useMemo(() => {
    let list = [...items];
    if (query) list = list.filter(i => i.title.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'atoz') list.sort((a,b) => a.title.localeCompare(b.title));
    return list;
  }, [items, query, sort]);

  const leftColumn = displayItems.slice(0, 5);
  const rightColumn = displayItems.slice(5, 10);

  return (
    <section className="py-16 bg-background container max-w-5xl mx-auto px-4">
      <h2 className="text-3xl font-medium mb-8">Latest Media</h2>
      
      {/* Navigation */}
      <div className="flex gap-4 border-b border-border mb-8">
        {["SERMON", "WORSHIP", "RESOURCES"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`pb-3 text-xs font-semibold ${activeTab === t ? 'text-sky-600 border-b-2 border-sky-600' : 'text-black/60'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="grid md:grid-cols-2 gap-10">
          <div>{leftColumn.map((item, i) => <MediaRow key={item.id} item={item} index={((page - 1) * 10) + i + 1} />)}</div>
          <div>{rightColumn.map((item, i) => <MediaRow key={item.id} item={item} index={((page - 1) * 10) + leftColumn.length + i + 1} />)}</div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 border rounded-full">
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs">PAGE {page} OF {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 border rounded-full">
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}