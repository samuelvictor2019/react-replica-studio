import contact1Img from "@/assets/contact-1.jpg";
import contact2Img from "@/assets/contact-2.png";

const ContactSection = () => {
  return (
    <section id="contact-us" className="py-16 md:py-24 bg-background">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Heading */}
        <div className="mb-8">
          <h2 className="font-heading text-[clamp(1.8rem,5vw,2.5rem)] font-medium text-center text-black mb-2">
            We would love to
            <br />
            hear from you!
          </h2>
          <p className="text-sm text-black/70 text-center mb-0">
            Whether you're new, need prayers, or want to
            <br />
            know more — we're here for you.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Service Times Card */}
          <div className="rounded-xl overflow-hidden bg-sky-50 border border-border">
            <img
              src={contact1Img}
              alt="Church congregation during worship"
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h3 className="font-heading text-xl font-semibold text-black mb-3">
                Service Times
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Sundays - 9:00AM
                <br />
                Wednesdays - 6:00PM
              </p>
            </div>
          </div>

          {/* Contact Us Card */}
          <div className="rounded-xl overflow-hidden bg-sky-50 border border-border">
            <img
              src={contact2Img}
              alt="Hands playing piano during worship"
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h3 className="font-heading text-xl font-semibold text-black mb-3">
                Contact Us
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Email - watergatechurch@gmail.com
                <br />
                Telephone - +234 810 284 8784
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
