import Navbar from "@/components/Navbar";
import EventHero from "@/components/EventHero";
import EventExperience from "@/components/EventExperience";
import EventsSection from "@/components/EventsSection";
import EventNotice from "@/components/EventNotice";
import Footer from "@/components/Footer";

const Events = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <EventHero />

      <EventExperience />

      <EventsSection />

      <EventNotice />

      <Footer />
    </div>
  );
};

export default Events;
