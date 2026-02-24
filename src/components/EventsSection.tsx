import { useState } from "react";
import { MapPin, Clock } from "lucide-react";
import event1Img from "@/assets/event-1.jpg";
import event2Img from "@/assets/event-2.jpg";
import event3Img from "@/assets/event-3.jpg";

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
    category: "ETHANIEL 2025",
    title: "PARTAKERS OF THE HOLYGHOST",
    description:
      "At WaterGate Church, our events are moments of alignment, transformation, and community. From intimate trainings to weekly gatherings, each meeting is designed to be...",
    dateRange: "18TH - 21ST DEC, 2025",
    time: "STARTS 8:00AM AT THURS...",
    location: "THE WATERGATE CHURCH, JIBOWU, BUS-STOP, OJU ORE, OTA...",
    attendees: "100+ Attending",
    registration: "Free Registration Required",
  },
  {
    id: 2,
    image: event2Img,
    category: "HOLY GHOST DINNER",
    title: "RIVERS OF LIVING WATER",
    description:
      "At WaterGate Church, our events are moments of alignment, transformation, and community. From intimate trainings to weekly gatherings, each meeting is designed to be...",
    dateRange: "20TH DEC, 2025",
    time: "STARTS 8:00AM AT THURS...",
    location: "THE WATERGATE CHURCH, JIBOWU, BUS-STOP, OJU ORE, OTA...",
    attendees: "100+ Attending",
    registration: "Free Registration Required",
  },
  {
    id: 3,
    image: event3Img,
    category: "ETHANIEL 2025",
    title: "PARTAKERS OF THE HOLYGHOST",
    description:
      "At WaterGate Church, our events are moments of alignment, transformation, and community. From intimate trainings to weekly gatherings, each meeting is designed to be...",
    dateRange: "18TH - 21ST DEC, 2025",
    time: "STARTS 8:00AM AT THURS...",
    location: "THE WATERGATE CHURCH, JIBOWU, BUS-STOP, OJU ORE, OTA...",
    attendees: "100+ Attending",
    registration: "Free Registration Required",
  },
];

const EventCard = ({ event }: { event: EventData }) => (
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
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {event.category}
          </span>
          <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mt-1 mb-3">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1.5 rounded-full">
            <Clock size={12} />
            {event.dateRange}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1.5 rounded-full">
            <Clock size={12} />
            {event.time}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <MapPin size={12} />
          <span>{event.location}</span>
        </div>
      </div>

      {/* Right info */}
      <div className="flex flex-col items-start md:items-end justify-between md:min-w-[180px]">
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">
            {event.attendees}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Open to All
          </p>
        </div>
        <div className="flex flex-col items-start md:items-center gap-3 mt-4">
          <img
            src={event.image}
            alt="Church logo"
            className="w-20 h-10 object-contain rounded"
          />
          <p className="text-[10px] text-muted-foreground">
            {event.registration}
          </p>
          <button className="bg-primary text-primary-foreground text-sm font-semibold px-8 py-2.5 rounded-full hover:opacity-90 transition-opacity">
            REGISTER
          </button>
        </div>
      </div>
    </div>
  </div>
);

const EventsSection = () => {
  const [activeTab, setActiveTab] = useState<string>("UPCOMING");

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Heading */}
        <h2 className="font-heading text-3xl md:text-5xl font-medium text-center text-foreground italic mb-10">
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
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
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
          <button className="border border-foreground text-foreground text-xs font-semibold tracking-widest px-8 py-3 rounded-full hover:bg-foreground hover:text-background transition-colors">
            VIEW ALL EVENTS
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
