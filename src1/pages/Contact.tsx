import { useState, useEffect } from "react";
import { Turnstile } from '@marsidev/react-turnstile';
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { postForm } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sanitizePhoneInput } from "@/lib/formValidation";

type ContactForm = {
  fullName: string;
  phone: string;
  email: string;
  enquiryType: string;
  message: string;
  responseMethod: string;
  consent: boolean;
};

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadTime, setLoadTime] = useState(0);
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    setLoadTime(Date.now());
  }, []);

  const [form, setForm] = useState<ContactForm>({
    fullName: "",
    phone: "",
    email: "",
    enquiryType: "",
    message: "",
    responseMethod: "",
    consent: false,
  });

  const update = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit =
    form.fullName.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.enquiryType &&
    form.message.trim() &&
    form.responseMethod &&
    form.consent;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    // Honeypot check
    if (honeypot) {
      setSubmitted(true);
      return;
    }

    if (!captchaToken) {
      alert("Please complete the security check to continue.");
      return;
    }

    setSubmitting(true);
    const timeToSubmitMs = Date.now() - loadTime;

    try {
      await postForm("contact-us", {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        enquiryType: form.enquiryType,
        message: form.message,
        responseMethod: form.responseMethod,
        consent: form.consent,
        source: "Contact Us",
        _honeypot: honeypot,
        _timeToSubmitMs: timeToSubmitMs,
        captchaToken,
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err?.message || "Failed to submit contact form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <main>
        <section className="pt-28 pb-12 md:pt-32 md:pb-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="font-heading text-[clamp(2.7rem,8vw,5rem)] leading-[0.95] font-medium text-black">
                Contact Us
              </h1>
              <p className="mt-4 text-[11px] sm:text-xs md:text-sm leading-relaxed text-black/70 max-w-[320px] sm:max-w-md mx-auto">
                Whether you're new, need prayers, or want to know more — we're here to help.
                Please complete the form below and we'll respond as soon as possible.
              </p>
            </div>

            <div className="mt-10 md:mt-12 flex justify-center">
              {submitted ? (
                <div className="w-full max-w-3xl rounded-[28px] bg-[#edf2ff] p-8 md:p-12 text-center shadow-sm border border-black/5">
                  <h2 className="font-heading text-4xl md:text-5xl font-medium mb-3">Thank You</h2>
                  <p className="text-sm text-black/70 max-w-xl mx-auto">
                    Your message has been sent successfully. Our team will respond as soon as possible.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 h-11 px-7 rounded-full bg-[#0f1b37] text-white hover:bg-[#17284f]"
                  >
                    SEND ANOTHER MESSAGE
                  </Button>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSubmit();
                    }}
                    className="w-full max-w-3xl rounded-[28px] bg-[#edf2ff] p-4 sm:p-5 md:p-6 shadow-sm border border-black/5"
                  >
                    <div className="space-y-3 sm:space-y-3.5">
                      {/* Honeypot field (hidden) */}
                      <div className="opacity-0 absolute -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
                        <label htmlFor="_company_ext">Leave this empty</label>
                        <input
                          type="text"
                          id="_company_ext"
                          name="_company_ext"
                          tabIndex={-1}
                          autoComplete="off"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-black/70">Full Name</Label>
                        <Input
                          placeholder="First & Last Name"
                          value={form.fullName}
                          onChange={(e) => update('fullName', e.target.value)}
                          className="h-10 sm:h-11 bg-white/70 border-[#cbd6f0] rounded-[8px] text-[13px]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-black/70">
                          Phone Number <span className="text-black/40">(Preferred Whatsapp)</span>
                        </Label>
                        <Input
                          placeholder="Phone Number"
                          value={form.phone}
                          onChange={(e) => update('phone', sanitizePhoneInput(e.target.value))}
                          className="h-10 sm:h-11 bg-white/70 border-[#cbd6f0] rounded-[8px] text-[13px]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-black/70">Email Address</Label>
                        <Input
                          placeholder="Email Address"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          className="h-10 sm:h-11 bg-white/70 border-[#cbd6f0] rounded-[8px] text-[13px]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-black/70">Nature of Enquiry</Label>
                        <Select value={form.enquiryType} onValueChange={(v) => update('enquiryType', v)}>
                          <SelectTrigger className="h-10 sm:h-11 bg-white/70 border-[#cbd6f0] rounded-[8px] text-[13px]">
                            <SelectValue placeholder="Select Your Option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General Enquiry">General Enquiry</SelectItem>
                            <SelectItem value="Partnership">Partnership</SelectItem>
                            <SelectItem value="Events">Events</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <Label className="text-[11px] font-medium text-black/70">Please share your message below</Label>
                        <Textarea
                          placeholder="Please share your message"
                          value={form.message}
                          onChange={(e) => update('message', e.target.value)}
                          className="min-h-[112px] bg-white/70 border-[#cbd6f0] rounded-[8px] text-[13px] resize-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-black/70">How would you like us to respond?</Label>
                        <Select value={form.responseMethod} onValueChange={(v) => update('responseMethod', v)}>
                          <SelectTrigger className="h-10 sm:h-11 bg-white/70 border-[#cbd6f0] rounded-[8px] text-[13px]">
                            <SelectValue placeholder="Select Your Option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Phone Call">Phone Call</SelectItem>
                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-start gap-2 pt-1">
                        <Checkbox
                          checked={form.consent}
                          onCheckedChange={(v) => update('consent', !!v)}
                          className="mt-[2px]"
                        />
                        <Label className="text-[11px] sm:text-xs text-black/75 leading-snug">
                          I consent to be contacted by WaterGate Church regarding this enquiry.
                        </Label>
                      </div>

                      {/* Turnstile Captcha - Cloudflare dummy key for always pass */}
                      <div className="py-2 flex justify-center">
                        <Turnstile
                          siteKey="1x00000000000000000000AA"
                          options={{ appearance: 'interaction-only' }}
                          onSuccess={(token) => setCaptchaToken(token)}
                          onError={() => setCaptchaToken(null)}
                          onExpire={() => setCaptchaToken(null)}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={!canSubmit || submitting}
                        className="mt-2 h-11 px-6 rounded-full bg-[#0f1b37] text-white hover:bg-[#17284f] disabled:opacity-40 text-[12px] tracking-widest"
                      >
                        {submitting ? 'SUBMITTING...' : 'SUBMIT MESSAGE'}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        <ContactSection />
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
