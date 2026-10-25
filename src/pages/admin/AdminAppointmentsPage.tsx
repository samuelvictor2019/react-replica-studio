import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { adminRequest, describeApiError } from '@/lib/adminApi';
import { toast } from '@/components/ui/sonner';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarClock, Plus, Trash2, RefreshCw, Loader2 } from 'lucide-react';

type AppointmentType = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  location?: string;
  color?: string;
  isActive: boolean;
  minNoticeHours: number;
  maxDaysInAdvance: number;
};

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type Blackout = {
  id: string;
  startAt: string;
  endAt: string;
  reason?: string;
};

type Appointment = {
  id: string;
  typeId?: string | null;
  type?: { id: string; name?: string | null; slug?: string | null } | null;
  title?: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  startAt: string;
  endAt: string;
  timezone?: string;
  status: string;
  source?: string;
  notes?: string | null;
  internalNotes?: string | null;
};

type OverviewResponse = {
  stats: { total: number; upcoming: number; completed: number; cancelled: number; noShow: number };
  upcoming: Appointment[];
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const fromDateTimeLocal = (value: string) => (value ? new Date(value).toISOString() : '');

const AdminAppointmentsPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  const [typeForm, setTypeForm] = useState({
    name: '',
    durationMinutes: '30',
    minNoticeHours: '2',
    maxDaysInAdvance: '60',
    location: 'In-person',
    color: '#0f1b37',
    description: '',
    isActive: true,
  });

  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: '1',
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
  });

  const [blackoutForm, setBlackoutForm] = useState({
    startAt: '',
    endAt: '',
    reason: '',
  });

  const [bookingForm, setBookingForm] = useState({
    typeId: '',
    title: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    startAt: '',
    endAt: '',
    timezone: 'Africa/Lagos',
    notes: '',
    internalNotes: '',
  });

  const [creatingBooking, setCreatingBooking] = useState(false);
  const [creatingType, setCreatingType] = useState(false);
  const [creatingAvailability, setCreatingAvailability] = useState(false);
  const [creatingBlackout, setCreatingBlackout] = useState(false);

  const loadAll = async () => {
    if (!can('appointments.read')) return;
    setLoading(true);
    setError('');
    try {
      const [overviewRes, typesRes, availabilityRes, blackoutsRes, bookingsRes] = await Promise.all([
        adminRequest<OverviewResponse>('/appointments/overview'),
        adminRequest<AppointmentType[]>('/appointments/types'),
        adminRequest<Availability[]>('/appointments/availability'),
        adminRequest<Blackout[]>('/appointments/blackouts'),
        adminRequest<{ items: Appointment[] }>('/appointments?page=1&pageSize=200'),
      ]);
      setOverview(overviewRes);
      setTypes(typesRes);
      setAvailability(availabilityRes);
      setBlackouts(blackoutsRes);
      setAppointments(bookingsRes.items || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load appointments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredBookings = useMemo(() => {
    return appointments.filter((item) => {
      const statusOk = bookingStatusFilter === 'all' ? true : item.status === bookingStatusFilter;
      const term = bookingSearch.trim().toLowerCase();
      const searchOk = !term
        ? true
        : [item.guestName, item.guestEmail, item.title || '', item.type?.name || '']
            .join(' ')
            .toLowerCase()
            .includes(term);
      return statusOk && searchOk;
    });
  }, [appointments, bookingStatusFilter, bookingSearch]);

  const createType = async () => {
    if (!can('appointments.create') || creatingType) return;
    setCreatingType(true);
    try {
      await adminRequest('/appointments/types', {
        method: 'POST',
        body: JSON.stringify({
          name: typeForm.name,
          durationMinutes: Number(typeForm.durationMinutes),
          minNoticeHours: Number(typeForm.minNoticeHours),
          maxDaysInAdvance: Number(typeForm.maxDaysInAdvance),
          location: typeForm.location,
          color: typeForm.color,
          description: typeForm.description,
          isActive: typeForm.isActive,
        }),
      });
      setTypeForm({
        name: '',
        durationMinutes: '30',
        minNoticeHours: '2',
        maxDaysInAdvance: '60',
        location: 'In-person',
        color: '#0f1b37',
        description: '',
        isActive: true,
      });
      await loadAll();
      toast.success('Appointment type created successfully.');
    } catch (e: any) {
      toast.error(describeApiError(e, 'Failed to create appointment type'));
    } finally {
      setCreatingType(false);
    }
  };

  const toggleTypeActive = async (type: AppointmentType) => {
    if (!can('appointments.update')) return;
    try {
      await adminRequest(`/appointments/types/${type.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !type.isActive }),
      });
      await loadAll();
      toast.success(`Appointment type "${type.name}" is now ${!type.isActive ? 'active' : 'inactive'}.`);
    } catch (e: any) {
      toast.error(describeApiError(e, 'Failed to update appointment type'));
    }
  };

  const promptDeleteType = (type: AppointmentType) => {
    if (!can('appointments.delete')) return;
    setConfirmAction({
      title: `Delete "${type.name}"?`,
      description: 'Are you sure you want to delete this appointment type? This action cannot be undone.',
      action: async () => {
        try {
          await adminRequest(`/appointments/types/${type.id}`, { method: 'DELETE' });
          toast.success(`Appointment type "${type.name}" deleted.`);
          await loadAll();
        } catch (e: any) {
          toast.error(describeApiError(e, 'Failed to delete appointment type'));
        }
      },
    });
  };

  const createAvailability = async () => {
    if (!can('appointments.create') || creatingAvailability) return;
    setCreatingAvailability(true);
    try {
      await adminRequest('/appointments/availability', {
        method: 'POST',
        body: JSON.stringify({
          dayOfWeek: Number(availabilityForm.dayOfWeek),
          startTime: availabilityForm.startTime,
          endTime: availabilityForm.endTime,
          isActive: availabilityForm.isActive,
        }),
      });
      await loadAll();
      toast.success('Availability window added.');
    } catch (e: any) {
      toast.error(describeApiError(e, 'Failed to add availability window'));
    } finally {
      setCreatingAvailability(false);
    }
  };

  const promptDeleteAvailability = (id: string) => {
    if (!can('appointments.delete')) return;
    setConfirmAction({
      title: 'Delete Availability Window?',
      description: 'Are you sure you want to remove this availability window?',
      action: async () => {
        try {
          await adminRequest(`/appointments/availability/${id}`, { method: 'DELETE' });
          toast.success('Availability window removed.');
          await loadAll();
        } catch (e: any) {
          toast.error(describeApiError(e, 'Failed to delete availability window'));
        }
      },
    });
  };

  const createBlackout = async () => {
    if (!can('appointments.create') || creatingBlackout) return;
    setCreatingBlackout(true);
    try {
      await adminRequest('/appointments/blackouts', {
        method: 'POST',
        body: JSON.stringify({
          startAt: fromDateTimeLocal(blackoutForm.startAt),
          endAt: fromDateTimeLocal(blackoutForm.endAt),
          reason: blackoutForm.reason,
        }),
      });
      setBlackoutForm({ startAt: '', endAt: '', reason: '' });
      await loadAll();
      toast.success('Blackout window created.');
    } catch (e: any) {
      toast.error(describeApiError(e, 'Failed to create blackout window'));
    } finally {
      setCreatingBlackout(false);
    }
  };

  const promptDeleteBlackout = (id: string) => {
    if (!can('appointments.delete')) return;
    setConfirmAction({
      title: 'Delete Blackout Window?',
      description: 'Are you sure you want to remove this blackout window?',
      action: async () => {
        try {
          await adminRequest(`/appointments/blackouts/${id}`, { method: 'DELETE' });
          toast.success('Blackout window removed.');
          await loadAll();
        } catch (e: any) {
          toast.error(describeApiError(e, 'Failed to delete blackout window'));
        }
      },
    });
  };

  const createBooking = async () => {
    if (!can('appointments.create') || creatingBooking) return;
    setCreatingBooking(true);
    try {
      await adminRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          typeId: bookingForm.typeId || null,
          title: bookingForm.title,
          guestName: bookingForm.guestName,
          guestEmail: bookingForm.guestEmail,
          guestPhone: bookingForm.guestPhone,
          startAt: fromDateTimeLocal(bookingForm.startAt),
          endAt: fromDateTimeLocal(bookingForm.endAt),
          timezone: bookingForm.timezone,
          notes: bookingForm.notes,
          internalNotes: bookingForm.internalNotes,
          source: 'admin',
        }),
      });
      setBookingForm({
        typeId: '',
        title: '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        startAt: '',
        endAt: '',
        timezone: 'Africa/Lagos',
        notes: '',
        internalNotes: '',
      });
      await loadAll();
      toast.success(`Booking created for "${bookingForm.guestName}".`);
    } catch (e: any) {
      toast.error(describeApiError(e, 'Failed to create booking'));
    } finally {
      setCreatingBooking(false);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    if (!can('appointments.update')) return;
    try {
      await adminRequest(`/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadAll();
      toast.success(`Booking status updated to "${status}".`);
    } catch (e: any) {
      toast.error(describeApiError(e, 'Failed to update booking status'));
    }
  };

  const promptDeleteBooking = (booking: Appointment) => {
    if (!can('appointments.delete')) return;
    setConfirmAction({
      title: 'Delete Booking?',
      description: `Are you sure you want to delete the booking for "${booking.guestName}"?`,
      action: async () => {
        try {
          await adminRequest(`/appointments/${booking.id}`, { method: 'DELETE' });
          toast.success(`Booking for "${booking.guestName}" deleted.`);
          await loadAll();
        } catch (e: any) {
          toast.error(describeApiError(e, 'Failed to delete booking'));
        }
      },
    });
  };

  if (!can('appointments.read')) {
    return <div className="text-sm text-muted-foreground">You do not have permission to view appointments.</div>;
  }

  if (loading) {
    return <AdminPageSkeleton label="appointments" variant="cards" count={4} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-black">Appointments</h1>
          <p className="text-sm text-muted-foreground">Admin-only booking and schedule management for the Serving Overseer.</p>
        </div>
        <Button onClick={loadAll} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{overview?.stats.total ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Upcoming</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{overview?.stats.upcoming ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Completed</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{overview?.stats.completed ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Cancelled</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{overview?.stats.cancelled ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">No Show</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{overview?.stats.noShow ?? 0}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="types">Appointment Types</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="blackouts">Blackouts</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create Booking</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Appointment Type</Label>
                <Select value={bookingForm.typeId} onValueChange={(v) => setBookingForm((s) => ({ ...s, typeId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {types.filter((t) => t.isActive).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Title (Optional)</Label>
                <Input value={bookingForm.title} onChange={(e) => setBookingForm((s) => ({ ...s, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Guest Name</Label>
                <Input value={bookingForm.guestName} onChange={(e) => setBookingForm((s) => ({ ...s, guestName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Guest Email</Label>
                <Input type="email" value={bookingForm.guestEmail} onChange={(e) => setBookingForm((s) => ({ ...s, guestEmail: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Guest Phone</Label>
                <Input value={bookingForm.guestPhone} onChange={(e) => setBookingForm((s) => ({ ...s, guestPhone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Input value={bookingForm.timezone} onChange={(e) => setBookingForm((s) => ({ ...s, timezone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Start</Label>
                <Input type="datetime-local" value={bookingForm.startAt} onChange={(e) => setBookingForm((s) => ({ ...s, startAt: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>End</Label>
                <Input type="datetime-local" value={bookingForm.endAt} onChange={(e) => setBookingForm((s) => ({ ...s, endAt: e.target.value }))} />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Guest Notes</Label>
                <Textarea value={bookingForm.notes} onChange={(e) => setBookingForm((s) => ({ ...s, notes: e.target.value }))} />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Internal Notes</Label>
                <Textarea value={bookingForm.internalNotes} onChange={(e) => setBookingForm((s) => ({ ...s, internalNotes: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Button onClick={createBooking} disabled={!bookingForm.guestName || !bookingForm.guestEmail || !bookingForm.startAt || !bookingForm.endAt || creatingBooking} className="gap-2">
                  {creatingBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {creatingBooking ? 'Creating Booking...' : 'Create Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <CardTitle className="text-base">Manage Bookings</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Search by name, email, title..." value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} />
                <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.guestName}</div>
                        <div className="text-xs text-muted-foreground">{item.guestEmail}</div>
                      </TableCell>
                      <TableCell>{item.type?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(item.startAt).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">to {new Date(item.endAt).toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select value={item.status} onValueChange={(v) => updateBookingStatus(item.id, v)}>
                            <SelectTrigger className="w-[130px] h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="no_show">No Show</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="icon" onClick={() => promptDeleteBooking(item)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Create Appointment Type</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label>Name</Label><Input value={typeForm.name} onChange={(e) => setTypeForm((s) => ({ ...s, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Duration (min)</Label><Input type="number" value={typeForm.durationMinutes} onChange={(e) => setTypeForm((s) => ({ ...s, durationMinutes: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Location</Label><Input value={typeForm.location} onChange={(e) => setTypeForm((s) => ({ ...s, location: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Min Notice (hours)</Label><Input type="number" value={typeForm.minNoticeHours} onChange={(e) => setTypeForm((s) => ({ ...s, minNoticeHours: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Max Days in Advance</Label><Input type="number" value={typeForm.maxDaysInAdvance} onChange={(e) => setTypeForm((s) => ({ ...s, maxDaysInAdvance: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Color</Label><Input type="color" value={typeForm.color} onChange={(e) => setTypeForm((s) => ({ ...s, color: e.target.value }))} /></div>
              <div className="md:col-span-3 space-y-1.5"><Label>Description</Label><Textarea value={typeForm.description} onChange={(e) => setTypeForm((s) => ({ ...s, description: e.target.value }))} /></div>
              <div className="md:col-span-3 flex items-center gap-2">
                <Checkbox checked={typeForm.isActive} onCheckedChange={(v) => setTypeForm((s) => ({ ...s, isActive: !!v }))} />
                <Label>Active</Label>
              </div>
              <div className="md:col-span-3">
                <Button onClick={createType} disabled={!typeForm.name || creatingType} className="gap-2">
                  {creatingType ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {creatingType ? 'Creating Type...' : 'Create Type'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Appointment Types</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.location || '-'}</div>
                      </TableCell>
                      <TableCell>{t.durationMinutes} min</TableCell>
                      <TableCell>{t.minNoticeHours}h notice · {t.maxDaysInAdvance} days</TableCell>
                      <TableCell><Badge variant={t.isActive ? 'default' : 'secondary'}>{t.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => toggleTypeActive(t)}>{t.isActive ? 'Disable' : 'Enable'}</Button>
                          <Button variant="outline" size="icon" onClick={() => promptDeleteType(t)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Add Weekly Availability</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <Label>Day</Label>
                <Select value={availabilityForm.dayOfWeek} onValueChange={(v) => setAvailabilityForm((s) => ({ ...s, dayOfWeek: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dayNames.map((d, idx) => <SelectItem key={d} value={String(idx)}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Start</Label><Input type="time" value={availabilityForm.startTime} onChange={(e) => setAvailabilityForm((s) => ({ ...s, startTime: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>End</Label><Input type="time" value={availabilityForm.endTime} onChange={(e) => setAvailabilityForm((s) => ({ ...s, endTime: e.target.value }))} /></div>
              <div className="flex items-center gap-2 pt-7">
                <Checkbox checked={availabilityForm.isActive} onCheckedChange={(v) => setAvailabilityForm((s) => ({ ...s, isActive: !!v }))} />
                <Label>Active</Label>
              </div>
              <div className="pt-6">
                <Button onClick={createAvailability} disabled={creatingAvailability}>
                  {creatingAvailability ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                  {creatingAvailability ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Current Weekly Availability</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Day</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {availability.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{dayNames[a.dayOfWeek] || a.dayOfWeek}</TableCell>
                      <TableCell>{a.startTime}</TableCell>
                      <TableCell>{a.endTime}</TableCell>
                      <TableCell><Badge variant={a.isActive ? 'default' : 'secondary'}>{a.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell><Button variant="outline" size="icon" onClick={() => promptDeleteAvailability(a.id)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blackouts" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Add Blackout Window</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label>Start</Label><Input type="datetime-local" value={blackoutForm.startAt} onChange={(e) => setBlackoutForm((s) => ({ ...s, startAt: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>End</Label><Input type="datetime-local" value={blackoutForm.endAt} onChange={(e) => setBlackoutForm((s) => ({ ...s, endAt: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Reason</Label><Input value={blackoutForm.reason} onChange={(e) => setBlackoutForm((s) => ({ ...s, reason: e.target.value }))} /></div>
              <div className="md:col-span-3">
                <Button onClick={createBlackout} disabled={!blackoutForm.startAt || !blackoutForm.endAt || creatingBlackout}>
                  {creatingBlackout ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                  {creatingBlackout ? 'Adding Blackout...' : 'Add Blackout'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Blackout Windows</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Reason</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {blackouts.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{new Date(b.startAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(b.endAt).toLocaleString()}</TableCell>
                      <TableCell>{b.reason || '-'}</TableCell>
                      <TableCell><Button variant="outline" size="icon" onClick={() => promptDeleteBlackout(b.id)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <CalendarClock className="w-4 h-4 animate-pulse" /> Loading appointments data...
        </div>
      )}

      <AdminConfirmDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => !open && !actionLoading && setConfirmAction(null)}
        title={confirmAction?.title || 'Confirm Action'}
        description={confirmAction?.description || 'Are you sure you want to proceed?'}
        confirmLabel={actionLoading ? 'Deleting...' : 'Delete'}
        loading={actionLoading}
        onConfirm={async () => {
          if (!confirmAction) return;
          setActionLoading(true);
          try {
            await confirmAction.action();
            setConfirmAction(null);
          } finally {
            setActionLoading(false);
          }
        }}
      />
    </div>
  );
};

export default AdminAppointmentsPage;
