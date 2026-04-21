import { useState } from "react";
import { postForm } from "@/lib/api";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import memberImg from "@/assets/newmember_form.jpg";
import { isValidEmail, sanitizePhoneInput } from "@/lib/formValidation";

type Props = {
  modal?: boolean;
  onClose?: () => void;
};

const NewMemberRegistration = ({ modal = false, onClose }: Props) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    occupation: "",
    gender: "",
    maritalStatus: "",
    firstTime: "",
    heardFrom: "",
    prayerRequests: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  const canProceed = form.fullName.trim() && form.phone.trim() && isValidEmail(form.email);
  const canSubmit = form.consent;

  // inner container used both for page and modal rendering
  const Inner = (
    <div className={`relative w-full ${modal ? 'max-w-3xl' : 'max-w-4xl'} bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[1.15fr_1fr] min-h-[640px]`}>
      <div className="hidden md:block relative">
        <img src={memberImg} alt="new member" className="absolute inset-0 w-full h-full object-cover rounded-l-2xl" />
      </div>

      <button
        onClick={() => (onClose ? onClose() : (window.location.href = '/forms'))}
        className="absolute top-4 right-4 text-foreground/60 hover:bg-sky-100 hover:text-black transition-colors rounded-full p-1 z-10"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 md:p-8 flex flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">New Member</h1>
              <span className="text-sm font-medium text-muted-foreground">{step}/2</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 max-w-lg">We would love to know you better. Please complete this form so we can walk with you intentionally, pray with you, and help you find your place in the church.</p>
          </div>

          {submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="font-heading text-lg font-semibold">Thanks — we received your details</h2>
              <p className="text-sm text-muted-foreground mt-2">Someone from the church will reach out to you soon to welcome and connect.</p>
              <a href="/" className="mt-3 text-sm text-primary hover:underline">Return home</a>
            </div>
          ) : (
            <>
              <div className={`flex-1 flex flex-col gap-4 transition-all duration-300 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 absolute pointer-events-none'}`}>
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

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold">Residential Address</Label>
                  <Input id="address" placeholder="Enter Your Address" value={form.address} onChange={(e: any) => update('address', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="occupation" className="text-xs font-semibold">Your Occupation</Label>
                  <Input id="occupation" placeholder="Your Occupation" value={form.occupation} onChange={(e: any) => update('occupation', e.target.value)} />
                </div>

                <div className="mt-6">
                  <Button className="bg-foreground text-background px-6 py-3 rounded-full" disabled={!canProceed} onClick={() => setStep(2)}>NEXT</Button>
                </div>
              </div>

              <div className={`flex-1 flex flex-col gap-4 transition-all duration-300 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute pointer-events-none'}`}>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Marital Status</Label>
                  <Select value={form.maritalStatus} onValueChange={(v) => update('maritalStatus', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="engaged">Engaged</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Is this your first time worshipping with us?</Label>
                  <Select value={form.firstTime} onValueChange={(v) => update('firstTime', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, this is my first time</SelectItem>
                      <SelectItem value="few">I have visited a few times</SelectItem>
                      <SelectItem value="recent">I recently joined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">How did you hear about WaterGate Church?</Label>
                  <Select value={form.heardFrom} onValueChange={(v) => update('heardFrom', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="search">Search</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prayerRequests" className="text-xs font-semibold">Do you have any prayer requests?</Label>
                  <Textarea id="prayerRequests" placeholder="Type your prayer requests" rows={3} value={form.prayerRequests} onChange={(e: any) => update('prayerRequests', e.target.value)} />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox id="consent" checked={form.consent} onCheckedChange={(v: any) => update('consent', !!v)} className="mt-0.5" />
                  <Label htmlFor="consent" className="text-[11px] text-muted-foreground leading-snug cursor-pointer">I agree to be contacted by WaterGate Church for follow-up and pastoral care.</Label>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Button variant="outline" className="h-11 text-xs font-semibold tracking-wider rounded-sm" onClick={() => setStep(1)}>PREVIOUS</Button>
                  <Button
                    className="bg-foreground text-background h-11 text-xs font-semibold tracking-wider rounded-sm"
                    disabled={!canSubmit || submitting}
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        await postForm('new-member', form);
                        setSubmitted(true);
                      } catch (err: any) {
                        alert(err?.message || 'Submission failed');
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >{submitting ? 'SENDING...' : 'SUBMIT FORM'}</Button>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );

  if (modal) {
    return Inner;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      {Inner}
    </div>
  );
};

export default NewMemberRegistration;
