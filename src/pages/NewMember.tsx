import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import onboardingImg from "@/assets/newmember_hero.jpg";
import joinImg from "@/assets/newmember_1.jpg";
import whatImg from "@/assets/newmember2.jpg";
import slideOne from "@/assets/member_slide1.jpg";
import slideTwo from "@/assets/member_slide2.jpg";
import slideThree from "@/assets/member_slide3.jpg";
import slideFour from "@/assets/member_slide4.jpg";

const expectSlides = [
  { img: slideOne, title: "A Warm, Loving Community", desc: "From the moment you arrive, you'll experience a people committed to love, fellowship, and genuine connection. We believe no one should walk alone." },
  { img: slideTwo, title: "Spirit-Filled Worship", desc: "Our worship gatherings are centered on the presence of God—creating room for heartfelt praise, intimacy with the Holy Spirit, and encounters that transform lives." },
  { img: slideThree, title: "Sound, Christ-Centered Teaching", desc: "We are devoted to teaching the Word of God with clarity, depth, and accuracy—helping believers grow in truth, maturity, and spiritual understanding." },
  { img: slideFour, title: "Opportunities to Grow", desc: "At WaterGate Church, growth is intentional. From small groups and discipleship pathways to leadership training and service opportunities, there is room for you to grow spiritually and practically." },
];

const NewMember = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-white">
        <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-medium leading-tight text-black hero-fade delay-1">
            WaterGate Church
            <br />
            is a family
          </h1>
        </div>

        <div className="w-full">
              <div className="w-full">
                <img src={onboardingImg} alt="WaterGate family" className="w-full h-auto object-contain hero-fade delay-2" />
              </div>
        </div>
      </section>

      {/* Intro / Join */}
      <section className="py-16 md:py-24 bg-background">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 px-4 md:pl-[max(2rem,calc((100vw-64rem)/2+2rem))] md:pr-10">
              <h2 className="font-heading text-3xl md:text-4xl font-medium text-black mb-6">We're truly <br /> glad you're <br />here</h2>
              <p className="text-sm text-black/70 mb-6 max-w-lg">
                Welcome to WaterGate Church. If you're new, <br />we want to make your first steps easy and <br />
                warm — whether you visit online or in person. <br />Below you'll find what to expect, who to
                meet <br /> and how to get connected.
              </p>
              <a
                href="/new-member"
                className="inline-flex items-center bg-black text-white text-xs font-semibold tracking-widest px-8 py-3 rounded-full hover:bg-sky-100 hover:text-black transition-colors"
              >
                JOIN THE FAMILY
              </a>
          </div>

          <div className="md:w-[45%] overflow-hidden rounded-l-[18px] mt-8 md:mt-0">
            <img src={joinImg} alt="Join the family" className="w-full h-56 md:h-72 object-cover" />
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4 md:pl-[max(2rem,calc((100vw-64rem)/2+2rem))] md:pr-10">
          <h3 className="font-heading text-2xl md:text-3xl font-medium text-black mb-8">What to Expect at <br />WaterGate Church</h3>

          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {expectSlides.map((slide, i) => (
                <CarouselItem key={i} className="pl-4 basis-[90%]">
                  <div className="relative overflow-hidden rounded-2xl w-full h-56 md:h-72">
                    <img src={slide.img} alt={slide.title} className="w-full h-56 md:h-72 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 md:p-8">
                      <h4 className="font-heading text-base md:text-2xl font-semibold text-white mb-1 md:mb-2">{slide.title}</h4>
                      <p className="text-xs md:text-sm text-white/80 max-w-sm line-clamp-3 md:line-clamp-none">{slide.desc}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-3 mt-6">
              <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border border-black/20 bg-white hover:bg-sky-100 hover:text-black" />
              <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border border-black/20 bg-white hover:bg-sky-100 hover:text-black" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Join CTA block */}
      <section className="py-12 bg-white">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 px-4 md:pl-[max(2rem,calc((100vw-64rem)/2+2rem))] md:pr-10">
              <h4 className="font-heading text-xl text-black mb-2">Join the Family</h4>
              <p className="text-sm text-black/70 mb-4 max-w-md">Sign up to receive a welcome packet, service times and details about how to get connected.</p>
              <a href="#" className="inline-flex items-center bg-black text-white text-xs font-semibold tracking-widest px-8 py-3 rounded-full hover:bg-sky-100 hover:text-black transition-colors">JOIN THE FAMILY</a>
          </div>

          <div className="md:w-[45%] overflow-hidden rounded-l-[12px] mt-8 md:mt-0">
            <img src={whatImg} alt="Join" className="w-full h-56 md:h-72 object-cover" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewMember;
