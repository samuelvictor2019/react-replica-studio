import { useState } from "react";
import { postForm } from "@/lib/api";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import eventImg from "@/assets/event_form.jpg";

const EventRegistration = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "",
    days: { thu: false, fri: false, sat: false, sun: false, all: false },
    member: "",
    accommodation: "",
    consent: false,
    contactConsent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  const toggleDay = (d: string) => setForm((s) => ({ ...s, days: { ...s.days, [d]: !s.days[d as keyof typeof s.days] } }));
  const canProceed = form.fullName.trim() && form.phone.trim() && form.email.trim();
  const canSubmit = form.contactConsent;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="relative w-full max-w-4xl bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[1.15fr_1fr] min-h-[640px]">
        <div className="hidden md:block relative">
          <img src={eventImg} alt="event" className="absolute inset-0 w-full h-full object-cover rounded-l-2xl" />
        </div>

        <a href="/forms" className="absolute top-4 right-4 text-foreground/60 hover:bg-sky-100 hover:text-black transition-colors rounded-full p-1 z-10"><X className="w-5 h-5" /></a>

        <div className="p-6 md:p-8 flex flex-col">
          <div className="mb-4">
            <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">Event Registration</h1>
            <p className="text-xs text-muted-foreground mt-2 max-w-lg">Register to attend KDG 2026. Registration helps us prepare adequately and ensure a smooth experience for everyone.</p>
          </div>

          {submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="font-heading text-lg font-semibold">Registered</h2>
              <p className="text-sm text-muted-foreground mt-2">Thanks — we'll be in touch with event details and confirmations.</p>
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
                  <Input id="phone" placeholder="Phone Number" value={form.phone} onChange={(e: any) => update('phone', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                  <Input id="email" placeholder="Email Address" value={form.email} onChange={(e: any) => update('email', e.target.value)} />
                </div>

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

                <div className="mt-6">
                  <Button className="bg-foreground text-background px-6 py-3 rounded-full" disabled={!canProceed} onClick={() => setStep(2)}>NEXT</Button>
                </div>
              </div>

              <div className={`flex-1 flex flex-col gap-4 transition-all duration-300 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute pointer-events-none'}`}>
                <div>
                  <Label className="text-xs font-semibold">Which days will you be attending?</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.days.thu} onCheckedChange={() => toggleDay('thu')} /> Thursday (19th Dec)</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.days.fri} onCheckedChange={() => toggleDay('fri')} /> Friday (20th Dec)</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.days.sat} onCheckedChange={() => toggleDay('sat')} /> Saturday (21st Dec)</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.days.sun} onCheckedChange={() => toggleDay('sun')} /> Sunday (22nd Dec)</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.days.all} onCheckedChange={() => toggleDay('all')} /> All Days</label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Are you a member of WaterGate Church?</Label>
                  <Select value={form.member} onValueChange={(v) => update('member', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="first-time">First-time visitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Do you need an accommodation?</Label>
                  <Select value={form.accommodation} onValueChange={(v) => update('accommodation', v)}>
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
                  <Checkbox checked={form.consent} onCheckedChange={(v) => update('consent', !!v)} />
                  <Label className="text-[11px]">I understand that this event is free, but registration is required for planning purposes.</Label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox checked={form.contactConsent} onCheckedChange={(v) => update('contactConsent', !!v)} />
                  <Label className="text-[11px]">I consent to be contacted regarding this event.</Label>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Button variant="outline" className="h-11 text-xs font-semibold tracking-wider rounded-sm" onClick={() => setStep(1)}>PREVIOUS</Button>
                  <Button
                    className="bg-foreground text-background h-11 text-xs font-semibold tracking-wider rounded-sm"
                    disabled={!canSubmit || submitting}
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        await postForm('event-registration', form);
                        setSubmitted(true);
                      } catch (err: any) {
                        alert(err?.message || 'Submission failed');
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >{submitting ? 'SENDING...' : 'REGISTER'}</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;
