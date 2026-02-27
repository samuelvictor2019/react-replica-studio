import Navbar from "@/components/Navbar";
import MediaHero from "@/components/MediaHero";
import LatestMediaSection from "@/components/LatestMediaSection";
import MediaNotice from "@/components/MediaNotice";
import Footer from "@/components/Footer";
import mediaThumb from "@/assets/media_hub.jpg";

const Media = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <MediaHero />

      <section className="py-12 md:py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-medium text-black mb-4">The Media hub of The WaterGate Church</h2>
              <p className="text-sm text-black/70 max-w-md">Explore our sermons, worship sessions and resources. Watch, listen and engage with content designed to help you encounter God and grow in faith.</p>
            </div>

            <div className="overflow-hidden rounded-[18px]">
              <img src={mediaThumb} alt="Media hub" className="w-full h-56 md:h-72 object-cover" />
            </div>
          </div>
        </div>
      </section>

      <LatestMediaSection />

      <MediaNotice />

      <Footer />
    </div>
  );
};

export default Media;
