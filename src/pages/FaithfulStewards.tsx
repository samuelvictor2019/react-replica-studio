import React, { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/faithfulsteward_hero.jpg";
import communityImg1 from "@/assets/stewardslide1.jpg";
import communityImg2 from "@/assets/stewardslide2.jpg";
import communityImg3 from "@/assets/stewardslide4.jpg";
import communityImg4 from "@/assets/stewardslide5.jpg";
import communityImg5 from "@/assets/stewardslide6.jpg";
import leaderImg1 from "@/assets/steward1.jpg";
import leaderImg2 from "@/assets/stewards2.jpg";
import leaderImg3 from "@/assets/leader-31.jpg";
import { ArrowLeft, ArrowRight } from "lucide-react";

/* ── Departments data ── */
const departments = [
  { img: communityImg1, title: "Worship Team", text: "Children are a gift from the Lord. Use this form to schedule your baby's dedication and allow us to walk with you in prayer and preparation." },
  { img: communityImg2, title: "MultiMedia", text: "Comprises of the Photography, Videography, Sound and Audio, Design etc." },
  { img: communityImg3, title: "Sanitation", text: "Has God done something beautiful in your life? Share your testimony so it can encourage, strengthen, and glorify God among his people." },
  { img: communityImg4, title: "Worship & Music", text: "Children are a gift from the Lord. Use this form to schedule your baby's dedication and allow us to walk with you in prayer and preparation." },
  { img: communityImg5, title: "Protocol", text: "Comprises of the Photography, Videography, Sound and Audio, Design etc." },
  { img: leaderImg3, title: "Ushering", text: "Has God done something beautiful in your life? Share your testimony so it can encourage, strengthen, and glorify God among his people." },
  { img: communityImg1, title: "Children & Teens", text: "Children are a gift from the Lord. Use this form to schedule your baby's dedication and allow us to walk with you in prayer and preparation." },
  { img: communityImg2, title: "Evangelism", text: "Comprises of the Photography, Videography, Sound and Audio, Design etc." },
  { img: communityImg3, title: "Welfare", text: "Has God done something beautiful in your life? Share your testimony so it can encourage, strengthen, and glorify God among his people." },
];
const ITEMS_PER_PAGE = 9;

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
    text: "Build strong relationships within the church community.",
  },
  {
    img: communityImg4,
    title: "Support the Vision",
    text: "Support the vision and mission of WaterGate Church.",
  },
  {
    img: communityImg5,
    title: "Be a Part",
    text: "Be a part of what God is doing in and through His people.",
  },
];

