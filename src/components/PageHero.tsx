import heroImage from "@/assets/hero-image.jpg";

const PageHero = () => {
  return (
    <section className="relative bg-white">
      <div className="container max-w-6xl mx-auto px-4 pt-12 pb-6">
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-medium leading-tight text-black">
          Gather. Grow.
          <br />
          Encounter.
        </h1>
      </div>

      <div className="w-full">
        <img src={heroImage} alt="People at event" className="w-full h-[420px] md:h-[480px] lg:h-[560px] object-cover" />
      </div>
    </section>
  );
};

export default PageHero;
