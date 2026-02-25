import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WelcomeSection from "@/components/WelcomeSection";
import JoinCards from "@/components/JoinCards";
import EventsSection from "@/components/EventsSection";
import LatestMediaSection from "@/components/LatestMediaSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <WelcomeSection />
      <JoinCards />
      <EventsSection />
      <LatestMediaSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
