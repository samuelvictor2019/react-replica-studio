import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import onboardingImg from "@/assets/newmember_hero.jpg";
import joinImg from "@/assets/community-4.jpg";
import whatImg from "@/assets/community-3.jpg";

const NewMember = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-white">
        <div className="container max-w-6xl mx-auto px-4 pt-12 pb-6">
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-medium leading-tight text-black">
            WaterGate Church
            <br />
            is a family
          </h1>
        </div>

        <div className="w-full overflow-hidden">
          <img
            src={onboardingImg}
            alt="WaterGate family"
            className="w-full h-[420px] md:h-[520px] lg:h-[620px] object-cover"
          />
        </div>
      </section>

      {/* Intro / Join */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-medium text-black mb-6">We're truly glad you're here</h2>
              <p className="text-sm text-black/70 mb-6 max-w-lg">
                Welcome to WaterGate Church. If you're new, we want to make your first steps easy and
                warm — whether you visit online or in person. Below you'll find what to expect, who to
                meet and how to get connected.
              </p>

              <a
                href="/new-member"
                className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-md font-semibold"
              >
                JOIN THE FAMILY
              </a>
            </div>

            <div className="overflow-hidden rounded-[18px]">
              <img src={joinImg} alt="Join the family" className="w-full h-56 md:h-72 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <h3 className="font-heading text-2xl md:text-3xl font-medium text-black mb-8">What to Expect at WaterGate Church</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
              <img src={whatImg} alt="Expect" className="w-full h-40 object-cover" />
              <div className="p-4">
                <h4 className="font-medium text-black mb-2">A Warm, Loving Community</h4>
                <p className="text-sm text-black/70">You'll find people who care, worship and serve together.</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
              <img src={joinImg} alt="Expect" className="w-full h-40 object-cover" />
              <div className="p-4">
                <h4 className="font-medium text-black mb-2">Practical Teaching</h4>
                <p className="text-sm text-black/70">Teaching that applies Jesus' life and love to everyday living.</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
              <img src={onboardingImg} alt="Expect" className="w-full h-40 object-cover" />
              <div className="p-4">
                <h4 className="font-medium text-black mb-2">Connect & Serve</h4>
                <p className="text-sm text-black/70">Small groups, ministries and opportunities to grow in service and faith.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA block */}
      <section className="py-12 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="font-heading text-xl text-black mb-2">Join the Family</h4>
              <p className="text-sm text-black/70 mb-4 max-w-md">Sign up to receive a welcome packet, service times and details about how to get connected.</p>
              <a href="#" className="inline-flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-md font-semibold">JOIN THE FAMILY</a>
            </div>

            <div className="overflow-hidden rounded-[12px]">
              <img src={joinImg} alt="Join" className="w-full h-48 object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewMember;