const FaithfulStewards: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [deptPage, setDeptPage] = useState(1);
  const totalPages = Math.ceil(departments.length / ITEMS_PER_PAGE);
  const pagedDepts = departments.slice((deptPage - 1) * ITEMS_PER_PAGE, deptPage * ITEMS_PER_PAGE);
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
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[0.95] tracking-tight max-w-2xl text-foreground hero-fade delay-1">
            Stewardship, Growth,
            <br />
            and Partnership
          </h1>
        </div>

        <div className="w-full">
          <div className="w-full">
            <img
              src={heroImg}
              alt="Faithful Stewards hero"
              className="w-full h-auto object-contain hero-fade delay-2"
            />
          </div>
        </div>
      </section>

      {/* ── Every Gift Matters ── */}
      <section className="bg-background pt-16 md:pt-24 pb-0">
        <div className="mt-6 ml-4 md:ml-[max(3rem,calc((100vw-64rem)/2+3rem))]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 items-start">
            {/* Left – heading + body */}
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

            <div>
              <div className="relative mb-6">
                <div className="p-6 rounded-md max-w-[360px] mt-0 relative z-10">
                  <p className="text-sm text-foreground/80 font-medium">
                    Moreover it is required in stewards,
                    <br />
                    that a man be found faithful.
                  </p>
                  <p className="mt-4 text-sm font-semibold text-foreground/70">1 Corinthians 4:2</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width image band – no gap */}
        <div className="mt-6 ml-4 md:ml-[max(3rem,calc((100vw-64rem)/2+3rem))]">
          <div className="overflow-hidden rounded-l-[18px]">
            <img
              src={leaderImg1}
              alt="Worship and service"
              className="w-full h-72 md:h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Why Serve? ──   */}
      <section className="bg-muted/40 py-16 md:py-24 overflow-x-clip">
        <div className="mt-6 px-4 md:px-0 md:ml-[max(3rem,calc((100vw-64rem)/2+3rem))]">
          <div className="flex flex-col md:flex-row gap-8 md:gap-0 items-start">
            {/* Left – heading, text, arrows */}
            <div className="flex-shrink-0 md:w-[280px] lg:w-[320px] flex flex-col justify-center md:pr-10">
              <h2 className="font-heading text-3xl md:text-5xl font-medium text-foreground leading-tight">
                Why Serve?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-[260px]">
                We believe service is a pathway to maturity, leadership, and joy
                in the body of Christ.
              </p>
              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center text-foreground hover:bg-sky-100 hover:text-black transition-colors disabled:opacity-30"
                  aria-label="Scroll left"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center text-foreground hover:bg-sky-100 hover:text-black transition-colors"
                  aria-label="Scroll right"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Right – scrollable cards */}
            <div className="flex-1 min-w-0 w-full overflow-hidden">
              <div
                ref={scrollRef}
                onScroll={updateScroll}
                className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -ml-0"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
              >
                {serveCards.map((card) => (
                  <div
                    key={card.title}
                    className="min-w-[220px] w-[66vw] sm:w-[calc(46%-10px)] max-w-[300px] snap-start flex-shrink-0 rounded-2xl overflow-hidden bg-card group"
                  >
                    <div className="overflow-hidden">
                      <img
                        src={card.img}
                        alt={card.title}
                        className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 bg-sky-100 min-h-[200px]">
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
          </div>
        </div>
      </section>

      {/* ── Explore Our Teams ── */}
      <section className="bg-background py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight">
              Explore Our Teams,
              <br />
              Departments &amp; Units
            </h2>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Our departments are structured to help you serve with clarity,
              accountability, and grace. Each unit functions as part of one body —
              working together to create excellent, Spirit-led experiences.
            </p>
          </div>

          {/* Join button */}
          <div className="flex justify-center mb-12">
            <a
              href="/stewards/join"
              className="inline-block bg-black text-white text-xs font-semibold tracking-widest px-8 py-3 rounded-full hover:bg-sky-100 hover:text-black transition-colors"
            >
              Join a Unit
            </a>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {pagedDepts.map((dept, i) => (
              <div key={`${dept.title}-${i}`} className="group">
                <div className="overflow-hidden rounded-xl mb-4">
                  <img
                    src={dept.img}
                    alt={dept.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h4 className="font-heading text-lg font-semibold text-foreground mb-2">
                  {dept.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {dept.text}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs font-bold tracking-wider uppercase text-sky-400 hover:text-sky-500 hover:underline"
                >
                  Join Us <ArrowRight size={12} />
                </a>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setDeptPage((p) => Math.max(1, p - 1))}
                disabled={deptPage === 1}
                className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-30"
                aria-label="Previous page"
              >
                <ArrowLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setDeptPage(p)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    p === deptPage
                      ? "bg-foreground text-background"
                      : "text-foreground hover:bg-sky-100 hover:text-black"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setDeptPage((p) => Math.min(totalPages, p + 1))}
                disabled={deptPage === totalPages}
                className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-30"
                aria-label="Next page"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Find Where You Fit ── */}
      <section className="bg-background py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 px-4 md:pl-[max(2rem,calc((100vw-64rem)/2+2rem))] md:pr-10">
            <h2 className="font-heading text-3xl md:text-5xl font-medium text-foreground leading-tight mb-6">
              Find Where
              <br />
              You Fit
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground max-w-md">
              <p>
                Not sure where to serve? That's okay.
                <br />
                We're committed to helping you discover the department that aligns with your giftings, availability, and passion. You don't need to have everything figured out—we'll walk with you.
              </p>
              <div>
                <p>After signing up, a department lead will reach out to guide you through:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Orientation and expectations</li>
                  <li>Training (where required)</li>
                  <li>Integration into a department or unit</li>
                </ul>
              </div>
            </div>
            <a
              href="/stewards/join"
              className="inline-block mt-8 bg-black text-white text-xs font-semibold tracking-widest px-8 py-3 rounded-full hover:bg-sky-100 hover:text-black transition-colors"
            >
              Join a Unit
            </a>
          </div>

          <div className="md:w-[45%] overflow-hidden rounded-l-[18px] mt-8 md:mt-0">
            <img
              src={leaderImg2}
              alt="Community members"
              className="w-full h-[360px] md:h-[460px] object-cover"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FaithfulStewards;
