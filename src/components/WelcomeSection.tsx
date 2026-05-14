import community1 from "@/assets/community-1.png";

const WelcomeSection = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-start">
          <div className="max-w-[500px]">
            <h2 className="font-heading text-5xl md:text-6xl font-medium text-black mb-5 leading-[0.95]">
              Who We Are
            </h2>
            <div className="space-y-4 text-sm text-black/70 leading-relaxed">
              <p>We are Christ-centered community of believers (star-seed) who are naturally supernatural and supernaturally natural with the mandate to see the knowledge of the glory of the LORD take over the earth as the waters cover the sea.</p>
              <p>We are Oaks of Righteousness planted by the LORD in every institution, every sphere, and every nation for the establishment of the dominion of Christ in every domain. The will of God will be done in our earth and in the earth as it is in heaven.</p>
              <p>We are salt of the earth and light of the world with grace to govern and power to prevail in every community, every sphere, and every nation of the earth.</p>
              <p>We are believers with divine nature attitude having determination to accurately represent "Jesus our ultimate Role Model" across the earth.</p>
            </div>
            <a
              href="/about#about-twc-ph"
              className="mt-4 inline-flex items-center gap-2 text-sky-500 hover:text-sky-600 text-sm font-semibold tracking-wide transition-all"
            >
              LEARN MORE <span aria-hidden>→</span>
            </a>
          </div>

          <div className="w-full md:pt-4">
            <img
              src={community1}
              alt="Church community members"
              className="w-full max-w-[460px] aspect-square object-cover rounded-md md:ml-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
