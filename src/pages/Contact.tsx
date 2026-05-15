import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { postForm } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import contactFormImg from "@/assets/contactus_form.jpg";
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
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const canProceed =
    form.fullName.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.enquiryType;

  const canSubmit = form.message.trim() && form.responseMethod && form.consent;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
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
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err?.message || "Failed to submit contact form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1d22] flex items-center justify-center p-2 sm:p-4 md:p-8">
      <div className="relative w-full max-w-5xl h-[calc(100dvh-1rem)] sm:h-auto sm:max-h-[92dvh] bg-[hsl(220,32%,86%)] rounded-none md:rounded-sm overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_2.5fr]">
        <div className="hidden md:block h-full">
          <img
            src={contactFormImg}
            alt="Contact form"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="md:hidden h-40">
          <img
            src={contactFormImg}
            alt="Contact form"
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-black/60 hover:text-black transition-colors z-20"
          aria-label="Close"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-0 flex flex-col overflow-y-auto">
          {submitted ? (
            <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center">
              <h1 className="font-heading text-4xl md:text-5xl text-black mb-3">Thank You</h1>
              <p className="text-sm text-black/70 max-w-md">
                Your message has been sent successfully. Our team will respond as soon as possible.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="mt-8 h-12 px-10 rounded-full bg-[#0f1b37] text-white hover:bg-[#17284f] text-lg"
              >
                GO HOME
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-black">Contact Us</h1>
                <span className="font-heading text-3xl sm:text-4xl md:text-5xl text-black">{step}/2</span>
              </div>

              {step === 1 && (
                <>
                  <p className="text-sm text-black/70 leading-relaxed max-w-xl mb-6">
                    Whether you have a question, need clarification, or simply want to reach out — our team is here to help.
                    Please complete the form below and we'll respond as soon as possible.
                  </p>

                  <div className="space-y-4 max-w-xl w-full">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-black font-medium">Full Name</Label>
                      <Input
                        placeholder="First & Last Name"
                        value={form.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        className="h-12 bg-[hsl(220,30%,82%)] border-[#8998b8] rounded-[10px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm text-black font-medium">
                        Phone Number <span className="text-black/60">(Preferred Whatsapp)</span>
                      </Label>
                      <Input
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={(e) => update("phone", sanitizePhoneInput(e.target.value))}
                        className="h-12 bg-[hsl(220,30%,82%)] border-[#8998b8] rounded-[10px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm text-black font-medium">Email Address</Label>
                      <Input
                        placeholder="Email Address"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className="h-12 bg-[hsl(220,30%,82%)] border-[#8998b8] rounded-[10px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm text-black font-medium">Nature of Enquiry</Label>
                      <Select value={form.enquiryType} onValueChange={(v) => update("enquiryType", v)}>
                        <SelectTrigger className="h-12 bg-[hsl(220,30%,82%)] border-[#8998b8] rounded-[10px]">
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
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!canProceed}
                      className="h-12 md:h-14 min-w-[150px] rounded-full bg-[#0f1b37] text-white hover:bg-[#17284f] disabled:opacity-40 text-base md:text-lg"
                    >
                      NEXT
                    </Button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="text-base text-black/80 mb-4">Please share your message below</p>

                  <div className="space-y-4 max-w-xl w-full">
                    <Textarea
                      placeholder="Please share your message"
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      className="min-h-[120px] bg-[hsl(220,30%,82%)] border-[#8998b8] rounded-[10px]"
                    />

                    <div className="space-y-1.5">
                      <Label className="text-sm text-black font-medium">How would you like us to respond?</Label>
                      <Select value={form.responseMethod} onValueChange={(v) => update("responseMethod", v)}>
                        <SelectTrigger className="h-12 bg-[hsl(220,30%,82%)] border-[#8998b8] rounded-[10px]">
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
                        onCheckedChange={(v) => update("consent", !!v)}
                        className="mt-[2px]"
                      />
                      <Label className="text-[13px] text-black/80 leading-snug">
                        I consent to be contacted by WaterGate Church regarding this enquiry.
                      </Label>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 md:gap-4">
                    <Button
                      variant="secondary"
                      onClick={() => setStep(1)}
                      className="h-12 md:h-14 min-w-[150px] rounded-full bg-[#c9ccd6] text-black hover:bg-[#babfcb] text-base md:text-lg"
                    >
                      PREVIOUS
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit || submitting}
                      className="h-12 md:h-14 min-w-[220px] rounded-full bg-[#0f1b37] text-white hover:bg-[#17284f] disabled:opacity-40 text-base md:text-lg"
                    >
                      {submitting ? "SUBMITTING..." : "SUBMIT MESSAGE"}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
