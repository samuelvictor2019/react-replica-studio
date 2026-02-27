import community1 from "@/assets/community-1.png";
import community2 from "@/assets/community-2.png";
import community3 from "@/assets/community-3.png";
import community4 from "@/assets/community-4.png";

const WelcomeSection = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
          {/* Left: Text */}
          <div className="flex-1 max-w-md">
            <h2 className="font-heading text-3xl md:text-4xl font-medium text-black mb-5">
              Who We Are
            </h2>
            <p className="text-sm text-black/70 leading-relaxed mb-8">
              WaterGate Church is a thriving community where God's presence, truth, and love shape everything we do. Here, you'll grow, be equipped, and find a family that walks with you in faith.
            </p>
            <a
              href="#"
              className="inline-block bg-black text-white text-[11px] font-semibold tracking-widest px-7 py-3 rounded-sm hover:bg-white hover:text-black transition-colors"
            >
              LEARN ABOUT TWC
            </a>
          </div>

          {/* Right: Photo grid — left column lower, right column upper */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 gap-3">
              {/* Left column — pushed down */}
              <div className="flex flex-col gap-3 mt-8">
                <img
                  src={community1}
                  alt="Church community members"
                  className="w-[calc(100%-10px)] mx-auto h-[170px] md:h-[202px] object-cover rounded-lg"
                />
                <img
                  src={community3}
                  alt="Church families"
                  className="w-[calc(100%-10px)] mx-auto h-[170px] md:h-[202px] object-cover rounded-lg"
                />
              </div>
              {/* Right column — pushed up */}
              <div className="flex flex-col gap-3">
                <img
                  src={community2}
                  alt="Church youth group"
                  className="w-[calc(100%-10px)] mx-auto h-[170px] md:h-[202px] object-cover rounded-lg"
                />
                <img
                  src={community4}
                  alt="Church worship"
                  className="w-[calc(100%-10px)] mx-auto h-[170px] md:h-[202px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
