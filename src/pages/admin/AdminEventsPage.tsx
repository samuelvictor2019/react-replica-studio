import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { adminRequest } from '@/lib/adminApi';
import type { AdminOutletContext } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Eye, Download, Search, Link as LinkIcon, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { buildEventRegistrationUrl } from '@/lib/api';
import QRCode from 'qrcode';

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  dailySchedule?: Array<{
    day: string;
    session: string;
    time: string;
  }>;
  location: string;
  bannerImageUrl?: string;
  price: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  type: string;
  createdAt: string;
  updatedAt: string;
};

type EventRegistrant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  address?: string;
  placeOfWorship?: string;
  hasAttended?: boolean;
  createdAt: string;
  updatedAt?: string;
};

const STORAGE_KEY = 'wgc_admin_events';
const LOCAL_EVENT_REGISTRATIONS_KEY = 'wgc_event_registrations';
const FORMS_ACCESS_BLOCKED_KEY = 'wgc_forms_access_blocked';

const AdminEventsPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRegistrantsDialogOpen, setIsRegistrantsDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [qrEvent, setQrEvent] = useState<Event | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [registrants, setRegistrants] = useState<EventRegistrant[]>([]);
  const [registrantsLoading, setRegistrantsLoading] = useState(false);
  const [formsAccessBlocked, setFormsAccessBlocked] = useState(() => {
    return localStorage.getItem(FORMS_ACCESS_BLOCKED_KEY) === 'true';
  });
  const [registrantsSearch, setRegistrantsSearch] = useState('');
  const [accommodationFilter, setAccommodationFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    dailySchedule: [] as Array<{ day: string; session: string; time: string }>,
    location: '',
    bannerImageUrl: '',
    price: 0,
    status: 'published' as 'draft' | 'published' | 'cancelled' | 'completed',
    type: 'ETHANIM' as string
  });

  const loadEvents = async () => {
    setLoading(true);

    try {
      const res = await adminRequest<{ data: Event[]; meta: { totalItems: number; page: number; limit: number } }>('/events?page=1&limit=100');
      setEvents(res.data);
      // Save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
      setError(''); // Clear any previous errors
    } catch (e: any) {
      let errorMessage = 'Failed to load events from API';

      if (e.message?.includes('CORS_ERROR')) {
        errorMessage = 'CORS Error: Backend server does not allow requests from this origin.';
      } else if (e.message?.includes('BACKEND_ERROR')) {
        errorMessage = 'Backend Error: Server is currently unavailable (502 Bad Gateway).';
      } else if (e.message?.includes('NETWORK_ERROR')) {
        errorMessage = 'Network Error: Unable to connect to backend server.';
      } else if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication Error: Invalid or expired token.';
      } else if (e.message?.includes('403') || e.message?.includes('Forbidden')) {
        errorMessage = 'Permission Error: You do not have permission to access this resource.';
      }

      setError(errorMessage);
      setEvents([]); // Clear events on error for live testing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      dailySchedule: [],
      location: '',
      bannerImageUrl: '',
      price: 0,
      status: 'published',
      type: 'ETHANIM'
    });
    setEditingEvent(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    // Convert ISO datetime strings to local datetime format for datetime-local inputs
    const formatForDateTimeLocal = (isoString: string) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      // Convert to local time and format as yyyy-MM-ddThh:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setFormData({
      title: event.title,
      description: event.description,
      startDate: formatForDateTimeLocal(event.startDate),
      endDate: formatForDateTimeLocal(event.endDate),
      dailySchedule: event.dailySchedule || [],
      location: event.location,
      bannerImageUrl: event.bannerImageUrl || '',
      price: event.price,
      status: event.status,
      type: event.type
    });
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert datetime-local values back to ISO format for API
    const convertToISOString = (dateTimeLocal: string) => {
      if (!dateTimeLocal) return '';
      // datetime-local format is yyyy-MM-ddThh:mm, convert to ISO string
      return new Date(dateTimeLocal).toISOString();
    };

    const apiData = {
      ...formData,
      startDate: convertToISOString(formData.startDate),
      endDate: convertToISOString(formData.endDate)
    };

    try {
      if (editingEvent) {
        await adminRequest(`/events/${editingEvent.id}`, {
          method: 'PATCH',
          body: JSON.stringify(apiData)
        });
      } else {
        await adminRequest('/events', {
          method: 'POST',
          body: JSON.stringify(apiData)
        });
      }
      setIsDialogOpen(false);
      resetForm();
      loadEvents();
    } catch (e: any) {
      let errorMessage = e.message || 'Failed to save event';

      if (e.message?.includes('CORS_ERROR')) {
        errorMessage = 'CORS Error: Backend server does not allow requests from this origin.';
      } else if (e.message?.includes('BACKEND_ERROR')) {
        errorMessage = 'Backend Error: Server is currently unavailable (502 Bad Gateway).';
      } else if (e.message?.includes('NETWORK_ERROR')) {
        errorMessage = 'Network Error: Unable to connect to backend server.';
      } else if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication Error: Invalid or expired token.';
      } else if (e.message?.includes('403') || e.message?.includes('Forbidden')) {
        errorMessage = 'Permission Error: You do not have permission to perform this action.';
      }

      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await adminRequest(`/events/${id}`, { method: 'DELETE' });
      loadEvents();
      setError(''); // Clear error on success
    } catch (e: any) {
      let errorMessage = e.message || 'Failed to delete event';

      if (e.message?.includes('CORS_ERROR')) {
        errorMessage = 'CORS Error: Backend server does not allow requests from this origin.';
      } else if (e.message?.includes('BACKEND_ERROR')) {
        errorMessage = 'Backend Error: Server is currently unavailable (502 Bad Gateway).';
      } else if (e.message?.includes('NETWORK_ERROR')) {
        errorMessage = 'Network Error: Unable to connect to backend server.';
      } else if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication Error: Invalid or expired token.';
      } else if (e.message?.includes('403') || e.message?.includes('Forbidden')) {
        errorMessage = 'Permission Error: You do not have permission to perform this action.';
      }

      setError(errorMessage);
    }
  };

  const parseAccommodation = (registrant: EventRegistrant) => {
    const text = `${registrant.address || ''}`.toLowerCase();
    if (text.includes('accommodation: yes')) return 'yes';
    if (text.includes('accommodation: no')) return 'no';
    return 'no';
  };

  const loadRegistrants = async (event: Event) => {
    setSelectedEvent(event);
    setIsRegistrantsDialogOpen(true);
    setRegistrantsLoading(true);

    try {
      const isAuthOrPermissionError = (message: string) => {
        const msg = (message || '').toLowerCase();
        return msg.includes('401') || msg.includes('unauthorized') || msg.includes('authentication expired') || msg.includes('403') || msg.includes('forbidden');
      };

      const extractItems = (payload: any) => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.items)) return payload.items;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.data?.items)) return payload.data.items;
        return [];
      };

      let participantItems: EventRegistrant[] = [];
      let blockedByAuth = false;
      try {
        const participantsRes = await adminRequest<any>(`/events/${event.id}/participants?page=1&limit=100`);
        participantItems = extractItems(participantsRes);
      } catch (participantsError: any) {
        const participantsMessage = participantsError?.message || '';
        console.warn('Participants endpoint unavailable:', participantsMessage || participantsError);

        if (isAuthOrPermissionError(participantsMessage)) {
          blockedByAuth = true;
          setRegistrants([]);
          if (participantsMessage.toLowerCase().includes('403') || participantsMessage.toLowerCase().includes('forbidden')) {
            setError('Permission denied: your account cannot view event registrants. Please sign in with an admin account.');
          } else {
            setError('Authentication expired. Please log in again to view event registrants.');
          }
        }
      }

      let formMappedItems: EventRegistrant[] = [];
      const canReadForms = can('forms.read');
      if (!blockedByAuth && canReadForms && !formsAccessBlocked) {
        try {
          const formsRes = await adminRequest<any>(`/forms?page=1&limit=100`);
          const formItems = extractItems(formsRes);
          if (formsAccessBlocked) {
            setFormsAccessBlocked(false);
            localStorage.removeItem(FORMS_ACCESS_BLOCKED_KEY);
          }

          formMappedItems = formItems
            .filter((item: any) => {
              const rawData = item?.data;
              const data = typeof rawData === 'string'
                ? (() => {
                    try {
                      return JSON.parse(rawData);
                    } catch {
                      return {};
                    }
                  })()
                : rawData || {};

              const eventIdMatches = String(data.eventId || '').trim() === String(event.id).trim();
              const eventTitleMatches = String(data.eventTitle || '').trim().toLowerCase() === String(event.title || '').trim().toLowerCase();
              const looksLikeEventRegistration = Boolean(data.eventId || data.eventTitle || data.selectedDays || data.accommodation);
              return looksLikeEventRegistration && (eventIdMatches || eventTitleMatches);
            })
            .map((item: any) => {
              const rawData = item?.data;
              const data = typeof rawData === 'string'
                ? (() => {
                    try {
                      return JSON.parse(rawData);
                    } catch {
                      return {};
                    }
                  })()
                : rawData || {};

              const fullName = String(item.fullName || data.fullName || '').trim();
              const nameParts = fullName.split(/\s+/).filter(Boolean);

              return {
                id: `form-${item.id}`,
                firstName: nameParts[0] || 'Guest',
                lastName: nameParts.slice(1).join(' ') || 'Attendee',
                email: item.email || data.email || '',
                phone: item.phone || data.phone || '',
                gender: data.gender || '',
                address: `Accommodation: ${data.accommodation || 'no'}; Days: ${(data.allDays ? 'All Days' : (data.selectedDays || []).join(', ')) || 'N/A'}`,
                placeOfWorship: data.member || '',
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
              } as EventRegistrant;
            });
        } catch (formsError: any) {
          const formsMessage = formsError?.message || '';
          console.warn('Failed to load form-based registrations:', formsMessage || formsError);
          if (isAuthOrPermissionError(formsMessage)) {
            setFormsAccessBlocked(true);
            localStorage.setItem(FORMS_ACCESS_BLOCKED_KEY, 'true');
          }
          if (isAuthOrPermissionError(formsMessage) && participantItems.length === 0) {
            if (formsMessage.toLowerCase().includes('403') || formsMessage.toLowerCase().includes('forbidden')) {
              setError('Permission denied: your account cannot view registration forms for this event.');
            } else {
              setError('Authentication expired. Please log in again to view event registrants.');
            }
          }
        }
      }

      let localMappedItems: EventRegistrant[] = [];
      try {
        const localRaw = localStorage.getItem(LOCAL_EVENT_REGISTRATIONS_KEY);
        const localItems = localRaw ? JSON.parse(localRaw) : [];
        const list = Array.isArray(localItems) ? localItems : [];

        localMappedItems = list
          .filter((item: any) => {
            const data = item?.data || {};
            const eventIdMatches = String(data.eventId || '').trim() === String(event.id).trim();
            const eventTitleMatches = String(data.eventTitle || '').trim().toLowerCase() === String(event.title || '').trim().toLowerCase();
            return eventIdMatches || eventTitleMatches;
          })
          .map((item: any) => {
            const data = item?.data || {};
            const fullName = String(item.fullName || data.fullName || '').trim();
            const nameParts = fullName.split(/\s+/).filter(Boolean);

            return {
              id: `local-${item.id || item.createdAt || Math.random().toString(36).slice(2, 10)}`,
              firstName: nameParts[0] || 'Guest',
              lastName: nameParts.slice(1).join(' ') || 'Attendee',
              email: item.email || data.email || '',
              phone: item.phone || data.phone || '',
              gender: data.gender || '',
              address: `Accommodation: ${data.accommodation || 'no'}; Days: ${(data.allDays ? 'All Days' : (data.selectedDays || []).join(', ')) || 'N/A'}`,
              placeOfWorship: data.member || '',
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt,
            } as EventRegistrant;
          });
      } catch (localError) {
        console.warn('Failed to load local registration fallback:', localError);
      }

      const merged = [...participantItems, ...formMappedItems, ...localMappedItems];
      const unique = Array.from(new Map(merged.map((item) => [item.id, item])).values());

      setRegistrants(unique);
      if (!blockedByAuth) {
        setError('');
      }
      if (!blockedByAuth && unique.length === 0 && participantItems.length === 0 && formMappedItems.length === 0) {
        setError('No registrations found for this event yet.');
      }
    } catch (e: any) {
      console.warn('Failed to load registrants:', e?.message || e);
      setRegistrants([]);
      setError(e?.message || 'Failed to load registrants');
    } finally {
      setRegistrantsLoading(false);
    }
  };

  const filteredRegistrants = (registrants || []).filter((registrant) => {
    const query = registrantsSearch.trim().toLowerCase();
    const matchesQuery =
      !query ||
      `${registrant.firstName || ''} ${registrant.lastName || ''}`.toLowerCase().includes(query) ||
      String(registrant.email || '').toLowerCase().includes(query) ||
      String(registrant.phone || '').toLowerCase().includes(query);

    const needsAccommodation = parseAccommodation(registrant);
    const matchesAccommodation = accommodationFilter === 'all' || needsAccommodation === accommodationFilter;

    return matchesQuery && matchesAccommodation;
  });

  const exportRegistrantsToExcel = () => {
    if (!selectedEvent) return;

    const rows = filteredRegistrants.map((r, index) => ({
      SNo: index + 1,
      Name: `${r.firstName || ''} ${r.lastName || ''}`.trim(),
      Email: r.email || '',
      Phone: r.phone || '',
      Gender: r.gender || '',
      Accommodation: parseAccommodation(r) === 'yes' ? 'Yes' : 'No',
      Membership: r.placeOfWorship || '',
      RegisteredAt: r.createdAt ? format(new Date(r.createdAt), 'MMM dd, yyyy HH:mm') : '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrants');
    XLSX.writeFile(wb, `${selectedEvent.title.replace(/[^a-z0-9]/gi, '_')}_registrants.xlsx`);
  };

  const exportRegistrantsToPdf = (orientation: 'portrait' | 'landscape') => {
    if (!selectedEvent) return;

    const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text(`${selectedEvent.title} - Registrants`, 40, 40);

    autoTable(doc, {
      startY: 60,
      head: [['S/N', 'Name', 'Email', 'Phone', 'Accommodation', 'Membership', 'Registered At']],
      body: filteredRegistrants.map((r, index) => [
        String(index + 1),
        `${r.firstName || ''} ${r.lastName || ''}`.trim(),
        r.email || '',
        r.phone || '',
        parseAccommodation(r) === 'yes' ? 'Yes' : 'No',
        r.placeOfWorship || '',
        r.createdAt ? format(new Date(r.createdAt), 'MMM dd, yyyy HH:mm') : '',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`${selectedEvent.title.replace(/[^a-z0-9]/gi, '_')}_registrants_${orientation}.pdf`);
  };

  const copyRegistrationLink = async (event: Event) => {
    const link = `${window.location.origin}${buildEventRegistrationUrl({
      id: event.id,
      title: event.title,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
    })}`;

    await navigator.clipboard.writeText(link);
    setError('Registration link copied to clipboard');
    setTimeout(() => setError(''), 2500);
  };

  const openQrDialog = async (event: Event) => {
    const link = `${window.location.origin}${buildEventRegistrationUrl({
      id: event.id,
      title: event.title,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
    })}`;

    try {
      const dataUrl = await QRCode.toDataURL(link, {
        width: 320,
        margin: 1,
        errorCorrectionLevel: 'M',
      });
      setQrEvent(event);
      setQrCodeDataUrl(dataUrl);
      setIsQrDialogOpen(true);
    } catch (e: any) {
      setError(e.message || 'Failed to generate QR code');
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeDataUrl || !qrEvent) return;
    const anchor = document.createElement('a');
    anchor.href = qrCodeDataUrl;
    anchor.download = `${qrEvent.title.replace(/[^a-z0-9]/gi, '_')}_registration_qr.png`;
    anchor.click();
  };

  const upcomingEvents = (events || []).filter(e => e.status === 'published' && new Date(e.startDate) >= new Date());
  const pastEvents = (events || []).filter(e => e.status === 'completed' || (e.status === 'published' && new Date(e.endDate) < new Date()));

  if (!can('content.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-black/40">Events Management</p>
          <h1 className="font-body text-2xl sm:text-3xl text-black mt-1">Church Events</h1>
          <p className="text-sm text-black/70 mt-1">Manage upcoming and past church events</p>
          {error && (
            <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                {error}
              </p>
            </div>
          )}
        </div>
        {can('content.create') && (
          <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Upcoming Events ({upcomingEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-black/60">Loading events...</p>
          ) : upcomingEvents.length === 0 ? (
            <p className="text-black/60">No upcoming events</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 w-fit">
                        {event.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        {format(new Date(event.startDate), 'MMM dd, yyyy')}
                        {event.endDate && event.endDate !== event.startDate && (
                          <> - {format(new Date(event.endDate), 'MMM dd, yyyy')}</>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        {event.location}
                      </div>
                      {event.price > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">${event.price}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button variant="outline" size="sm" onClick={() => loadRegistrants(event)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyRegistrationLink(event)}>
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openQrDialog(event)}>
                      <QrCode className="w-4 h-4" />
                    </Button>
                    {can('content.update') && (
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {can('content.delete') && (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            Past Events ({pastEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastEvents.length === 0 ? (
            <p className="text-black/60">No past events</p>
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 opacity-75">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge variant="outline" className="w-fit">{event.status}</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        {format(new Date(event.startDate), 'MMM dd, yyyy')}
                        {event.endDate && event.endDate !== event.startDate && (
                          <> - {format(new Date(event.endDate), 'MMM dd, yyyy')}</>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        {event.location}
                      </div>
                      {event.price > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">${event.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button variant="outline" size="sm" onClick={() => loadRegistrants(event)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyRegistrationLink(event)}>
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openQrDialog(event)}>
                      <QrCode className="w-4 h-4" />
                    </Button>
                    {can('content.update') && (
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {can('content.delete') && (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRegistrantsDialogOpen} onOpenChange={setIsRegistrantsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? `${selectedEvent.title} Registrations` : 'Event Registrations'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div className="flex items-center gap-2 w-full md:max-w-md">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  value={registrantsSearch}
                  onChange={(e) => setRegistrantsSearch(e.target.value)}
                  placeholder="Search by name, email, or phone"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={accommodationFilter} onValueChange={(value: 'all' | 'yes' | 'no') => setAccommodationFilter(value)}>
                  <SelectTrigger className="w-[190px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Registrants</SelectItem>
                    <SelectItem value="yes">Needs Accommodation</SelectItem>
                    <SelectItem value="no">No Accommodation</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={exportRegistrantsToExcel}>
                  <Download className="w-4 h-4 mr-1" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportRegistrantsToPdf('portrait')}>
                  <Download className="w-4 h-4 mr-1" /> PDF Portrait
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportRegistrantsToPdf('landscape')}>
                  <Download className="w-4 h-4 mr-1" /> PDF Landscape
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-black/60">Total</p>
                  <p className="text-xl font-semibold">{registrants.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-black/60">Needs Accommodation</p>
                  <p className="text-xl font-semibold">{registrants.filter(r => parseAccommodation(r) === 'yes').length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-black/60">No Accommodation</p>
                  <p className="text-xl font-semibold">{registrants.filter(r => parseAccommodation(r) === 'no').length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-black/60">Filtered</p>
                  <p className="text-xl font-semibold">{filteredRegistrants.length}</p>
                </CardContent>
              </Card>
            </div>

            {registrantsLoading ? (
              <p className="text-sm text-black/60">Loading registrants...</p>
            ) : filteredRegistrants.length === 0 ? (
              <p className="text-sm text-black/60">No registrants found for this filter.</p>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Gender</th>
                      <th className="text-left p-2">Accommodation</th>
                      <th className="text-left p-2">Membership</th>
                      <th className="text-left p-2">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrants.map((registrant) => (
                      <tr key={registrant.id} className="border-t">
                        <td className="p-2">{`${registrant.firstName || ''} ${registrant.lastName || ''}`.trim()}</td>
                        <td className="p-2">{registrant.email || '-'}</td>
                        <td className="p-2">{registrant.phone || '-'}</td>
                        <td className="p-2">{registrant.gender || '-'}</td>
                        <td className="p-2">{parseAccommodation(registrant) === 'yes' ? 'Yes' : 'No'}</td>
                        <td className="p-2">{registrant.placeOfWorship || '-'}</td>
                        <td className="p-2">{registrant.createdAt ? format(new Date(registrant.createdAt), 'MMM dd, yyyy HH:mm') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{qrEvent ? `Registration QR - ${qrEvent.title}` : 'Registration QR'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="Event registration QR code" className="w-72 h-72 border rounded-lg" />
              ) : (
                <p className="text-sm text-black/60">Generating QR code...</p>
              )}
            </div>

            {qrEvent && (
              <div className="rounded-md bg-gray-50 p-2 text-[11px] text-black/70 break-all">
                {`${window.location.origin}${buildEventRegistrationUrl({
                  id: qrEvent.id,
                  title: qrEvent.title,
                  type: qrEvent.type,
                  startDate: qrEvent.startDate,
                  endDate: qrEvent.endDate,
                  location: qrEvent.location,
                })}`}
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-end">
              {qrEvent && (
                <Button variant="outline" onClick={() => copyRegistrationLink(qrEvent)}>
                  <LinkIcon className="w-4 h-4 mr-1" /> Copy Link
                </Button>
              )}
              <Button onClick={downloadQrCode} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-1" /> Download PNG
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Event Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEERS AND SCRIBES BOOTCAMP">Seers and Scribes Bootcamp</SelectItem>
                    <SelectItem value="KINGDOM DIPLOMAT GATHERING">Kingdom Diplomat Gathering</SelectItem>
                    <SelectItem value="FEAST OF CHOICE PIECES">Feast of Choice Pieces</SelectItem>
                    <SelectItem value="KINGDOM ADVANCEMENT CITY SUMMIT">Kingdom Advancement City Summit</SelectItem>
                    <SelectItem value="ETHANIM">Ethanım</SelectItem>
                    <SelectItem value="TYRANUS RETREAT">Tyranus Retreat</SelectItem>
                    <SelectItem value="CRYSTAL WATERS">Crystal Waters</SelectItem>
                    <SelectItem value="HUNDREDFOLD SUMMIT">Hundredfold Summit</SelectItem>
                    <SelectItem value="TRANSFORMATION SERVICE">Transformation Service</SelectItem>
                    <SelectItem value="HARP AND BOWL">Harp and Bowl</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'cancelled' | 'completed') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Banner Image URL</label>
              <Input
                value={formData.bannerImageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, bannerImageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEventsPage;