import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import event1Img from "@/assets/event-1.png";
import event2Img from "@/assets/event-2.png";
import event3Img from "@/assets/event-3.png";
import { buildEventRegistrationUrl, getEvents } from "@/lib/api";

const tabs = ["UPCOMING", "THIS WEEK", "THIS MONTH"] as const;

interface EventData {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  time?: string;
  location?: string;
  bannerImage?: string;
  bannerImageUrl?: string;
  status: 'upcoming' | 'past';
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  image?: string;
  category?: string;
  dateRange?: string;
  attendees?: string;
  registration?: string;
  type?: string;
}

const hardcodedEvents: EventData[] = [
  {
    id: 'hardcoded-1',
    image: event1Img,
    category: "ETHANIM 2025",
    title: "PARTAKERS OF THE HOLYGHOST",
    description:
      "At WaterGate Church, our events are moments of alignment, transformation, and community. From intimate trainings to weekly gatherings, each meeting is designed to be...",
    dateRange: "18TH - 21ST DEC, 2025",
    time: "STARTS 8:00AM ON THURS",
    location: "THE WATERGATE CHURCH, JENDOL BUS-STOP, OJU ORE, OTA",
    attendees: "100+ Attending",
    registration: "Free Registration Required",
    status: 'upcoming',
    date: '2025-12-18T08:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'hardcoded-2',
    image: event2Img,
    category: "HOLY GHOST SERVICE",
    title: "RIVERS OF LIVING WATER",
    description:
      "At WaterGate Church, our events are moments of alignment, transformation, and community. From intimate trainings to weekly gatherings, each meeting is designed to be...",
    dateRange: "20TH DEC, 2025",
    time: "STARTS 8:00AM ON THURS",
    location: "THE WATERGATE CHURCH, JENDOL BUS-STOP, OJU ORE",
    attendees: "100+ Attending",
    registration: "Free Registration Required",
    status: 'upcoming',
    date: '2025-12-20T08:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'hardcoded-3',
    image: event3Img,
    category: "ETHANIM 2025",
    title: "PARTAKERS OF THE HOLYGHOST",
    description:
      "At WaterGate Church, our events are moments of alignment, transformation, and community. From intimate trainings to weekly gatherings, each meeting is designed to be...",
    dateRange: "18TH - 21ST DEC, 2025",
    time: "STARTS 8:00AM ON THURS",
    location: "THE WATERGATE CHURCH, JENDOL BUS-STOP, OJU ORE, OTA",
    attendees: "100+ Attending",
    registration: "Free Registration Required",
    status: 'upcoming',
    date: '2025-12-18T08:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const EventCard = ({ event }: { event: EventData }) => {
  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'TH';
      switch (day % 10) {
        case 1: return 'ST';
        case 2: return 'ND';
        case 3: return 'RD';
        default: return 'TH';
      }
    };

    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const endYear = end.getFullYear();

    if (startMonth === endMonth && start.getFullYear() === endYear) {
      return `${startDay}${getOrdinalSuffix(startDay)} - ${endDay}${getOrdinalSuffix(endDay)} ${endMonth}. ${endYear}`;
    }

    return `${startDay}${getOrdinalSuffix(startDay)} ${startMonth}. - ${endDay}${getOrdinalSuffix(endDay)} ${endMonth}. ${endYear}`;
  };

  const formatTimeDisplay = (startDate: string, timeString?: string) => {
    const date = new Date(startDate);
    const hasValidStartDate = !Number.isNaN(date.getTime());

    let formattedTime = '';

    if (hasValidStartDate) {
      const hour24 = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, '0');
      const period = hour24 >= 12 ? 'PM' : 'AM';
      const hour12 = hour24 % 12 || 12;
      formattedTime = `${hour12}:${minute}${period}`;
    } else if (timeString && timeString !== 'TBD') {
      const timeMatch = timeString.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
      if (!timeMatch) return timeString;
      const hour = parseInt(timeMatch[1], 10);
      const minute = timeMatch[2];
      const ampm = timeMatch[3]?.toUpperCase();
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      formattedTime = `${hour12}:${minute}${ampm || 'AM'}`;
    } else {
      return 'TIME TBD';
    }

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    // Map to abbreviated form
    const dayMap: Record<string, string> = {
      'MONDAY': 'MON',
      'TUESDAY': 'TUE',
      'WEDNESDAY': 'WED',
      'THURSDAY': 'THURS',
      'FRIDAY': 'FRI',
      'SATURDAY': 'SAT',
      'SUNDAY': 'SUN'
    };

    const shortDay = dayMap[dayName] || dayName;

    return `STARTS ${formattedTime} ON ${shortDay}`;
  };

  // Handle hardcoded data vs API data
  const isHardcoded = event.id.startsWith('hardcoded-');
  const displayImage = isHardcoded ? (event as any).image : (event.bannerImageUrl || event.image || event.bannerImage || event1Img);
  const displayCategory = isHardcoded ? (event as any).category : (event.type?.toUpperCase() || event.category || 'EVENT');
  const displayDateRange = isHardcoded ? (event as any).dateRange : formatDateRange(event.date, event.endDate || event.date);
  const displayTime = isHardcoded ? (event as any).time : formatTimeDisplay(event.date, event.time);
  const displayLocation = isHardcoded ? (event as any).location : event.location;
  const displayAttendees = isHardcoded ? 'Open to All' : (event as any).attendees;
  const displayRegistration = isHardcoded ? (event as any).registration : 'Everyone Welcome';
  const buttonText = isHardcoded ? 'REGISTER' : (event.status === 'upcoming' ? 'REGISTER' : 'VIEW DETAILS');
  const registerUrl = buildEventRegistrationUrl({ id: event.id, slug: event.slug });

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
  }, [displayDateRange, displayTime]);

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-sky-100/60 rounded-lg overflow-hidden border border-border p-4 md:p-6">
      {/* Image */}
      <div className="w-full md:w-[220px] flex-shrink-0">
        <img
          src={displayImage}
          alt={event.title}
          className="w-full h-[280px] md:h-[260px] object-cover rounded-lg"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col md:flex-row flex-1 gap-6">
        {/* Left info */}
        <div className="flex-1 flex flex-col">
          <div>
            <span className="text-xs font-semibold tracking-widest text-black/70 uppercase">
              {displayCategory}
            </span>
            <h3 className="font-body text-xl md:text-2xl font-bold text-black mt-1 mb-3">
              {event.title}
            </h3>
            <p className="text-sm text-black/70 leading-relaxed">
              {event.description || 'Join us for this special event at WaterGate Church.'}
            </p>
          </div>
          <div className="mt-5">
            <div ref={chipsRef} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-sky-200 text-black text-[11px] font-semibold px-3 py-1.5 rounded-full border border-black">
                <Calendar size={12} />
                {displayDateRange}
              </span>
              {displayTime && (
                <span className="inline-flex items-center gap-1.5 bg-green-200 text-black text-[11px] font-semibold px-3 py-1.5 rounded-full border border-black">
                  <Clock size={12} />
                  {displayTime}
                </span>
              )}
            </div>
            {displayLocation && (
              <div
                ref={venueRef}
                className="inline-flex items-center gap-1.5 mt-1 text-[10px] text-black/70 border border-black px-2 py-1 rounded-full overflow-hidden whitespace-nowrap"
                style={{ width: "auto" }}
              >
                <MapPin size={16} className="flex-shrink-0 text-black/70" aria-hidden />
                <span className="leading-tight">{displayLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right info – separated by dotted vertical line */}
        <div className="flex flex-col items-start md:items-center justify-between md:min-w-[180px] md:pl-6 relative">
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 8px, hsl(0 0% 0% / 0.2) 8px, hsl(0 0% 0% / 0.2) 20px)' }} />
          <div className="md:text-center">
            <p className="text-sm font-semibold text-black">
              {displayAttendees}
            </p>
            <p className="text-xs text-black/70 mt-0.5">
              {displayRegistration}
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
            {buttonText === 'REGISTER' ? (
              <Link to={registerUrl} className="bg-black text-white text-sm font-semibold px-8 py-2.5 rounded-full hover:bg-sky-100 hover:text-black transition-colors">
                {buttonText}
              </Link>
            ) : (
              <button className="bg-black text-white text-sm font-semibold px-8 py-2.5 rounded-full hover:bg-sky-100 hover:text-black transition-colors">
                {buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsSection = () => {
  const [activeTab, setActiveTab] = useState<string>("UPCOMING");
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format date ranges
  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (!end || start.toDateString() === end.toDateString()) {
      // Single day event
      return start.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).toUpperCase();
    } else {
      // Multi-day event
      const startStr = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const endStr = end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${startStr} - ${endStr}`.toUpperCase();
    }
  };

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const formatDateStr = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const todayStr = formatDateStr(now);
        const options: { fromDate?: string; toDate?: string; status?: string } = {};

        if (activeTab === "UPCOMING") {
          options.fromDate = todayStr;
          options.status = 'published';
        } else if (activeTab === "THIS WEEK") {
          options.fromDate = todayStr;
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          options.toDate = formatDateStr(weekFromNow);
        } else if (activeTab === "THIS MONTH") {
          options.fromDate = todayStr;
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          options.toDate = formatDateStr(nextMonth);
        }

        // Fetch both published and ongoing events for all tabs
        const [publishedEvents, ongoingEvents] = await Promise.all([
          getEvents({ ...options, status: 'published' }),
          getEvents({ ...options, status: 'ongoing' })
        ]);

        // Combine and deduplicate
        const seen = new Set();
        const apiEvents = [...publishedEvents, ...ongoingEvents].filter(ev => {
          if (seen.has(ev.id)) return false;
          seen.add(ev.id);
          return true;
        });

        // Transform API events to match component's expected format
        const transformedEvents = apiEvents.map((event: any) => {
          const startDate = new Date(event.startDate);
          const endDate = event.endDate ? new Date(event.endDate) : startDate;
          const now = new Date();

          // Allow registration if the event hasn't ended or if the backend explicitly marked it as ongoing
          const isRegistrable = endDate >= now || event.status === 'ongoing';

          return {
            id: event.id,
            slug: event.slug,
            image: event.bannerImageUrl || event1Img,
            category: event.eventType?.name?.toUpperCase() || event.type?.toUpperCase() || "EVENT",
            title: event.title,
            description: event.description || "Join us for this upcoming event at WaterGate Church.",
            dateRange: formatDateRange(event.startDate, event.endDate),
            time: event.dailySchedule?.[0]?.time || "TBD",
            location: event.location || "THE WATERGATE CHURCH, JENDOL BUS-STOP, OJU ORE, OTA",
            attendees: `${event.registrationCount}+ Attending`,
            registration: event.price > 0 ? `₦${event.price} Registration` : "Free Registration Required",
            status: (isRegistrable ? 'upcoming' : 'past') as 'upcoming' | 'past',
            date: event.startDate, // Add the actual date for filtering
            endDate: event.endDate,
            bannerImageUrl: event.bannerImageUrl, // Keep the original URL
            type: event.eventType?.name || event.type, // Keep the original type
            createdAt: event.createdAt || new Date().toISOString(),
            updatedAt: event.updatedAt || new Date().toISOString(),
          };
        });

        setEvents(transformedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
        console.error('Error fetching events:', err);
        // Fallback to hardcoded events
        setEvents(hardcodedEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeTab]);

  // Determine which events to display based on the logic
  const displayEvents = useMemo(() => {
    if (loading) return [];
    return events;
    // if (events.length >= 3) {
    //   // Show only API data when 3 or more items
    //   return events;
    // } else {
    //   // Show API data + hardcoded data when 2 or fewer items
    //   return [...events, ...hardcodedEvents];
    // }
  }, [events, loading]);

  // Filter events based on active tab
  const filteredEvents = useMemo(() => {
    // If the data is from the API, we trust the API's filtering which uses the fromDate and toDate.
    // We only need to filter hardcoded fallback events.
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return displayEvents.filter(event => {
      if (!event.id.startsWith('hardcoded-')) return true; // Trust API response

      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);

      if (activeTab === "UPCOMING") {
        return eventDate >= now || event.status === 'upcoming';
      } else if (activeTab === "THIS WEEK") {
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return eventDate >= now && eventDate <= weekFromNow;
      } else if (activeTab === "THIS MONTH") {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        return eventDate >= now && eventDate <= nextMonth;
      }
      return true;
    });
  }, [displayEvents, activeTab]);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Heading */}
        <h2 className="font-heading text-[clamp(1.9rem,6vw,3rem)] font-medium text-center text-black mb-10">
          Explore what's
          <br />
          happening next
        </h2>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex gap-8 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-semibold tracking-widest transition-colors ${activeTab === tab
                    ? "text-sky-600 border-b-2 border-sky-300"
                    : "text-black/60 hover:text-black"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
              <p className="text-sm text-black/60">Loading events...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">Failed to load events</p>
              <p className="text-xs text-black/60">{error}</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-sm text-black/60">No events found</p>
              <p className="text-xs text-black/40 mt-1">Check back later for upcoming events</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* View All */}
        <div className="flex justify-center mt-10">
          <Link to="/events" className="bg-black text-white text-xs font-semibold tracking-widest px-8 py-3 rounded-full hover:bg-sky-100 hover:text-black transition-colors">
            VIEW ALL EVENTS
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
