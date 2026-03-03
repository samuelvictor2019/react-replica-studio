import eventImg from "@/assets/event-experience.png";

const EventExperience = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-6 items-start">
          {/* Left: heading and paragraph */}
          <div className="max-w-[400px] pr-6">
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-foreground mb-3">Experience a Deeper Walk</h2>
            <p className="text-sm text-muted-foreground mb-4">
              At WaterGate Church, our events are moments of alignment, transformation, and community. From intensive trainings to weekly gatherings, each meeting is designed to help you grow deeper in Christ and walk out your faith with purpose.
            </p>
          </div>

          {/* Right: quote box */}
          <div>
            <div className="relative mb-6">
              <div className="absolute -top-6 -right-18 text-[190px] text-sky-100 leading-none select-none pointer-events-none">"</div>
              <div className="border border-sky-200 border-dashed p-6 rounded-md bg-white max-w-[360px] ml-auto mt-0">
                <p className="text-sm text-foreground/80 font-medium">
                  Through focused teaching, prayer, and <span className="font-bold">impartation, participants are equipped to grow in maturity and live out their faith with clarity and conviction.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image bleeding to right edge */}
      <div className="mt-6 ml-4 md:ml-[max(3rem,calc((100vw-64rem)/2+3rem))]">
        <div className="overflow-hidden rounded-l-[18px]">
          <img src={eventImg} alt="Event" className="w-full h-72 md:h-80 object-cover" />
        </div>
      </div>
    </section>
  );
};

export default EventExperience;
