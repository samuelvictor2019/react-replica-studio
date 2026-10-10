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
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 px-4 md:pl-[max(2rem,calc((100vw-64rem)/2+2rem))] md:pr-10">
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-medium text-foreground mb-4">The Media hub of The WaterGate Church</h2>
            <p className="text-sm text-muted-foreground max-w-md">Explore our sermons, worship sessions and resources. Watch, listen and engage with content designed to help you encounter God and grow in faith.</p>
          </div>

          <div className="md:w-[45%] overflow-hidden rounded-l-[18px] mt-8 md:mt-0">
            <img src={mediaThumb} alt="Media hub" className="w-full h-56 md:h-72 object-cover" />
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
