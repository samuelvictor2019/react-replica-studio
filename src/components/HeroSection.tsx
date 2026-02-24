import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative bg-foreground text-primary-foreground">
      {/* Top content */}
      <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {/* Heading */}
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium italic leading-[1.1] max-w-lg">
            Expressing
            <br />
            His Fullness
          </h1>

          {/* Description */}
          <div className="max-w-sm">
            <p className="text-sm leading-relaxed text-primary-foreground/70 mb-4">
              We are Christ-centered community of believers (star-seed) who are naturally supernatural and supernaturally natural with the mandate to see the knowledge of the glory of the LORD take over the earth as the waters cover the sea.
            </p>
            <a
              href="#about"
              className="inline-flex items-center gap-2 text-primary text-xs font-semibold tracking-widest hover:gap-3 transition-all"
            >
              LEARN MORE <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="container max-w-6xl mx-auto px-4 pb-0">
        <div className="w-full overflow-hidden rounded-t-lg">
          <img
            src={heroImage}
            alt="Pastor preaching at WaterGate Church"
            className="w-full h-[300px] md:h-[450px] lg:h-[520px] object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
