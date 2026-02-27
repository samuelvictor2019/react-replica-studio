import React from "react";
import eventHeroImg from "@/assets/events_hero.jpg";

const EventHero: React.FC<{ title?: string; subtitle?: string }> = ({
  title = "Gather. Grow. Encounter.",
  subtitle,
}) => {
  return (
    <section className="bg-background text-black">
      <div className="container max-w-6xl mx-auto px-4 pt-24 pb-8">
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] max-w-2xl hero-fade delay-1">
          {title}
        </h1>
        {subtitle && <p className="mt-4 text-black/70 max-w-2xl hero-fade delay-2">{subtitle}</p>}
      </div>

      <div className="w-full">
        <div className="w-full overflow-hidden group hero-fade delay-2">
          <img
            src={eventHeroImg}
            alt={`${title} hero`}
            className="w-full h-[320px] md:h-[480px] lg:h-[560px] object-cover hero-kenburns transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
};

export default EventHero;
