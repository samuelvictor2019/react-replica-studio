import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import heroImg from "@/assets/housegroup_hero.jpg";
import joinImg from "@/assets/housegroup1.jpg";
import slideOne from "@/assets/housegroup_slide1.jpg";
import slideTwo from "@/assets/housegroup_slide2.jpg";
import slideThree from "@/assets/housegroup_slide3.jpg";
import slideFour from "@/assets/housegroup_slide4.jpg";
import slideFive from "@/assets/housegroup_slide5.jpg";

const whyCards = [
  {
    image: slideOne,
    title: "Grow Spiritually",
    desc: "Study the Word together and strengthen your faith",
  },
  {
    image: slideTwo,
    title: "Build Relationships",
    desc: "Form genuine, lasting connections with others",
  },
  {
    image: slideThree,
    title: "Pray Together",
    desc: "Share burdens, victories and testimonies",
  },
  {
    image: slideFour,
    title: "Receive Care",
    desc: "Be known, supporteds and encouraged",
  },
  {
    image: slideFive,
    title: "Serve Together",
    desc: "Live out the gospel in practical ways",
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
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <div className="flex flex-col md:flex-row md:items-start gap-10">
              {/* Left heading */}
              <div className="md:w-[35%]">
                <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-4">
                  Why Join
                  <br />
                  a House Group?
                </h2>
                <p className="text-sm text-foreground/70 mb-6 max-w-sm">
                  No matter your age, background, or stage of life, there's a House Group where you belong.
                </p>
                <div className="flex gap-3">
                  <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border border-foreground/20 bg-background hover:bg-sky-200 hover:text-foreground" />
                  <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border border-foreground/20 bg-background hover:bg-sky-200 hover:text-foreground" />
                </div>
              </div>

              {/* Right cards - carousel */}
              <div className="md:w-[65%]">
                <CarouselContent className="-ml-4">
                  {whyCards.map((card, i) => (
                    <CarouselItem key={i} className="pl-4 basis-[70%] md:basis-[40%]">
                      <div className="bg-sky-50 rounded-2xl p-6 h-full md:h-[280px] lg:h-[300px] flex flex-col justify-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden mb-6 mt-2">
                          <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-foreground mb-3">{card.title}</h3>
                        <p className="text-sm text-foreground/70">{card.desc}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
            </div>
          </Carousel>
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
