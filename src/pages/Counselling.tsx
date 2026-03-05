import { useState } from "react";
import { postForm } from "@/lib/api";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import counsellingImg from "@/assets/community-4.jpg";

type Props = { modal?: boolean; onClose?: () => void };

const Counselling = ({ modal = false, onClose }: Props) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    type: "",
    message: "",
    session: "",
    member: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  const canProceed = form.fullName.trim() && form.phone.trim() && form.email.trim();
  const canSubmit = form.consent;

  const Inner = (
      <div className={`relative w-full ${modal ? 'max-w-3xl' : 'max-w-4xl'} bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[1.15fr_1fr] max-h-[90vh]`}>
        <div className="hidden md:block relative">
          <img src={counsellingImg} alt="counselling" className="absolute inset-0 w-full h-full object-cover rounded-l-2xl" />
        </div>

        <button onClick={() => (onClose ? onClose() : (window.location.href = '/forms'))} className="absolute top-4 right-4 text-foreground/60 hover:text-foreground z-10"><X className="w-5 h-5" /></button>

        <div className="p-6 md:p-8 flex flex-col overflow-y-auto">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">Counseling Request</h1>
              <p className="text-xs text-muted-foreground mt-1">You're not alone — we're here to walk with you.</p>
            </div>
            <div className="text-sm text-muted-foreground">{step}/2</div>
          </div>

          {submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="font-heading text-lg font-semibold">Request Sent</h2>
              <p className="text-sm text-muted-foreground mt-2">Thanks — our pastoral team will review and reach out to you.</p>
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
                  <Label className="text-xs font-semibold">What type of counselling are you requesting?</Label>
                  <Select value={form.type} onValueChange={(v) => update('type', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal / Spiritual Growth</SelectItem>
                      <SelectItem value="family">Family / Parenting</SelectItem>
                      <SelectItem value="marriage">Marriage / Relationship</SelectItem>
                      <SelectItem value="emotional">Emotional / Life Challenges</SelectItem>
                      <SelectItem value="career">Career / Direction</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6">
                  <Button className="bg-foreground text-background px-6 py-3 rounded-full" disabled={!canProceed} onClick={() => setStep(2)}>NEXT</Button>
                </div>
              </div>

              <div className={`flex-1 flex flex-col gap-4 transition-all duration-300 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute pointer-events-none'}`}>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Please briefly describe your situation or concern</Label>
                  <Textarea placeholder="Please share your message" value={form.message} onChange={(e: any) => update('message', e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">How would you prefer the counselling session?</Label>
                  <Select value={form.session} onValueChange={(v) => update('session', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inperson">In-person (Church)</SelectItem>
                      <SelectItem value="phone">Phone call</SelectItem>
                      <SelectItem value="online">Online (Zoom / Google Meet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Are you a member of WaterGate Church?</Label>
                  <Select value={form.member} onValueChange={(v) => update('member', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Your Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="inprocess">In the process</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox checked={form.consent} onCheckedChange={(v) => update('consent', !!v)} />
                  <Label className="text-[11px]">I understand that counselling is pastoral, confidential, and subject to availability and scheduling.</Label>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Button variant="outline" className="h-11 text-xs font-semibold tracking-wider rounded-sm" onClick={() => setStep(1)}>PREVIOUS</Button>
                  <Button
                    className="bg-foreground text-background h-11 text-xs font-semibold tracking-wider rounded-sm"
                    disabled={!canSubmit || submitting}
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        await postForm('counselling', form);
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

export default Counselling;
