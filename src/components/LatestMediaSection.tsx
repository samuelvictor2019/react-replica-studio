import { useState } from "react";
import { ArrowRight } from "lucide-react";
import mediaIcon from "@/assets/media_icon.png";

const tabs = ["SERMON", "WORSHIP", "RESOURCES"] as const;

interface MediaItem {
  id: number;
  date: string;
  title: string;
  speaker: string;
  duration: string;
}

const mediaItems: MediaItem[] = [
  { id: 1, date: "AUG 2025", title: "Partakers Of The HolyGhost (PART ONE)", speaker: "APOSTLE ADEDIWALE ADEKOLA", duration: "1:19:00" },
  { id: 2, date: "AUG 2025", title: "Partakers Of The HolyGhost (PART ONE)", speaker: "APOSTLE ADEDIWALE ADEKOLA", duration: "1:19:00" },
  { id: 3, date: "AUG 2025", title: "Partakers Of The HolyGhost (PART ONE)", speaker: "APOSTLE ADEDIWALE ADEKOLA", duration: "1:19:00" },
  { id: 4, date: "AUG 2025", title: "Partakers Of The HolyGhost (PART ONE)", speaker: "APOSTLE ADEDIWALE ADEKOLA", duration: "1:19:00" },
  { id: 5, date: "AUG 2025", title: "Partakers Of The HolyGhost (PART ONE)", speaker: "APOSTLE ADEDIWALE ADEKOLA", duration: "1:19:00" },
  { id: 6, date: "AUG 2025", title: "Partakers Of The HolyGhost (PART ONE)", speaker: "APOSTLE ADEDIWALE ADEKOLA", duration: "1:19:00" },
  { id: 7, date: "AUG 2025", title: "Partakers Of The HolyGhost (PART ONE)", speaker: "APOSTLE ADEDIWALE ADEKOLA", duration: "1:19:00" },
  { id: 8, date: "AUG 2025", title: "Partakers Of The HolyGhost (PART ONE)", speaker: "APOSTLE ADEDIWALE ADEKOLA", duration: "1:19:00" },
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

  const leftColumn = mediaItems.slice(0, 4);
  const rightColumn = mediaItems.slice(4, 8);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-heading text-3xl md:text-4xl font-medium text-black">
            Latest Media
          </h2>
          <a
            href="#"
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold tracking-widest text-black uppercase hover:text-primary transition-colors"
          >
            VIEW ALL MEDIA <ArrowRight size={14} />
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-semibold tracking-widest transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-black/60 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
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

        {/* Mobile view all */}
        <div className="flex justify-center mt-8 md:hidden">
          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs font-semibold tracking-widest text-black uppercase"
          >
            VIEW ALL MEDIA <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default LatestMediaSection;
