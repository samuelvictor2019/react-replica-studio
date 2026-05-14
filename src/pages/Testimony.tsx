import { useState } from "react";
import { postForm } from "@/lib/api";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import waveImg from "@/assets/testimony_form.jpg";
import { sanitizePhoneInput } from "@/lib/formValidation";

type Props = { modal?: boolean; onClose?: () => void };

const Testimony = ({ modal = false, onClose }: Props) => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    title: "",
    testimony: "",
    shareOption: "",
    confirm: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: string, v: string | boolean) => setForm((s) => ({ ...s, [k]: v }));

  const canSubmit = form.testimony.trim().length > 0 && form.shareOption;

  const Inner = (
      <div className={`relative w-full ${modal ? 'max-w-3xl h-full md:h-auto md:max-h-[90vh]' : 'max-w-4xl'} bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_2fr]`}>
        <div className="hidden md:block relative">
          <img src={waveImg} alt="wave" className="absolute inset-0 w-full h-full object-cover rounded-l-2xl" />
        </div>

        <button onClick={() => (onClose ? onClose() : (window.location.href = '/forms'))} className="absolute top-4 right-4 text-foreground/60 hover:bg-sky-100 hover:text-black transition-colors rounded-full p-1 z-10"><X className="w-5 h-5" /></button>

        <div className="p-6 md:p-8 flex flex-col overflow-y-auto">
          {!submitted && (
            <div className="mb-4">
              <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">Testimony</h1>
              <p className="text-xs text-muted-foreground mt-2 max-w-lg">Has God done something beautiful in your life? Your testimony can strengthen and bless others.</p>
            </div>
          )}

          {submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="font-heading text-lg font-semibold">Thank you — testimony submitted</h2>
              <p className="text-sm text-muted-foreground mt-2">We appreciate you sharing — we will follow up according to your sharing preference.</p>
              <a href="/" className="mt-3 text-sm text-primary hover:underline">Return home</a>
            </div>
          ) : (
            <form className="space-y-4">
              <div>
                <Label className="text-xs font-semibold">Full Name <span className="font-normal text-muted-foreground">(Optional)</span></Label>
                <Input placeholder="First & Last Name" value={form.fullName} onChange={(e: any) => update('fullName', e.target.value)} />
              </div>

              <div>
                <Label className="text-xs font-semibold">Phone Number <span className="font-normal text-muted-foreground">(Preferred Whatsapp)</span></Label>
                <Input type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="Phone Number" value={form.phone} onChange={(e: any) => update('phone', sanitizePhoneInput(e.target.value))} />
              </div>

              <div>
                <Label className="text-xs font-semibold">Title of Testimony</Label>
                <Input placeholder="Title of Testimony" value={form.title} onChange={(e: any) => update('title', e.target.value)} />
              </div>

              <div>
                <Label className="text-xs font-semibold">Please share your testimony</Label>
                <Textarea placeholder="Type your long testimony" rows={6} value={form.testimony} onChange={(e: any) => update('testimony', e.target.value)} />
              </div>

              <div>
                <Label className="text-xs font-semibold">Can we share this testimony publicly?</Label>
                <Select onValueChange={(v) => update('shareOption', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Your Option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="anonymous">Yes, but anonymously</SelectItem>
                    <SelectItem value="no">No (for pastoral record only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox checked={form.confirm} onCheckedChange={(v: any) => update('confirm', !!v)} />
                <Label className="text-xs">I confirm this testimony is true and shared willingly.</Label>
              </div>

              <div className="pt-4">
                <Button
                  className="bg-foreground text-background h-12 px-10 text-sm font-semibold tracking-[0.08em] rounded-full hover:bg-foreground/90"
                  disabled={!canSubmit || submitting}
                  onClick={async (e) => {
                    e.preventDefault();
                    setSubmitting(true);
                    try {
                      await postForm('testimony', form);
                      setSubmitted(true);
                    } catch (err: any) {
                      alert(err?.message || 'Submission failed');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >{submitting ? 'SENDING...' : 'SUBMIT TESTIMONY'}</Button>
              </div>
            </form>
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

export default Testimony;
