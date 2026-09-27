import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import { getEventById, postForm } from "@/lib/api";
import { getEventById, registerEventParticipant } from "@/lib/api";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import eventImg from "@/assets/event_form.jpg";
import { isValidEmail, sanitizePhoneInput } from "@/lib/formValidation";

const LOCAL_EVENT_REGISTRATIONS_KEY = 'wgc_event_registrations';

const EventRegistration = () => {
  const navigate = useNavigate();
  const { eventId: eventIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const eventId = eventIdParam || searchParams.get('eventId') || '';

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

  const update = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));
  const canProceed = form.fullName.trim() && form.phone.trim() && isValidEmail(form.email);
  const canSubmit = form.contactConsent;

  const persistLocalRegistration = () => {
    try {
      const existingRaw = localStorage.getItem(LOCAL_EVENT_REGISTRATIONS_KEY);
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
          eventId,
          eventTitle: eventDetails?.title,
          eventType: eventDetails?.type,
          eventLocation: eventDetails?.location,
          eventStartDate: eventDetails?.startDate,
          eventEndDate: eventDetails?.endDate,
        },
      };
      localStorage.setItem(LOCAL_EVENT_REGISTRATIONS_KEY, JSON.stringify([record, ...list].slice(0, 500)));
    } catch (error) {
      console.warn('Failed to persist local event registration:', error);
    }
  };

  useEffect(() => {
    const queryFallback = {
      id: eventId || 'custom',
      title: searchParams.get('title') || 'Event Registration',
      type: searchParams.get('type') || undefined,
      location: searchParams.get('location') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    if (!eventId) {
      if (queryFallback.title !== 'Event Registration') {
        setEventDetails(queryFallback);
      }
      return;
    }

    const loadEvent = async () => {
      try {
        setEventLoading(true);
        const event = await getEventById(eventId);
        if (event) {
          setEventDetails({
            id: event.id,
            title: event.title || queryFallback.title,
            type: event.type || queryFallback.type,
            location: event.location || queryFallback.location,
            startDate: event.startDate || queryFallback.startDate,
            endDate: event.endDate || queryFallback.endDate,
          });
          return;
        }
      } catch (error) {
        console.warn('Failed to load event for registration:', error);
      } finally {
        setEventLoading(false);
      }

      setEventDetails(queryFallback.title !== 'Event Registration' ? queryFallback : null);
    };

    loadEvent();
  }, [eventId, searchParams]);

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
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="relative w-full max-w-4xl bg-background rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-[1.15fr_1fr] min-h-[640px]">
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

        <div className="p-6 md:p-8 flex flex-col">
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

                <div className="mt-6">
                  <Button className="bg-foreground text-background px-6 py-3 rounded-full" disabled={!canProceed} onClick={() => setStep(2)}>NEXT</Button>
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

                <div className="flex items-center gap-3 mt-4">
                  <Button variant="outline" className="h-11 text-xs font-semibold tracking-wider rounded-sm" onClick={() => setStep(1)}>PREVIOUS</Button>
                  <Button
                    className="bg-foreground text-background h-12 px-10 text-sm font-semibold tracking-[0.08em] rounded-full hover:bg-foreground/90"
                    disabled={!canSubmit || submitting}
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        await registerEventParticipant(eventId, 
                          form
                          // eventTitle: eventDetails?.title,
                          // eventType: eventDetails?.type,
                          // eventLocation: eventDetails?.location,
                          // eventStartDate: eventDetails?.startDate,
                          // eventEndDate: eventDetails?.endDate,
                        );
                        persistLocalRegistration();
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
