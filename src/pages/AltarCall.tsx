import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import altarImg from "@/assets/altarcall_form.jpg";
import { sanitizePhoneInput } from "@/lib/formValidation";

type Props = { modal?: boolean; onClose?: () => void };

const AltarCall = ({ modal = false, onClose }: Props) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    decision: "",
    whenDecision: "",
    followUp: "",
    prayerNeed: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const canProceed = formData.fullName.trim() && formData.phone.trim() && formData.decision;
  const canSubmit = formData.consent;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { postForm } = await import('@/lib/api');
      await postForm('altar-call', formData);
      setSubmitted(true);
    } catch (err: any) {
      alert(err?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const Inner = (
      <div className={`relative w-full ${modal ? 'max-w-3xl' : 'max-w-3xl'} bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[2fr_3fr] max-h-[90vh]`}>
        <div className="hidden md:block relative">
          <img src={altarImg} alt="Person at altar" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        <button
          onClick={() => (onClose ? onClose() : (window.location.href = '/forms'))}
          className="absolute top-4 right-4 text-foreground/60 hover:bg-sky-100 hover:text-black transition-colors rounded-full p-1 z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Right form area */}
        <div className="flex flex-col px-6 py-8 md:px-8 md:py-10 overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">
                Altar Call
              </h1>
              <span className="text-sm font-medium text-muted-foreground">
                {step}/2
              </span>
            </div>
            {step === 1 && (
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                If you gave your life to Christ or rededicated your walk, please
                fill this form so we can pray with you, support you, and guide
                you in your next steps.
              </p>
            )}
          </div>

          {/* Submitted state */}
          {submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground">Thank You!</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your response has been received. Someone from the church will
                reach out to you soon. God bless you!
              </p>
              <a
                href="/"
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                Return Home
              </a>
            </div>
          ) : (
            <>
              {/* Step 1 */}
              <div
                className={`flex-1 flex flex-col gap-5 transition-all duration-300 ${
                  step === 1
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-8 absolute pointer-events-none"
                }`}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="First & Last Name"
                    value={formData.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                    Phone Number{" "}
                    <span className="font-normal text-muted-foreground">(Preferred Whatsapp)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => update("phone", sanitizePhoneInput(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Which best describes your decision today?
                  </Label>
                  <Select
                    value={formData.decision}
                    onValueChange={(v) => update("decision", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salvation">I gave my life to Christ</SelectItem>
                      <SelectItem value="rededication">I rededicated my life</SelectItem>
                      <SelectItem value="healing">I received healing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`flex-1 flex flex-col gap-5 transition-all duration-300 ${
                  step === 2
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-8 absolute pointer-events-none"
                }`}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="whenDecision" className="text-xs font-semibold text-foreground">
                    When did this decision happen?
                  </Label>
                  <Input
                    id="whenDecision"
                    placeholder="When did this decision happen?"
                    value={formData.whenDecision}
                    onChange={(e) => update("whenDecision", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Would you like someone from the church to follow up?
                  </Label>
                  <Select
                    value={formData.followUp}
                    onValueChange={(v) => update("followUp", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, please</SelectItem>
                      <SelectItem value="no">No, thank you</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prayerNeed" className="text-xs font-semibold text-foreground">
                    Is there anything you would like us to know or pray with you about?
                  </Label>
                  <Textarea
                    id="prayerNeed"
                    placeholder="Tell us your need"
                    rows={3}
                    value={formData.prayerNeed}
                    onChange={(e) => update("prayerNeed", e.target.value)}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(v) => update("consent", !!v)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="consent" className="text-[11px] text-muted-foreground leading-snug cursor-pointer">
                    I understand that this information is confidential and will be handled with care.
                  </Label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 mt-6">
                {step === 2 && (
                  <Button
                    variant="outline"
                    className="flex-1 h-11 text-xs font-semibold tracking-wider rounded-sm"
                    onClick={() => setStep(1)}
                  >
                    PREVIOUS
                  </Button>
                )}
                {step === 1 ? (
                  <Button
                    className="flex-1 h-11 bg-foreground text-background text-xs font-semibold tracking-wider rounded-sm hover:bg-foreground/90"
                    disabled={!canProceed}
                    onClick={() => setStep(2)}
                  >
                    NEXT
                  </Button>
                ) : (
                  <Button
                    className="flex-1 h-11 bg-foreground text-background text-xs font-semibold tracking-wider rounded-sm hover:bg-foreground/90"
                    disabled={!canSubmit || submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? 'SENDING...' : 'SUBMIT FORM'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
  );

  if (modal) return Inner;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      {Inner}
    </div>
  );
};

export default AltarCall;
