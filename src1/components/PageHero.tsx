import heroImage from "@/assets/hero-image.jpg";

const PageHero = () => {
  return (
    <section className="relative bg-white">
      <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
        <h1 className="font-heading text-[clamp(2.2rem,8.8vw,6rem)] font-medium leading-tight text-black hero-fade delay-1">
          Gather. Grow.
          <br />
          Encounter.
        </h1>
      </div>

      <div className="w-full">
        <img src={heroImage} alt="People at event" className="w-full h-auto object-contain hero-fade delay-2" />
      </div>
    </section>
  );
};

export default PageHero;
