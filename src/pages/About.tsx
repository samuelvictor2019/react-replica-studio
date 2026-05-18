import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import aboutHeroImg from "@/assets/about-hero.jpg";
import aboutMission from "@/assets/themission.jpg";
import aboutVision from "@/assets/thevision.jpg";
import strategy1 from "@/assets/strategy1.jpg";
import strategy2 from "@/assets/strategy2.jpg";
import strategy3 from "@/assets/strategy3.jpg";
import strategy4 from "@/assets/strategy4.jpg";

const leaders = [
  {
    name: "Leader One",
    img: strategy1,
    desc: "To disciple every institution, every sphere and every nation through the transfer of the ministry of the word and the spirit without mixture.",
  },
  {
    name: "Leader Two",
    img: strategy2,
    desc: "To engage our communities as Rebuilders of Ancient Ruins, Repairers of the Breach and Restorers of Streets to dwell in.",
  },
  {
    name: "Leader Three",
    img: strategy3,
    desc: "To daily walk in the LOVE OF GOD through the expression of the ministry of Jesus; this encompasses teaching, preaching and healing in our diverse spheres of influence.",
  },
  {
    name: "Leader Four",
    img: strategy4,
    desc: "To stand as priests, prophets and kings after the order of Melchizedek in our society, city and nation.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-background text-black">
        <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] max-w-4xl hero-fade delay-1">
            <span className="block">Worship. Word. Wonders.</span>
            <span className="block">Community. Destiny</span>
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

      {/* Mission + Vision */}
      <section id="about-twc-ph" className="py-12 md:py-16 bg-background space-y-5 md:space-y-6">
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="container max-w-6xl mx-auto px-4 md:px-0 md:mr-0 md:ml-auto md:w-[55%]">
            <div className="bg-background p-6 md:p-8 h-full flex flex-col justify-center">
              <h2 className="font-heading text-4xl md:text-5xl font-medium text-black mb-4">The Mission</h2>
              <p className="text-sm text-black/70 leading-relaxed max-w-md">
                To raise a people that will stand as true and faithful witnesses, leaders,
                and commanders across their spheres of influence by preaching Christ without distortion.
              </p>
            </div>
          </div>
          <div className="md:w-[45%] overflow-hidden">
            <img src={aboutMission} alt="The Mission" className="w-full h-[220px] md:h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch">
          <div className="md:w-[45%] overflow-hidden order-2 md:order-1">
            <img src={aboutVision} alt="The Vision" className="w-full h-[220px] md:h-full object-cover" />
          </div>
          <div className="container max-w-6xl mx-auto px-4 md:px-0 md:ml-0 md:mr-auto md:w-[55%] order-1 md:order-2">
            <div className="bg-background p-6 md:p-8 h-full flex flex-col justify-center">
              <h2 className="font-heading text-4xl md:text-5xl font-medium text-black mb-4">The Vision</h2>
              <p className="text-sm text-black/70 leading-relaxed max-w-md">
                To build a people that will demonstrate the nature and stature of Jesus Christ
                until the knowledge of the glory of the LORD takes over the earth as the waters cover the sea.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Strategy */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-medium text-black mb-10 md:mb-12">
            The Strategy
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {leaders.map((l) => (
              <div key={l.name} className="bg-sky-100 rounded-2xl overflow-hidden text-left">
                <img src={l.img} alt={l.name} className="w-full h-36 md:h-44 object-cover" />
                <div className="p-4 md:p-5 lg:p-6 min-h-[150px] md:min-h-[170px] flex items-start">
                  <p className="text-sm md:text-[15px] leading-relaxed md:leading-7 text-black/70">
                  {l.desc}
                </p>
                </div>
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
