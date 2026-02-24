import contact1Img from "@/assets/contact-1.jpg";
import contact2Img from "@/assets/contact-2.jpg";

const ContactSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Heading */}
        <h2 className="font-heading text-3xl md:text-4xl font-medium text-center text-foreground mb-2">
          We would love to
          <br />
          hear from you!
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-10">
          Whether you're new, need prayers, or want to
          <br />
          know more — we're here for you.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Service Times Card */}
          <div className="rounded-xl overflow-hidden bg-card border border-border">
            <img
              src={contact1Img}
              alt="Church congregation during worship"
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                Service Times
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sundays - 9:00AM
                <br />
                Wednesdays - 6:00PM
              </p>
            </div>
          </div>

          {/* Contact Us Card */}
          <div className="rounded-xl overflow-hidden bg-card border border-border">
            <img
              src={contact2Img}
              alt="Hands playing piano during worship"
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                Contact Us
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
