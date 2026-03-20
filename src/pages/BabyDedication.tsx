import { useState } from "react";
import { X } from "lucide-react";
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
import babyImg from "@/assets/babydedication_form.jpg";

const BabyDedication = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    parentName: "",
    phone: "",
    babyName: "",
    dob: "",
    activeMember: "",
    preferredDate: "",
    notes: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const canProceed = formData.parentName.trim() && formData.phone.trim() && formData.babyName.trim() && formData.dob;
  const canSubmit = formData.consent;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { postForm } = await import('@/lib/api');
      await postForm('baby-dedication', formData);
      setSubmitted(true);
    } catch (err: any) {
      alert(err?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="relative w-full max-w-4xl bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[1.2fr_1fr] min-h-[560px]">
        {/* Left image */}
        <div className="hidden md:block relative">
          <img src={babyImg} alt="Baby" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        {/* Close button */}
        <a href="/forms" className="absolute top-4 right-4 text-foreground/60 hover:bg-sky-100 hover:text-black transition-colors rounded-full p-1 z-10" aria-label="Close">
          <X className="w-5 h-5" />
        </a>

        {/* Right form area */}
        <div className="flex flex-col px-6 py-8 md:px-8 md:py-10 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">Baby Dedication</h1>
              <span className="text-sm font-medium text-muted-foreground">{step}/2</span>
            </div>
            {step === 1 && (
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                This helps us schedule and prepare for your baby dedication.
              </p>
            )}
          </div>

          {submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground">Thank You!</h2>
              <p className="text-sm text-muted-foreground max-w-xs">Your response has been received. Someone from the church will reach out to you soon.</p>
              <a href="/" className="mt-2 text-sm font-medium text-primary hover:underline">Return Home</a>
            </div>
          ) : (
            <>
              <div className={`flex-1 flex flex-col gap-5 transition-all duration-300 ${step === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8 absolute pointer-events-none"}`}>
                <div className="space-y-1.5">
                  <Label htmlFor="parentName" className="text-xs font-semibold text-foreground">Parent(s) Full Name(s)</Label>
                  <Input id="parentName" placeholder="First & Last Name" value={formData.parentName} onChange={(e) => update('parentName', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-foreground">Phone Number <span className="font-normal text-muted-foreground">(Preferred Whatsapp)</span></Label>
                  <Input id="phone" placeholder="Phone Number" value={formData.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="babyName" className="text-xs font-semibold text-foreground">Baby's Full Name</Label>
                  <Input id="babyName" placeholder="Baby's Full Name" value={formData.babyName} onChange={(e) => update('babyName', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="text-xs font-semibold text-foreground">Date of Birth</Label>
                  <Input id="dob" placeholder="Date of Birth" value={formData.dob} onChange={(e) => update('dob', e.target.value)} />
                </div>
              </div>

              <div className={`flex-1 flex flex-col gap-5 transition-all duration-300 ${step === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 absolute pointer-events-none"}`}>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Are you active members of WaterGate Church?</Label>
                  <Select value={formData.activeMember} onValueChange={(v) => update('activeMember', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preferredDate" className="text-xs font-semibold text-foreground">Preferred Dedication Date</Label>
                  <Input id="preferredDate" placeholder="Preferred Dedication Date" value={formData.preferredDate} onChange={(e) => update('preferredDate', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold text-foreground">Any special notes or considerations?</Label>
                  <Textarea id="notes" placeholder="Any special notes or considerations?" rows={3} value={formData.notes} onChange={(e) => update('notes', e.target.value)} />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox id="consent" checked={formData.consent} onCheckedChange={(v) => update('consent', !!v)} className="mt-0.5" />
                  <Label htmlFor="consent" className="text-[11px] text-muted-foreground leading-snug cursor-pointer">I understand dedication dates are confirmed by the church.</Label>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                {step === 2 && (
                  <Button variant="outline" className="flex-1 h-11 text-xs font-semibold tracking-wider rounded-sm" onClick={() => setStep(1)}>PREVIOUS</Button>
                )}

                {step === 1 ? (
                  <Button className="flex-1 h-11 bg-foreground text-background text-xs font-semibold tracking-wider rounded-sm hover:bg-foreground/90" disabled={!canProceed} onClick={() => setStep(2)}>NEXT</Button>
                ) : (
                  <Button className="flex-1 h-11 bg-foreground text-background text-xs font-semibold tracking-wider rounded-sm hover:bg-foreground/90" disabled={!canSubmit || submitting} onClick={handleSubmit}>{submitting ? 'SENDING...' : 'SUBMIT FORM'}</Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BabyDedication;
