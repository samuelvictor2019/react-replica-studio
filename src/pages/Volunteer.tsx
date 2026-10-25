import { useState } from "react";
import { postForm, describePublicError } from "@/lib/api";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PublicInlineAlert } from "@/components/public/PublicInlineAlert";
import { PublicSuccessView } from "@/components/public/PublicSuccessView";
import volunteerImg from "@/assets/volunteer_form.jpg";
import { isValidEmail, sanitizePhoneInput } from "@/lib/formValidation";

type Props = { modal?: boolean; onClose?: () => void };

const Volunteer = ({ modal = false, onClose }: Props) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    member: "",
    serveArea: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const primaryButtonClass = "h-12 rounded-full bg-[#1b2545] text-white hover:bg-sky-100 hover:text-black px-8 text-sm font-medium tracking-normal";
  const secondaryButtonClass = "h-12 rounded-full bg-[#d6d9e4] text-black hover:bg-sky-100 hover:text-black px-8 text-sm font-medium tracking-normal";

  const update = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  
  const canProceed = form.fullName.trim() && form.phone.trim() && isValidEmail(form.email);
  const canSubmit = form.member && form.serveArea && form.consent;

  const Inner = (
    <div className={`relative w-full ${modal ? 'max-w-3xl' : 'max-w-4xl'} bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_2fr]`}>
      <div className="hidden md:block relative">
        <img src={volunteerImg} alt="volunteer" className="absolute inset-0 w-full h-full object-cover rounded-l-2xl" />
      </div>

      <button onClick={() => (onClose ? onClose() : (window.location.href = '/forms'))} className="absolute top-4 right-4 text-foreground/60 hover:bg-sky-100 hover:text-black transition-colors rounded-full p-1 z-10">
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 md:p-8 flex flex-col">
        {!submitted && (
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">Volunteer</h1>
              <span className="text-sm font-medium text-muted-foreground">
                {step}/2
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg">Thank you for your heart to serve in God's house. Tell us where you feel led, and we'll guide you through the next steps.</p>
          </div>
        )}

        {submitted ? (
          <PublicSuccessView
            title="Thank You!"
            description="We've received your volunteer form. Someone from the team will reach out soon."
            actionText="Submit Another Response"
            onAction={() => {
              setForm({
                fullName: "",
                phone: "",
                email: "",
                member: "",
                serveArea: "",
                consent: false,
              });
              setStep(1);
              setSubmitted(false);
              setSubmitError(null);
            }}
          />
        ) : (
          <div className="relative flex-1 overflow-hidden">
            <div className="relative w-full h-full">

              {/* Step 1 */}
              <div
                className={`flex flex-col gap-4 transition-all duration-300 ${
                  step === 1
                    ? "opacity-100 translate-x-0 relative"
                    : "opacity-0 -translate-x-8 absolute inset-0 pointer-events-none"
                }`}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold">Full Name</Label>
                  <Input id="fullName" placeholder="First & Last Name" value={form.fullName} onChange={(e: any) => update('fullName', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">Phone Number <span className="font-normal text-muted-foreground">(Preferred Whatsapp)</span></Label>
                  <Input id="phone" type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="Phone Number" value={form.phone} onChange={(e: any) => update('phone', sanitizePhoneInput(e.target.value))} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                  <Input id="email" type="email" placeholder="Email Address" value={form.email} onChange={(e: any) => update('email', e.target.value)} />
                </div>

                <div className="pt-4 flex items-center justify-start gap-3">
                  <Button
                    type="button"
                    className={primaryButtonClass}
                    disabled={!canProceed}
                    onClick={() => setStep(2)}
                  >
                    NEXT
                  </Button>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`flex flex-col gap-4 transition-all duration-300 ${
                  step === 2
                    ? "opacity-100 translate-x-0 relative"
                    : "opacity-0 translate-x-8 absolute inset-0 pointer-events-none"
                }`}
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Are you a member of WaterGate Church?</Label>
                  <Select value={form.member} onValueChange={(v) => update('member', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="inprocess">In the process</SelectItem>
                      <SelectItem value="notyet">Not yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Where would you like to serve?</Label>
                  <Select value={form.serveArea} onValueChange={(v) => update('serveArea', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multimedia">Multi-Media</SelectItem>
                      <SelectItem value="worship">Worship Team</SelectItem>
                      <SelectItem value="ushering">Ushering / Sanitation</SelectItem>
                      <SelectItem value="children">Children / Teens</SelectItem>
                      <SelectItem value="evangelism">Evangelism / Outreach</SelectItem>
                      <SelectItem value="protocol">Protocol</SelectItem>
                      <SelectItem value="welfare">Welfare / Transportation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <Checkbox checked={form.consent} onCheckedChange={(v) => update('consent', !!v)} />
                  <Label className="text-[11px] leading-tight">I understand that serving may require training and leadership approval.</Label>
                </div>

                {submitError && (
                  <PublicInlineAlert
                    type="error"
                    message={submitError}
                    onDismiss={() => setSubmitError(null)}
                    className="mt-4"
                  />
                )}

                <div className="pt-4 flex items-center justify-start gap-3">
                  <Button
                    type="button"
                    disabled={submitting}
                    className={secondaryButtonClass}
                    onClick={() => setStep(1)}
                  >
                    BACK
                  </Button>
                  <Button
                    className={primaryButtonClass}
                    disabled={!canSubmit || submitting}
                    onClick={async () => {
                      if (submitting) return;
                      setSubmitting(true);
                      setSubmitError(null);
                      try {
                        await postForm('volunteer', form);
                        setSubmitted(true);
                      } catch (err: any) {
                        setSubmitError(describePublicError(err, 'Failed to submit volunteer form. Please try again.'));
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        SUBMITTING...
                      </>
                    ) : (
                      'SUBMIT'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (modal) return Inner;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      {Inner}
    </div>
  );
};

export default Volunteer;
