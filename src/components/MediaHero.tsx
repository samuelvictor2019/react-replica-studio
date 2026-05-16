import heroImage from "@/assets/media_hero.jpg";

const MediaHero = () => {
  return (
    <section className="relative bg-white">
      <div className="container max-w-6xl mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12">
        <h1 className="font-heading text-[clamp(2.2rem,8vw,4.5rem)] font-medium leading-tight text-black hero-fade delay-1">
          Encounter. Learn.
          <br />
          Remember. Share.
        </h1>
      </div>

      <div className="w-full">
          <div className="w-full">
            <img src={heroImage} alt="Media hero" className="w-full h-auto object-contain hero-fade delay-2" />
          </div>
      </div>
    </section>
  );
};

export default MediaHero;
