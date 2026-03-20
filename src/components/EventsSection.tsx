import { useState, useRef, useEffect } from "react";
import { MapPin, Clock, Calendar } from "lucide-react";
import event1Img from "@/assets/event-1.png";
import event2Img from "@/assets/event-2.png";
import event3Img from "@/assets/event-3.png";

const tabs = ["UPCOMING", "THIS WEEK", "THIS MONTH"] as const;

interface EventData {
  id: number;
  image: string;
  category: string;
  title: string;
  description: string;
  dateRange: string;
  time: string;
  location: string;
  attendees: string;
  registration: string;
}

const events: EventData[] = [
  {
    id: 1,
    image: event1Img,
    category: "ETHANIM 2025",
    title: "PARTAKERS OF THE HOLYGHOST",
    description:
      "At WaterGate Church, our events are moments of alignment, transformation, and community. From intimate trainings to weekly gatherings, each meeting is designed to be...",
    dateRange: "18TH - 21ST DEC, 2025",
    time: "STARTS 8:00AM AT THURS",
    location: "THE WATERGATE CHURCH, JENDOL BUS-STOP, OJU ORE, OTA",
    attendees: "100+ Attending",
    registration: "Free Registration Required",
  },
  {
    id: 2,
    image: event2Img,
    category: "HOLY GHOST SERVICE",
    title: "RIVERS OF LIVING WATER",
    description:
      "At WaterGate Church, our events are moments of alignment, transformation, and community. From intimate trainings to weekly gatherings, each meeting is designed to be...",
    dateRange: "20TH DEC, 2025",
    time: "STARTS 8:00AM AT THURS",
    location: "THE WATERGATE CHURCH, JENDOL BUS-STOP, OJU ORE",
    attendees: "100+ Attending",
    registration: "Free Registration Required",
  },
  {
    id: 3,
    image: event3Img,
    category: "ETHANIM 2025",
    title: "PARTAKERS OF THE HOLYGHOST",
    description:
      "At WaterGate Church, our events are moments of alignment, transformation, and community. From intimate trainings to weekly gatherings, each meeting is designed to be...",
    dateRange: "18TH - 21ST DEC, 2025",
    time: "STARTS 8:00AM AT THURS",
    location: "THE WATERGATE CHURCH, JENDOL BUS-STOP, OJU ORE, OTA",
    attendees: "100+ Attending",
    registration: "Free Registration Required",
  },
];

const EventCard = ({ event }: { event: EventData }) => {
  const abbreviateDay = (text: string) => {
    if (!text) return text;
    // remove trailing ellipses and trim
    let t = text.replace(/\.\.\.+$/g, "").trim();
    // map full or partial weekday names to short forms (max 4 chars)
    const map: Record<string, string> = {
      monday: "MON",
      tuesday: "TUE",
      wednesday: "WED",
      thursday: "THUR",
      thurs: "THUR",
      friday: "FRI",
      saturday: "SAT",
      sunday: "SUN",
    };

    // replace occurrences of weekday names with abbreviations
    t = t.replace(/\b(monday|tuesday|wednesday|thursday|thurs|friday|saturday|sunday)\b/gi, (m) => {
      return map[m.toLowerCase()] || m;
    });

    return t;
  };

  const displayTime = abbreviateDay(event.time);
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const venueRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncWidth = () => {
      if (chipsRef.current && venueRef.current) {
        // Sum widths of the chip spans instead of using the container width
        const spans = Array.from(chipsRef.current.querySelectorAll('span')) as HTMLElement[];
        const total = spans.reduce((s, el) => s + el.offsetWidth, 0);
        // subtract a small amount so the venue sits within the chips' visual width,
        // then add a small buffer to account for the leading icon + gap/padding
        const adjusted = Math.max(120, total - 12) + 20;
        venueRef.current.style.width = `${adjusted}px`;
      }
    };

    syncWidth();
    window.addEventListener("resize", syncWidth);
    return () => window.removeEventListener("resize", syncWidth);
  }, [event.dateRange, event.time]);

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-card rounded-lg overflow-hidden border border-border p-4 md:p-6">
    {/* Image */}
    <div className="w-full md:w-[220px] flex-shrink-0">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-[280px] md:h-[260px] object-cover rounded-lg"
      />
    </div>

    {/* Details */}
    <div className="flex flex-col md:flex-row flex-1 gap-6">
      {/* Left info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold tracking-widest text-black/70 uppercase">
            {event.category}
          </span>
          <h3 className="font-heading text-xl md:text-2xl font-bold text-black mt-1 mb-3">
            {event.title}
          </h3>
          <p className="text-sm text-black/70 leading-relaxed">
            {event.description}
          </p>
        </div>
        <div ref={chipsRef} className="flex items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1.5 bg-sky-200 text-black text-[11px] font-semibold px-3 py-1.5 rounded-full border border-black">
            <Calendar size={12} />
            {event.dateRange}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-green-200 text-black text-[11px] font-semibold px-3 py-1.5 rounded-full border border-black">
            <Clock size={12} />
            {displayTime}
          </span>
        </div>
        <div
          ref={venueRef}
          className="inline-flex items-center gap-1.5 mt-2 text-[10px] text-black/70 border border-black px-2 py-1 rounded-full overflow-hidden whitespace-nowrap"
          style={{ width: "auto" }}
        >
          <MapPin size={16} className="flex-shrink-0 text-black/70" aria-hidden />
          <span className="leading-tight">{event.location.replace(/\.\.\.+$/, "")}</span>
        </div>
      </div>

      {/* Right info – separated by dotted vertical line */}
      <div className="flex flex-col items-start md:items-center justify-between md:min-w-[180px] md:pl-6 relative">
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 8px, hsl(0 0% 0% / 0.2) 8px, hsl(0 0% 0% / 0.2) 20px)' }} />
        <div className="md:text-center">
          <p className="text-sm font-semibold text-black">
            {event.attendees}
          </p>
          <p className="text-xs text-black/70 mt-0.5">
            Open to All
          </p>
        </div>
        <div className="flex flex-col items-start md:items-center gap-3 mt-4">
          {/* Overlapping participant initials */}
          <div className="flex -space-x-2">
            {["C", "T", "N", "A", "W"].map((initial, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                style={{
                  backgroundColor: ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"][i],
                  zIndex: 5 - i,
                }}
              >
                {initial}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-black/70 italic">
            {event.registration}
          </p>
          <button className="bg-black text-white text-sm font-semibold px-8 py-2.5 rounded-full hover:bg-sky-100 hover:text-black transition-colors">
            REGISTER
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

const EventsSection = () => {
  const [activeTab, setActiveTab] = useState<string>("UPCOMING");

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Heading */}
        <h2 className="font-heading text-3xl md:text-5xl font-medium text-center text-black mb-10">
          Explore what's
          <br />
          happening next
        </h2>

        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-10 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-semibold tracking-widest transition-colors ${
                activeTab === tab
                  ? "text-sky-600 border-b-2 border-sky-300"
                  : "text-black/60 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Event Cards */}
        <div className="flex flex-col gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {/* View All */}
        <div className="flex justify-center mt-10">
          <button className="bg-black text-white text-xs font-semibold tracking-widest px-8 py-3 rounded-full hover:bg-sky-100 hover:text-black transition-colors">
            VIEW ALL EVENTS
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
