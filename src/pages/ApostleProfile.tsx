import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/apostles_hero.jpg";
import gallery1 from "@/assets/apostle1.jpg";
import gallery2 from "@/assets/apostle2.jpg";
import gallery3 from "@/assets/apostle3.jpg";
import gallery4 from "@/assets/apostle4.jpg";
import gallery5 from "@/assets/apostle5.jpg";
import gallery6 from "@/assets/apostle6.jpg";
import gallery7 from "@/assets/apostle7.jpg";
import gallery8 from "@/assets/apostle8.jpg";
import gallery9 from "@/assets/apostle9.jpg";

const ApostleProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-background text-foreground">
        <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-10">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.08] hero-fade delay-1">
            Shepherd. Father.
            <br />
            Mentor. Apostle.
          </h1>
        </div>

        <div className="w-full">
          <div className="w-full">
            <img
              src={heroImg}
              alt="Apostle Adebowale Adesina"
              className="w-full h-auto object-contain hero-fade delay-2"
            />
          </div>
        </div>
      </section>

      {/* Bio Section 1 — left-aligned (bleeds left) */}
      <section className="py-16 md:py-24 bg-background">
        <div className="ml-0 mr-auto max-w-5xl pl-0 pr-4 md:pr-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start pl-0 pr-0">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-[1.15] pl-4 md:pl-8">
              Apostle.
              <br />
              Shepherd.
              <br />
              Father.
            </h2>

            <p className="text-sm leading-relaxed text-foreground/70 px-4 md:px-0">
              Apostle Adebowale Adesina is the Serving Overseer of The WaterGate 
              Church and the Lead Facilitator of Present Truth Leadership 
              Forum, a Christ-centered community of saints pressing into 
              the fullness of Christ, with grace to prevail, govern, and exercise 
              dominion in every domain of influence across the earth.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery 1 — bleeds left */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="ml-0 mr-auto max-w-5xl pl-0 pr-4 md:pr-8">
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            <div className="overflow-hidden rounded-r-2xl">
              <img src={gallery1} alt="Ministry moment" className="w-full h-[160px] md:h-[240px] object-cover" />
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img src={gallery2} alt="Serving" className="w-full h-[160px] md:h-[240px] object-cover" />
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img src={gallery3} alt="Community" className="w-full h-[160px] md:h-[240px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section 2 — right-aligned (bleeds right) */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mr-0 ml-auto max-w-5xl pr-0 pl-4 md:pl-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <p className="text-sm leading-relaxed text-foreground/70 px-4 md:px-0">
              He is also the Facilitator of Hiddekel Miracle Explosion, Hiddekel 
              School of Leadership and the Supernatural which comprises of 
              Psalmist Boot Camp, Seers and Scribes Boot Camp, and other modules 
              of training in the Supernatural. He is committed to training, 
              equipping, and discipleship of the saints within and outside the 
              nation. He is passionate about intimacy with God and expressing the 
              fullness of Christ across the earth.
            </p>

            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-[1.15] md:text-right pr-4 md:pr-8">
              Discipler.
              <br />
              Mentor.
              <br />
              Teacher.
            </h2>
          </div>
        </div>
      </section>

      {/* Gallery 2 — bleeds right */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="mr-0 ml-auto max-w-5xl pr-0 pl-4 md:pl-8">
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            <div className="overflow-hidden rounded-2xl">
              <img src={gallery4} alt="Teaching" className="w-full h-[160px] md:h-[240px] object-cover" />
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img src={gallery5} alt="Mentoring" className="w-full h-[160px] md:h-[240px] object-cover" />
            </div>
            <div className="overflow-hidden rounded-l-2xl">
              <img src={gallery6} alt="Discipleship" className="w-full h-[160px] md:h-[240px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section 3 — Leader. Builder. Husband. (left-aligned like section 1) */}
      <section className="py-16 md:py-24 bg-background">
        <div className="ml-0 mr-auto max-w-5xl pl-0 pr-4 md:pr-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start pl-0 pr-0">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-[1.15] pl-4 md:pl-8">
              Leader.
              <br />
              Builder.
              <br />
              Husband.
            </h2>

            <div>
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-foreground/70 px-4 md:px-0">
                  He is a graduate of Agricultural Engineering from the University of Ibadan. 
                  He also obtained two master degrees; the first in Geographical Information 
                  Systems and secondly, in Soil and Water Conservation Engineering. 
                  He was a former University lecturer at the Olabisi Onabanjo University before 
                  he resigned to pioneer The WaterGate Church.
                </p>
                <p className="text-sm leading-relaxed text-foreground/70 px-4 md:px-0">
                  He resides in Sango-Ota, Ogun state, Nigeria. He is married to
                  Oluwatosin Adesina.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery 3 */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            <div className="overflow-hidden rounded-2xl">
              <img src={gallery7} alt="Leadership" className="w-full h-[160px] md:h-[240px] object-cover" />
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img src={gallery8} alt="Family" className="w-full h-[160px] md:h-[240px] object-cover" />
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img src={gallery9} alt="Building" className="w-full h-[160px] md:h-[240px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApostleProfile;
