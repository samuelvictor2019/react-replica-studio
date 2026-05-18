import { useState } from "react";
import { postForm } from "@/lib/api";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import coupleImg from "@/assets/premarital_form.jpg";
import { isValidEmail, sanitizePhoneInput } from "@/lib/formValidation";

type Props = { modal?: boolean; onClose?: () => void };

const PreMaritalCounseling = ({ modal = false, onClose }: Props) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    brideName: "",
    groomName: "",
    phone: "",
    email: "",
    activeMember: "",
    housePastor: "",
    proposedDate: "",
    proposedLocation: "",
    priorCounseling: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: string, v: string | boolean) => setForm((s) => ({ ...s, [k]: v }));
  const canProceed = form.brideName.trim() && form.groomName.trim() && form.phone.trim() && isValidEmail(form.email);
  const canSubmit = form.consent;
  const primaryButtonClass = "h-12 rounded-full bg-[#1b2545] text-white hover:bg-sky-100 hover:text-black px-8 text-sm font-medium tracking-normal";
  const secondaryButtonClass = "h-12 rounded-full bg-[#d6d9e4] text-black hover:bg-sky-100 hover:text-black px-8 text-sm font-medium tracking-normal";

  const Inner = (
      <div className={`relative w-full ${modal ? 'max-w-3xl h-full md:h-auto md:max-h-[90vh]' : 'max-w-4xl'} bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_2fr]`}>
        <div className="hidden md:block relative">
          <img src={coupleImg} alt="couple" className="absolute inset-0 w-full h-full object-cover rounded-l-2xl" />
        </div>

        <button onClick={() => (onClose ? onClose() : (window.location.href = '/forms'))} className="absolute top-4 right-4 text-foreground/60 hover:bg-sky-100 hover:text-black transition-colors rounded-full p-1 z-10"><X className="w-5 h-5" /></button>

        <div className="p-6 md:p-8 flex flex-col overflow-y-auto">
          {!submitted && (
            <div className="mb-4">
              <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">Pre-Marital Counseling</h1>
              <p className="text-xs text-muted-foreground mt-2 max-w-lg">Marriage is a sacred covenant. Our pastoral team is ready to walk with you through biblical foundations for a godly and lasting union.</p>
            </div>
          )}

          {submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="font-heading text-lg font-semibold">Request Submitted</h2>
              <p className="text-sm text-muted-foreground mt-2">Our pastoral team will review your request and contact you about next steps.</p>
              <a href="/" className="mt-3 text-sm text-primary hover:underline">Return home</a>
            </div>
          ) : (
            <>
              {/* Step 1 */}
              <div className={`flex-1 flex flex-col gap-4 transition-all duration-300 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 absolute pointer-events-none'}`}>
                <div className="space-y-1.5">
                  <Label htmlFor="brideName" className="text-xs font-semibold">Bride's Full Name</Label>
                  <Input id="brideName" placeholder="First & Last Name" value={form.brideName} onChange={(e: any) => update('brideName', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="groomName" className="text-xs font-semibold">Groom's Full Name</Label>
                  <Input id="groomName" placeholder="First & Last Name" value={form.groomName} onChange={(e: any) => update('groomName', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">Primary Contact Phone Number</Label>
                  <Input id="phone" type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="Phone Number" value={form.phone} onChange={(e: any) => update('phone', sanitizePhoneInput(e.target.value))} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                  <Input id="email" type="email" placeholder="Email Address" value={form.email} onChange={(e: any) => update('email', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Are you active members of WaterGate Church?</Label>
                  <Select value={form.activeMember} onValueChange={(v) => update('activeMember', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, both of us</SelectItem>
                      <SelectItem value="one">One of us</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6">
                  <Button className={primaryButtonClass} disabled={!canProceed} onClick={() => setStep(2)}>NEXT</Button>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex-1 flex flex-col gap-4 transition-all duration-300 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute pointer-events-none'}`}>
                <div className="space-y-1.5">
                  <Label htmlFor="housePastor" className="text-xs font-semibold">House Group Pastor (If applicable)</Label>
                  <Input id="housePastor" placeholder="House Pastors Name" value={form.housePastor} onChange={(e: any) => update('housePastor', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="proposedDate" className="text-xs font-semibold">Proposed Wedding Date (If Known)</Label>
                  <Input id="proposedDate" placeholder="Proposed Wedding Date" value={form.proposedDate} onChange={(e: any) => update('proposedDate', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="proposedLocation" className="text-xs font-semibold">Proposed Wedding Location</Label>
                  <Input id="proposedLocation" placeholder="Proposed Wedding Location" value={form.proposedLocation} onChange={(e: any) => update('proposedLocation', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Have you had any pre-marital counseling before?</Label>
                  <Select value={form.priorCounseling} onValueChange={(v) => update('priorCounseling', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox id="consent" checked={form.consent} onCheckedChange={(v: any) => update('consent', !!v)} />
                  <Label className="text-[11px]">I understand that pre-marital counseling is mandatory for weddings conducted by WaterGate Church.</Label>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Button variant="outline" className={secondaryButtonClass} onClick={() => setStep(1)}>PREVIOUS</Button>
                  <Button
                    className={primaryButtonClass}
                    disabled={!canSubmit || submitting}
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        await postForm('pre-marital-counseling', form);
                        setSubmitted(true);
                      } catch (err: any) {
                        alert(err?.message || 'Submission failed');
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >{submitting ? 'SENDING...' : 'SUBMIT REQUEST'}</Button>
                </div>
              </div>
            </>
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

export default PreMaritalCounseling;
