import React, { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/faithfulsteward_hero.jpg";
import communityImg1 from "@/assets/community-1.jpg";
import communityImg2 from "@/assets/community-2.jpg";
import communityImg3 from "@/assets/community-3.jpg";
import communityImg4 from "@/assets/community-4.jpg";
import leaderImg1 from "@/assets/leader-11.jpg";
import leaderImg2 from "@/assets/leader-21.jpg";
import leaderImg3 from "@/assets/leader-31.jpg";
import { ArrowLeft, ArrowRight } from "lucide-react";

/* ── Why Serve cards ── */
const serveCards = [
  {
    img: communityImg1,
    title: "Express your Gifts",
    text: "Express your God-given gifts in meaningful ways.",
  },
  {
    img: communityImg2,
    title: "Grow Spiritually",
    text: "Be discipled daily through responsibility and faithfulness.",
  },
  {
    img: communityImg3,
    title: "Build Relationships",
    text: "Connect with like-minded believers in community.",
  },
  {
    img: communityImg4,
    title: "Impact Lives",
    text: "Make a lasting difference in people's lives through service.",
  },
];

const FaithfulStewards: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const updateScroll = () => {
    if (!scrollRef.current) return;
    setCanScrollLeft(scrollRef.current.scrollLeft > 0);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
    setTimeout(updateScroll, 350);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-8">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] max-w-2xl text-foreground hero-fade delay-1">
            Stewardship, Growth,
            <br />
            and Partnership
          </h1>
        </div>

        <div className="w-full">
          <div className="w-full overflow-hidden group hero-fade delay-2">
            <img
              src={heroImg}
              alt="Faithful Stewards hero"
              className="w-full h-[320px] md:h-[480px] lg:h-[560px] object-cover hero-kenburns transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* ── Every Gift Matters ── */}
      <section className="bg-background py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left column */}
            <div>
              <h2 className="font-heading text-3xl md:text-5xl font-medium text-foreground leading-tight mb-6">
                Every Gift
                <br />
                Matters
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-md">
                At WaterGate Church, we believe that every believer has been
                entrusted with gifts, abilities, and grace meant to serve God
                and bless others. Serving is not just about filling a role — it's
                about stewardship, growth, and partnership in God's work.
              </p>
            </div>

            {/* Right column — quote */}
            <div className="flex flex-col justify-center">
              <span className="text-6xl md:text-8xl font-heading text-foreground/10 leading-none select-none">
                "
              </span>
              <p className="text-sm md:text-base italic text-foreground/80 max-w-sm -mt-4">
                "Moreover it is required in stewards,
                <br />
                that a man be found faithful."
              </p>
              <p className="mt-3 text-xs font-semibold tracking-widest text-foreground/60">
                — 1 Corinthians 4:2
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full-width dark image band ── */}
      <section className="w-full">
        <img
          src={leaderImg1}
          alt="Worship and service"
          className="w-full h-[300px] md:h-[420px] lg:h-[500px] object-cover"
        />
      </section>

      {/* ── Why Serve? ── */}
      <section className="bg-background py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <h2 className="font-heading text-3xl md:text-5xl font-medium text-foreground leading-tight">
                Why Serve?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-md">
                We believe service is a pathway to maturity, leadership, and joy
                in the body of Christ.
              </p>
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-30"
                aria-label="Scroll left"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors"
                aria-label="Scroll right"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Horizontal scroll cards */}
          <div
            ref={scrollRef}
            onScroll={updateScroll}
            className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {serveCards.map((card) => (
              <div
                key={card.title}
                className="min-w-[260px] max-w-[280px] snap-start flex-shrink-0 rounded-2xl overflow-hidden shadow-md bg-card group"
              >
                <div className="overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-heading text-lg font-semibold text-foreground mb-1">
                    {card.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FaithfulStewards;
