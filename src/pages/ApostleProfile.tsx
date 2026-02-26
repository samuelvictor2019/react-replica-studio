import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/apostles_hero.jpg";
import gallery1 from "@/assets/community-1.jpg";
import gallery2 from "@/assets/community-2.jpg";
import gallery3 from "@/assets/community-3.jpg";

const ApostleProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-background text-foreground">
        <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-10">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.08]">
            Shepherd. Father.
            <br />
            Mentor. Apostle.
          </h1>
        </div>

        <div className="w-full">
          <img
            src={heroImg}
            alt="Apostle Adebowale Adesina"
            className="w-full h-[320px] md:h-[480px] lg:h-[560px] object-cover"
          />
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-[1.15]">
              Apostle.
              <br />
              Shepherd.
              <br />
              Father.
            </h2>

            <p className="text-sm leading-relaxed text-foreground/70">
              Apostle Adebowale Adesina is the Serving Overseer of The WaterGate
              Church and the Lead Facilitator of Present Truth Leadership Forum,
              a Christ-centered community of saints, pressing into the fullness
              of Christ, with grace to prevail, govern, and exercise dominion in
              every domain of influence across the earth.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={gallery1}
                alt="Ministry moment"
                className="w-full h-[160px] md:h-[240px] object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img
                src={gallery2}
                alt="Serving"
                className="w-full h-[160px] md:h-[240px] object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img
                src={gallery3}
                alt="Community"
                className="w-full h-[160px] md:h-[240px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApostleProfile;
