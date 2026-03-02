import React from "react";
import newMemberImg from "@/assets/welcome-1.png";
import houseGroupsImg from "@/assets/welcome-2.png";
import sermonsImg from "@/assets/welcome-3.png";

const Card = ({ href, img, title }: { href: string; img: string; title: string }) => (
  <a
    href={href}
    className="group block overflow-hidden rounded-[18px] relative shadow-md w-[260px] md:w-[350px]"
    aria-label={title}
  >
    <img src={img} alt={title} className="w-full h-[260px] md:h-[350px] object-cover transition-transform duration-300 group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    <div className="absolute left-4 bottom-4">
      <h4 className="text-white font-semibold text-lg md:text-xl">{title}</h4>
    </div>
  </a>
);

const JoinCards = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      {/* Full-width blue overlay */}
      <div className="w-full bg-sky-50">
        <div className="container max-w-6xl mx-auto px-4 py-10">
          <div className="mx-auto max-w-4xl text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-black">Welcome to The <br></br> WaterGate Church</h2>
            <p className="mt-3 text-sm text-black/70">A community of believers pursuing Jesus, revealing <br></br> His kingdom, and transforming lives by the Spirit.</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 place-items-center">
              <Card href="/new-member" img={newMemberImg} title={`I'm a New Member`} />
              <Card href="/house-groups" img={houseGroupsImg} title={`Join a House Group`} />
              <Card href="/media" img={sermonsImg} title={`Listen to Sermons`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCards;
