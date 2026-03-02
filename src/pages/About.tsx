import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import aboutHeroImg from "@/assets/about-hero.jpg";
import aboutWaterImg from "@/assets/about-water.jpg";
import aboutMission from "@/assets/about-mission.jpg";
import aboutVision from "@/assets/about-vision.jpg";
import aboutTwc from "@/assets/about-twc.png";
import leader1 from "@/assets/leader-1.jpg";
import leader2 from "@/assets/leader-2.jpg";
import leader3 from "@/assets/leader-3.jpg";
import leader4 from "@/assets/leader-4.jpg";
import { ArrowLeft, ArrowRight } from "lucide-react";

const leaders = [
  {
    name: "Pastor John",
    role: "Lead Pastor",
    img: leader1,
    desc: "To disciple every institution, every sphere and every nation through the transfer of the ministry of the word and the spirit without mixture.",
  },
  {
    name: "Sister Grace",
    role: "Worship Lead",
    img: leader2,
    desc: "To engage our communities as Rebuilders of Ancient Ruins, Repairers of the Breach and Restorers of Streets to dwell in.",
  },
  {
    name: "Pastor David",
    role: "Associate Pastor",
    img: leader3,
    desc: "To daily walk in the LOVE OF GOD through the expression of the ministry of Jesus; this encompasses teaching, preaching and healing in our diverse spheres of influence.",
  },
  {
    name: "Sister Faith",
    role: "Ministry Lead",
    img: leader4,
    desc: "To stand as priests, prophets and kings after the order of Melchizedek in our society, city and nation.",
  },
];

const scriptureCards = [
  {
    img: aboutWaterImg,
    title: "Ephesians 4:13",
    text: "Till we all come in the unity of the faith, and of the knowledge of the Son of God, unto a perfect man, unto the measure of the stature of the fulness of Christ.",
  },
  {
    img: aboutMission,
    title: "The Mission",
    text: "To raise a people that will stand as true and faithful witnesses, leaders and commanders across their spheres of influence by preaching Christ without distortion.",
  },
  {
    img: aboutVision, 
    title: "The Vision",
    text: "To build a people that will demonstrate the nature and attain stature of Jesus Christ until the knowledge of the glory of the LORD takes over the earth as the waters cover the sea.",
  },
];

const About = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (dir: "prev" | "next") => {
      if (isAnimating) return;
      setSlideDir(dir === "next" ? "right" : "left");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentCard((prev) =>
          dir === "next"
            ? (prev + 1) % scriptureCards.length
            : (prev - 1 + scriptureCards.length) % scriptureCards.length
        );
        setIsAnimating(false);
      }, 300);
    },
    [isAnimating]
  );

  const card = scriptureCards[currentCard];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-background text-black">
        <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] max-w-2xl hero-fade delay-1">
            Worship. Word.
            <br />
            Community. Purpose.
          </h1>
        </div>
        <div className="w-full">
          <div className="w-full">
            <img
              src={aboutHeroImg}
              alt="Worship team at WaterGate Church"
              className="w-full h-auto object-contain hero-fade delay-2"
            />
          </div>
        </div>
      </section>

      {/* About TWC — text left, image right */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Text */}
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-medium text-black mb-6">
                About TWC
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-black/70">
                <p>
                  We are a Christ-centered community of believers (star-seed) who are naturally
                  supernatural and supernaturally natural with the mandate to see the knowledge
                  of the glory of the LORD take over the earth as the waters cover the sea.
                </p>
                <p>
                  We are Oaks of Righteousness planted by the LORD in every institution, every sphere and
                  every nation for the establishment of the dominion of Christ in every domain. The will of
                  God will be done on earth and the earth as it is in heaven.
                </p>
                <p>
                  We are salt of the earth and light of the world with grace to govern and power to prevail in
                  every domain. We are believers with Divine Nature Attitude having determination to
                  accurately represent Jesus our ultimate Role Model across the earth.
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="w-full overflow-hidden" style={{ borderRadius: "40px" }}>
              <img
                src={aboutTwc}
                alt="Church community"
                className="w-full h-[320px] md:h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Scripture Carousel */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="overflow-hidden relative">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center transition-all duration-300 ease-in-out ${
                isAnimating
                  ? slideDir === "right"
                    ? "opacity-0 translate-x-8"
                    : "opacity-0 -translate-x-8"
                  : "opacity-100 translate-x-0"
              }`}
            >
              {/* Image */}
              <div className="w-full overflow-hidden" style={{ borderRadius: "40px" }}>
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-[280px] md:h-[350px] object-cover"
                />
              </div>

              {/* Scripture text */}
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-medium text-black mb-4">
                  {card.title}
                </h2>
                <p className="text-sm leading-relaxed text-black/70">
                  "{card.text}"
                </p>
              </div>
            </div>
          </div>

          {/* Arrows */}
          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={() => goTo("prev")}
              className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-sky-200 transition-colors"
              aria-label="Previous scripture"
            >
              <ArrowLeft className="w-4 h-4 text-black" />
            </button>
            <button
              onClick={() => goTo("next")}
              className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-sky-200 transition-colors"
              aria-label="Next scripture"
            >
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </section>

      {/* The Strategy */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-medium text-black mb-14">
            The Strategy
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {leaders.map((l, idx) => (
              <div key={l.name} className="bg-sky-200 rounded-2xl p-6 md:p-8 flex flex-col items-center gap-3">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden">
                  <img
                    src={l.img}
                    alt={l.name}
                    className={`w-full h-full object-cover shadow-none ${idx === 1 ? "shadow-none" : ""}`}
                  />
                </div>
                <p className="text-xs text-left leading-relaxed text-black/70 max-w-[180px]">
                  {l.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Service Times */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
