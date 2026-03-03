import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import heroImg from "@/assets/housegroup_hero.jpg";
import joinImg from "@/assets/community-21.jpg";
import { BookOpen, Users, HandHeart } from "lucide-react";

const whyCards = [
  {
    icon: BookOpen,
    title: "Grow Spiritually",
    desc: "Study the Word together and strengthen your faith.",
  },
  {
    icon: Users,
    title: "Build Relationships",
    desc: "Form genuine, lasting connections with others.",
  },
  {
    icon: HandHeart,
    title: "Pray Together",
    desc: "Share burdens, lift one another up, and experience God's power in community.",
  },
];

const HouseGroups = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-white">
        <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-medium leading-tight text-foreground hero-fade delay-1">
            Where Real
            <br />
            Community Happens
          </h1>
        </div>
        <div className="w-full">
          <img
            src={heroImg}
            alt="House group gathering"
            className="w-full h-auto object-contain hero-fade delay-2"
          />
        </div>
      </section>

      {/* Join a House Group */}
      <section className="py-16 md:py-24 bg-background">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 px-4 md:pl-[max(2rem,calc((100vw-64rem)/2+2rem))] md:pr-10">
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-6">
              Join a House
              <br />
              Group
            </h2>
            <p className="text-sm text-foreground/70 mb-3 max-w-lg">
              House Groups are the heart of life at WaterGate
              <br />
              Church.
            </p>
            <p className="text-sm text-foreground/70 mb-6 max-w-lg">
              They are small, group-based communities where
              <br />
              believers connect, grow, and build
              <br />
              meaningful relationships beyond Sunday services.
            </p>
            <a
              href="/new-member-registration"
              className="inline-flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-md font-semibold hover:bg-sky-200 hover:text-foreground transition-colors"
            >
              JOIN A HOUSE GROUP
            </a>
          </div>

          <div className="md:w-[45%] overflow-hidden rounded-l-[18px] mt-8 md:mt-0">
            <img
              src={joinImg}
              alt="House group members"
              className="w-full h-56 md:h-72 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why Join a House Group? */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-start gap-10">
            {/* Left heading */}
            <div className="md:w-[35%]">
              <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-4">
                Why Join
                <br />
                a House Group?
              </h2>
              <p className="text-sm text-foreground/70 mb-4 max-w-sm">
                No matter your age, background, or stage of life, a House Group is where you belong.
              </p>
              <a
                href="/new-member-registration"
                className="inline-flex items-center gap-2 text-foreground hover:text-foreground/70 text-xs font-semibold tracking-widest transition-colors"
              >
                <span className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                </span>
              </a>
            </div>

            {/* Right cards - horizontal scroll on mobile, grid on desktop */}
            <div className="md:w-[65%]">
              <Carousel opts={{ align: "start", loop: true }} className="w-full md:hidden">
                <CarouselContent className="-ml-4">
                  {whyCards.map((card, i) => (
                    <CarouselItem key={i} className="pl-4 basis-[75%]">
                      <div className="bg-sky-50 rounded-2xl p-6 h-full">
                        <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mb-4">
                          <card.icon className="w-5 h-5 text-foreground" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{card.title}</h3>
                        <p className="text-sm text-foreground/70">{card.desc}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <div className="hidden md:grid md:grid-cols-3 gap-5">
                {whyCards.map((card, i) => (
                  <div key={i} className="bg-sky-50 rounded-2xl p-6">
                    <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mb-4">
                      <card.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{card.title}</h3>
                    <p className="text-sm text-foreground/70">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Connected CTA */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-4">
            Get Connected to
            <br />
            One House Group
          </h2>
          <p className="text-sm text-foreground/70 mb-8 max-w-md mx-auto">
            We believe we walk together, support one another, and grow in Christ as a community. Our House Groups meet regularly and serve as a place of belonging, prayer, and encouragement.
          </p>
          <a
            href="/new-member-registration"
            className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-3 rounded-md font-semibold hover:bg-sky-200 hover:text-foreground transition-colors"
          >
            JOIN A HOUSE GROUP
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HouseGroups;
