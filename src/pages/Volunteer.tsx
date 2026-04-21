import { useState } from "react";
import { postForm } from "@/lib/api";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import volunteerImg from "@/assets/volunteer_form.jpg";
import { isValidEmail, sanitizePhoneInput } from "@/lib/formValidation";

type Props = { modal?: boolean; onClose?: () => void };

const Volunteer = ({ modal = false, onClose }: Props) => {
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

  const update = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  const canSubmit = form.fullName.trim() && form.phone.trim() && isValidEmail(form.email) && form.consent;

  const Inner = (
    <div className={`relative w-full ${modal ? 'max-w-3xl' : 'max-w-4xl'} bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[1.15fr_1fr] max-h-[90vh]`}>
      <div className="hidden md:block relative">
        <img src={volunteerImg} alt="volunteer" className="absolute inset-0 w-full h-full object-cover rounded-l-2xl" />
      </div>

      <button onClick={() => (onClose ? onClose() : (window.location.href = '/forms'))} className="absolute top-4 right-4 text-foreground/60 hover:bg-sky-100 hover:text-black transition-colors rounded-full p-1 z-10">
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 md:p-8 flex flex-col overflow-y-auto">
        <div className="mb-4">
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">Volunteer</h1>
          <p className="text-xs text-muted-foreground mt-1">Thank you for your heart to serve in God's house. Tell us where you feel led, and we'll guide you through the next steps.</p>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="font-heading text-lg font-semibold">Thank You!</h2>
            <p className="text-sm text-muted-foreground mt-2">We've received your volunteer form. Someone from the team will reach out soon.</p>
            <a href="/" className="mt-3 text-sm text-primary hover:underline">Return home</a>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
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

            <div className="flex items-start gap-2">
              <Checkbox checked={form.consent} onCheckedChange={(v) => update('consent', !!v)} />
              <Label className="text-[11px]">I understand that serving may require training and leadership approval.</Label>
            </div>

            <div className="mt-4">
              <Button
                className="bg-foreground text-background h-11 px-8 text-xs font-semibold tracking-wider rounded-sm"
                disabled={!canSubmit || submitting}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await postForm('volunteer', form);
                    setSubmitted(true);
                  } catch (err: any) {
                    alert(err?.message || 'Submission failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >{submitting ? 'SUBMITTING...' : 'SUBMIT'}</Button>
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
