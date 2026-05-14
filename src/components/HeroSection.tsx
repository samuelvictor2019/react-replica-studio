import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative bg-white text-black">
      {/* Top content */}
      <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {/* Heading */}
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] max-w-lg hero-fade delay-1">
            Expressing
            <br />
            His Fullness
          </h1>

          {/* Description */}
          <div className="max-w-sm hero-fade delay-2">
            <p className="text-sm leading-relaxed text-black/70 mb-4">
              WaterGate Church is a thriving community where God's presence, 
              truth, and love shape everything we do. Here, you'll grow, 
              be equipped, and find a family that walks with you in faith.
            </p>
            <a
              href="/about#about-twc-ph"
              className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600 text-xs font-semibold tracking-widest hover:gap-3 transition-all hero-fade delay-3"
            >
              LEARN MORE <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Hero Image (use Forms hero styling to avoid jagged edges) */}
      <div className="w-full">
        <img
          src={heroImage}
          alt="Pastor preaching at WaterGate Church"
          className="w-full h-auto object-contain hero-fade delay-2"
        />
      </div>
    </section>
  );
};

export default HeroSection;
