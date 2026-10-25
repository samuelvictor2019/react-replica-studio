import { useState } from "react";
import { postForm, describePublicError } from "@/lib/api";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PublicInlineAlert } from "@/components/public/PublicInlineAlert";
import { PublicSuccessView } from "@/components/public/PublicSuccessView";
import feedbackImg from "@/assets/feedback_form.jpg";
import { sanitizePhoneInput } from "@/lib/formValidation";

type Props = { modal?: boolean; onClose?: () => void };

const Feedback = ({ modal = false, onClose }: Props) => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    feedbackType: "",
    message: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const primaryButtonClass = "h-12 rounded-full bg-[#1b2545] text-white hover:bg-sky-100 hover:text-black px-8 text-sm font-medium tracking-normal";

  const update = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  const canSubmit = form.message.trim() && form.consent;

  const Inner = (
    <div className={`relative w-full ${modal ? 'max-w-3xl' : 'max-w-4xl'} bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_2fr]`}>
      <div className="hidden md:block relative">
        <img src={feedbackImg} alt="feedback" className="absolute inset-0 w-full h-full object-cover rounded-l-2xl" />
      </div>

      <button onClick={() => (onClose ? onClose() : (window.location.href = '/forms'))} className="absolute top-4 right-4 text-foreground/60 hover:bg-sky-100 hover:text-black transition-colors rounded-full p-1 z-10">
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 md:p-8 flex flex-col">
        {!submitted && (
          <div className="mb-4">
            <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">Feedback/Suggestion</h1>
            <p className="text-xs text-muted-foreground mt-1">Help us serve you better. We value your thoughts and ideas.</p>
          </div>
        )}

        {submitted ? (
          <PublicSuccessView
            title="Thank You!"
            description="Your feedback has been received. We appreciate your input."
            actionText="Submit Another Response"
            onAction={() => {
              setForm({
                fullName: "",
                phone: "",
                feedbackType: "",
                message: "",
                consent: false,
              });
              setSubmitted(false);
              setSubmitError(null);
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold">Full Name <span className="font-normal text-muted-foreground">(Optional)</span></Label>
              <Input id="fullName" placeholder="First & Last Name" value={form.fullName} onChange={(e: any) => update('fullName', e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold">Phone Number <span className="font-normal text-muted-foreground">(Preferred Whatsapp)</span></Label>
              <Input id="phone" type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="Phone Number" value={form.phone} onChange={(e: any) => update('phone', sanitizePhoneInput(e.target.value))} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Feedback Type</Label>
              <Select value={form.feedbackType} onValueChange={(v) => update('feedbackType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Your Option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="concern">Concern</SelectItem>
                  <SelectItem value="appreciation">Appreciation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Message</Label>
              <Textarea placeholder="Please share your message" value={form.message} onChange={(e: any) => update('message', e.target.value)} />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox checked={form.consent} onCheckedChange={(v) => update('consent', !!v)} />
              <Label className="text-[11px]">I understand this feedback will be reviewed by the church leadership.</Label>
            </div>

            {submitError && (
              <PublicInlineAlert
                type="error"
                message={submitError}
                onDismiss={() => setSubmitError(null)}
                className="mt-4"
              />
            )}

            <div className="mt-4 flex items-center justify-start gap-3">
              <Button
                type="button"
                className={primaryButtonClass}
                disabled={!canSubmit || submitting}
                onClick={async () => {
                  if (submitting) return;
                  setSubmitting(true);
                  setSubmitError(null);
                  try {
                    await postForm('feedback', form);
                    setSubmitted(true);
                  } catch (err: any) {
                    setSubmitError(describePublicError(err, 'Failed to submit feedback. Please try again.'));
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
                  'SUBMIT FEEDBACK'
                )}
              </Button>
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

export default Feedback;
