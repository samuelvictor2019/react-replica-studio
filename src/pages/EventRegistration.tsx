import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getRegistrationEvent, registerEventParticipant, describePublicError } from "@/lib/api";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PublicInlineAlert } from "@/components/public/PublicInlineAlert";
import { PublicSuccessView } from "@/components/public/PublicSuccessView";
import eventImg from "@/assets/event_form.jpg";
import { isValidEmail, sanitizePhoneInput } from "@/lib/formValidation";
import { getStorageItem, setStorageItem } from "@/lib/storage";

const LOCAL_EVENT_REGISTRATIONS_KEY = 'wgc_event_registrations';

const EventRegistration = () => {
  const navigate = useNavigate();
  const { registrationIdentifier: pathIdentifier } = useParams();
  const [searchParams] = useSearchParams();
  const registrationIdentifier = pathIdentifier || searchParams.get('eventId') || '';

  const [step, setStep] = useState(1);
  const [eventDetails, setEventDetails] = useState<{
    id: string;
    title: string;
    type?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
  } | null>(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventLoadError, setEventLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "",
    selectedDays: [] as string[],
    allDays: false,
    member: "",
    accommodation: "",
    consent: false,
    contactConsent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  const canProceed = Boolean(eventDetails?.id) && form.fullName.trim() && form.phone.trim() && isValidEmail(form.email);
  const canSubmit = Boolean(eventDetails?.id && form.contactConsent);

  const persistLocalRegistration = () => {
    try {
      const existingRaw = getStorageItem(LOCAL_EVENT_REGISTRATIONS_KEY, "local");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const list = Array.isArray(existing) ? existing : [];
      const record = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        data: {
          gender: form.gender,
          selectedDays: form.selectedDays,
          allDays: form.allDays,
          member: form.member.toLowerCase() === "yes" ? true : false,
          accommodation: form.accommodation,
          eventId: eventDetails?.id,
          eventTitle: eventDetails?.title,
          eventType: eventDetails?.type,
          eventLocation: eventDetails?.location,
          eventStartDate: eventDetails?.startDate,
          eventEndDate: eventDetails?.endDate,
        },
      };
      setStorageItem(LOCAL_EVENT_REGISTRATIONS_KEY, JSON.stringify([record, ...list].slice(0, 500)), "local");
    } catch (error) {
      console.warn('Failed to persist local event registration:', error);
    }
  };

  useEffect(() => {
    setEventDetails(null);
    setEventLoadError(null);
    if (!registrationIdentifier) {
      setEventLoading(false);
      return;
    }

    let isCurrentRequest = true;
    const loadEvent = async () => {
      try {
        setEventLoading(true);
        const event = await getRegistrationEvent(registrationIdentifier);
        if (isCurrentRequest) {
          setEventDetails(event ? {
            id: event.id,
            title: event.title || 'Event Registration',
            type: event.eventType?.name || event.type || undefined,
            location: event.location || undefined,
            startDate: event.startDate || undefined,
            endDate: event.endDate || undefined,
          } : null);
        }
      } catch (error) {
        console.warn('Failed to load event for registration:', error);
        if (isCurrentRequest) {
          setEventLoadError('We could not reach event registration right now. Please refresh and try again.');
        }
      } finally {
        if (isCurrentRequest) setEventLoading(false);
      }
    };

    loadEvent();
    return () => {
      isCurrentRequest = false;
    };
  }, [registrationIdentifier]);

  const formatEventDate = (startDate?: string, endDate?: string) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return '';

    if (!endDate) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const startText = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endText = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startText} - ${endText}`;
  };

  const eventDayOptions = useMemo(() => {
    if (!eventDetails?.startDate) {
      return [
        { key: 'thu', label: 'Thursday' },
        { key: 'fri', label: 'Friday' },
        { key: 'sat', label: 'Saturday' },
        { key: 'sun', label: 'Sunday' },
      ];
    }

    const start = new Date(eventDetails.startDate);
    const end = new Date(eventDetails.endDate || eventDetails.startDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return [
        { key: 'thu', label: 'Thursday' },
        { key: 'fri', label: 'Friday' },
        { key: 'sat', label: 'Saturday' },
        { key: 'sun', label: 'Sunday' },
      ];
    }

    const options: Array<{ key: string; label: string }> = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      const dayLabel = cursor.toLocaleDateString('en-US', { weekday: 'long' });
      const dateLabel = cursor.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      options.push({ key, label: `${dayLabel} (${dateLabel})` });
      cursor.setDate(cursor.getDate() + 1);
    }

    return options;
  }, [eventDetails?.startDate, eventDetails?.endDate]);

  const toggleDay = (dayKey: string) => {
    if (dayKey === 'all') {
      setForm((prev) => {
        const nextAll = !prev.allDays;
        return {
          ...prev,
          allDays: nextAll,
          selectedDays: nextAll ? eventDayOptions.map((option) => option.key) : [],
        };
      });
      return;
    }

    setForm((prev) => {
      const isSelected = prev.selectedDays.includes(dayKey);
      const selectedDays = isSelected
        ? prev.selectedDays.filter((key) => key !== dayKey)
        : [...prev.selectedDays, dayKey];

      const allDays = eventDayOptions.length > 0 && selectedDays.length === eventDayOptions.length;
      return { ...prev, selectedDays, allDays };
    });
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-[2px]">
      <div className="relative my-auto grid w-full max-w-4xl grid-rows-[minmax(0,1fr)] grid-cols-1 overflow-hidden rounded-2xl bg-background shadow-2xl md:grid-cols-[1.15fr_1fr] min-h-[min(640px,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)]">
        <div className="hidden md:block relative">
          <img src={eventImg} alt="event" className="absolute inset-0 w-full h-full object-cover rounded-l-2xl" />
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-foreground/60 hover:bg-sky-100 hover:text-black transition-colors rounded-full p-1 z-10"
          aria-label="Close registration form"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="min-h-0 overflow-y-auto p-6 md:p-8 flex flex-col">
          {!submitted && (
            <div className="mb-4">
              <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">Event Registration</h1>
              <p className="text-xs text-muted-foreground mt-2 max-w-lg">
                {eventDetails?.title
                  ? `Register to attend ${eventDetails.title}.`
                  : 'Register to attend this event.'}{' '}
                Registration helps us prepare adequately and ensure a smooth experience for everyone.
              </p>
              {eventLoading && <p className="text-[11px] text-muted-foreground mt-2">Loading event details...</p>}
              {!eventLoading && !eventDetails && (
                <PublicInlineAlert
                  type="error"
                  message={eventLoadError || 'This registration link is invalid or the event is unavailable.'}
                  className="mt-3"
                />
              )}
              {eventDetails && (
                <div className="mt-3 rounded-md border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{eventDetails.title}</p>
                  {eventDetails.type && <p className="text-[11px] text-muted-foreground">Type: {eventDetails.type}</p>}
                  {eventDetails.location && <p className="text-[11px] text-muted-foreground">Venue: {eventDetails.location}</p>}
                  {formatEventDate(eventDetails.startDate, eventDetails.endDate) && (
                    <p className="text-[11px] text-muted-foreground">Date: {formatEventDate(eventDetails.startDate, eventDetails.endDate)}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {submitted ? (
            <PublicSuccessView
              title="Registered Successfully"
              description="Thanks — we'll be in touch with event details and confirmations."
              actionText="Register Another Person"
              onAction={() => {
                setForm({
                  fullName: "",
                  phone: "",
                  email: "",
                  gender: "",
                  selectedDays: [],
                  allDays: false,
                  member: "",
                  accommodation: "",
                  consent: false,
                  contactConsent: false,
                });
                setStep(1);
                setSubmitted(false);
                setSubmitError(null);
              }}
            />
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

                <div className="mt-6 flex items-center justify-start gap-3">
                  <Button type="button" className="h-12 rounded-full bg-[#1b2545] text-white hover:bg-sky-100 hover:text-black px-8 text-sm font-medium tracking-normal" disabled={!canProceed} onClick={() => setStep(2)}>NEXT</Button>
                </div>
              </div>

              <div className={`flex-1 flex flex-col gap-4 transition-all duration-300 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute pointer-events-none'}`}>
                <div>
                  <Label className="text-xs font-semibold">Which days will you be attending?</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {eventDayOptions.map((option) => (
                      <label key={option.key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={form.selectedDays.includes(option.key)}
                          onCheckedChange={() => toggleDay(option.key)}
                        />
                        {option.label}
                      </label>
                    ))}
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={form.allDays} onCheckedChange={() => toggleDay('all')} />
                      All Days
                    </label>
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

                {submitError && (
                  <PublicInlineAlert
                    type="error"
                    message={submitError}
                    onDismiss={() => setSubmitError(null)}
                    className="mt-4"
                  />
                )}

                <div className="flex items-center justify-start gap-3 mt-4">
                  <Button
                    type="button"
                    className="h-12 rounded-full bg-[#d6d9e4] text-black hover:bg-sky-100 hover:text-black px-8 text-sm font-medium tracking-normal"
                    disabled={submitting}
                    onClick={() => setStep(1)}
                  >
                    PREVIOUS
                  </Button>
                  <Button
                    className="bg-[#1b2545] text-white hover:bg-sky-100 hover:text-black h-12 px-8 text-sm font-medium tracking-normal rounded-full disabled:opacity-50"
                    disabled={!canSubmit || submitting}
                    onClick={async () => {
                      if (submitting) return;
                      const resolvedEventId = eventDetails?.id;
                      if (!resolvedEventId) return;
                      setSubmitting(true);
                      setSubmitError(null);
                      try {
                        await registerEventParticipant(resolvedEventId, form);
                        persistLocalRegistration();
                        setSubmitted(true);
                      } catch (err: any) {
                        setSubmitError(describePublicError(err, 'Failed to submit event registration. Please try again.'));
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        REGISTERING...
                      </>
                    ) : (
                      'REGISTER'
                    )}
                  </Button>
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
