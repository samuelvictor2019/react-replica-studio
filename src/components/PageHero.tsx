import heroImage from "@/assets/hero-image.jpg";

const PageHero = () => {
  return (
    <section className="relative bg-white">
      <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-medium leading-tight text-black hero-fade delay-1">
          Gather. Grow.
          <br />
          Encounter.
        </h1>
      </div>

      <div className="w-full">
        <div className="w-full overflow-hidden group hero-fade delay-2">
          <img src={heroImage} alt="People at event" className="w-full h-[420px] md:h-[480px] lg:h-[560px] object-cover hero-kenburns transition-transform duration-700 ease-out group-hover:scale-105" />
        </div>
      </div>
    </section>
  );
};

export default PageHero;
