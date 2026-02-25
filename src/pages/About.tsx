import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection";
import aboutHeroImg from "@/assets/about-hero.jpg";
import aboutWaterImg from "@/assets/about-water.jpg";
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
    img: aboutHeroImg,
    title: "Habakkuk 2:14",
    text: "For the earth shall be filled with the knowledge of the glory of the LORD, as the waters cover the sea.",
  },
  {
    img: aboutWaterImg,
    title: "Isaiah 61:1",
    text: "The Spirit of the Lord GOD is upon me; because the LORD hath anointed me to preach good tidings unto the meek; he hath sent me to bind up the brokenhearted, to proclaim liberty to the captives.",
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
      <section className="bg-foreground text-primary-foreground">
        <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] max-w-2xl">
            Worship. Word.
            <br />
            Community. Purpose.
          </h1>
        </div>
        <div className="container max-w-6xl mx-auto px-4 pb-0">
          <div className="w-full overflow-hidden" style={{ borderRadius: "60px" }}>
            <img
              src={aboutHeroImg}
              alt="Worship team at WaterGate Church"
              className="w-full h-[300px] md:h-[450px] lg:h-[520px] object-cover"
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
              <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-6">
                About TWC
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
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
                src={aboutHeroImg}
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
                <h2 className="font-heading text-2xl md:text-3xl font-medium text-foreground mb-4">
                  {card.title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  "{card.text}"
                </p>
              </div>
            </div>
          </div>

          {/* Arrows */}
          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={() => goTo("prev")}
              className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground/5 transition-colors"
              aria-label="Previous scripture"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={() => goTo("next")}
              className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground/5 transition-colors"
              aria-label="Next scripture"
            >
              <ArrowRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </section>

      {/* The Strategy */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-14">
            The Strategy
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {leaders.map((l) => (
              <div key={l.name} className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-primary">
                  <img src={l.img} alt={l.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground max-w-[180px]">
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
      <footer className="bg-foreground text-primary-foreground py-8">
        <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-heading text-lg font-bold tracking-wider">WATERGATE</span>
          <div className="flex items-center gap-4">
            <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.85.38-1.78.64-2.73.76 1-.6 1.76-1.54 2.12-2.67-.93.55-1.96.95-3.06 1.17A4.48 4.48 0 0015.11 4c-2.5 0-4.52 2.02-4.52 4.51 0 .35.04.7.11 1.03C7.07 9.35 3.73 7.58 1.51 4.83c-.39.67-.61 1.45-.61 2.28 0 1.57.8 2.95 2.01 3.76-.74-.02-1.44-.23-2.05-.56v.06c0 2.19 1.56 4.01 3.63 4.43a4.52 4.52 0 01-2.04.08c.57 1.8 2.24 3.1 4.21 3.14A9.05 9.05 0 010 19.54 12.77 12.77 0 006.92 21c8.3 0 12.84-6.88 12.84-12.84 0-.2 0-.39-.01-.58.88-.64 1.64-1.43 2.25-2.34l-.54-.24z" /></svg>
            </a>
            <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.93 3.78-3.93 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33v7A10 10 0 0022 12.06c0-5.53-4.5-10.02-10-10.02z" /></svg>
            </a>
            <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.69-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.63-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1018.16 12 6.16 6.16 0 0012 5.84zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-10.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" /></svg>
            </a>
          </div>
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} WaterGate Church. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
