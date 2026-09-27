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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Eye, Download, Search, Link as LinkIcon, QrCode, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { buildEventRegistrationUrl, getEventTypes } from '@/lib/api';
import QRCode from 'qrcode';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  typeId: string;
  eventType?: { id: string; name: string; slug: string; };
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
  const [eventTypes, setEventTypes] = useState<any[]>([]);
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

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ all: 0, published: 0, ongoing: 0, completed: 0, draft: 0 });
  const EVENTS_PER_PAGE = 10;

  const loadCounts = async () => {
    try {
      const [allRes, pubRes, ongRes, compRes, draftRes] = await Promise.all([
        adminRequest<any>('/events?page=1&limit=1'),
        adminRequest<any>('/events?page=1&limit=1&status=published'),
        adminRequest<any>('/events?page=1&limit=1&status=ongoing'),
        adminRequest<any>('/events?page=1&limit=1&status=completed'),
        adminRequest<any>('/events?page=1&limit=1&status=draft')
      ]);

      const getTotal = (res: any) => res?.meta?.totalItems || res?.data?.meta?.totalItems || res?.data?.total || res?.totalItems || 0;

      setStatusCounts({
        all: getTotal(allRes),
        published: getTotal(pubRes),
        ongoing: getTotal(ongRes),
        completed: getTotal(compRes),
        draft: getTotal(draftRes)
      });
    } catch (e) {
      console.error('Failed to load status counts', e);
    }
  };

  const loadEventTypes = async () => {
    try {
      const types = await getEventTypes(true);
      setEventTypes(types);
    } catch (e) {
      console.error('Failed to load event types', e);
    }
  };

  const goToNextPage = () => setCurrentPage(p => Math.min(Math.max(1, Math.ceil(totalItems / EVENTS_PER_PAGE)), p + 1));
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, eventSearchTerm, sortOrder]);

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
    typeId: ''
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: EVENTS_PER_PAGE.toString(),
        order: sortOrder,
      });
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (eventSearchTerm) queryParams.append('search', eventSearchTerm);

      const res = await adminRequest<any>(`/events?${queryParams.toString()}`);

      const extractItems = (payload: any) => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.items)) return payload.items;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.data?.items)) return payload.data.items;
        if (Array.isArray(payload?.data?.data)) return payload.data.data;
        return [];
      };

      setEvents(extractItems(res));
      setTotalItems(res.meta?.totalItems || res.data?.meta?.totalItems || res.data?.total || 0);
      setError('');
    } catch (e: any) {
      let errorMessage = 'Failed to load events from API';
      if (e.message?.includes('CORS_ERROR')) errorMessage = 'CORS Error';
      else if (e.message?.includes('401') || e.message?.includes('Unauthorized')) errorMessage = 'Authentication Error';
      else if (e.message?.includes('403') || e.message?.includes('Forbidden')) errorMessage = 'Permission Error';
      setError(errorMessage);
      setEvents([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadCounts();
    loadEventTypes();
  }, [currentPage, statusFilter, eventSearchTerm, sortOrder]);

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
      typeId: ''
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
      typeId: event.typeId || event.eventType?.id || ''
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
      type: event.eventType?.name || '',
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
      type: event.eventType?.name || '',
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
          <p className="text-sm text-muted-foreground mt-1">Manage upcoming and past church events</p>
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
          <Button onClick={openCreateDialog} className="w-full sm:w-auto shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}


      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 lg:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>
            All ({statusCounts.all})
          </Button>
          <Button variant={statusFilter === 'published' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('published')}>
            Published ({statusCounts.published})
          </Button>
          <Button variant={statusFilter === 'ongoing' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('ongoing')}>
            Ongoing ({statusCounts.ongoing})
          </Button>
          <Button variant={statusFilter === 'completed' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('completed')}>
            Completed ({statusCounts.completed})
          </Button>
          <Button variant={statusFilter === 'draft' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('draft')}>
            Drafts ({statusCounts.draft})
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9"
              value={eventSearchTerm}
              onChange={(e) => setEventSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortOrder} onValueChange={(v: 'ASC' | 'DESC') => setSortOrder(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Newest First</SelectItem>
              <SelectItem value="ASC">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="min-w-[150px]">Dates</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading events...
                    </TableCell>
                  </TableRow>
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No events found.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{event.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{event.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.eventType?.name || event.type || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(event.startDate), 'MMM dd, yyyy')}
                          {event.endDate && event.endDate !== event.startDate && (
                            <><br /><span className="text-muted-foreground">to {format(new Date(event.endDate), 'MMM dd, yyyy')}</span></>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.price > 0 ? `$${event.price}` : 'Free'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1.5 capitalize font-medium px-2 py-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            event.status === 'published' ? 'bg-blue-500' :
                            event.status === 'ongoing' ? 'bg-green-500' :
                            event.status === 'completed' ? 'bg-gray-500' :
                            'bg-yellow-500'
                          }`}></span>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider delayDuration={150}>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => loadRegistrants(event)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Registrants</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => copyRegistrationLink(event)}>
                                  <LinkIcon className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy Link</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => openQrDialog(event)}>
                                  <QrCode className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>QR Code</p>
                              </TooltipContent>
                            </Tooltip>

                            {can('content.update') && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit Event</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            
                            {can('content.delete') && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete Event</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * EVENTS_PER_PAGE + 1, totalItems)} to {Math.min(currentPage * EVENTS_PER_PAGE, totalItems)} of {totalItems} events
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage >= Math.ceil(totalItems / EVENTS_PER_PAGE)}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
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
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold">{registrants.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">Needs Accommodation</p>
                  <p className="text-xl font-semibold">{registrants.filter(r => parseAccommodation(r) === 'yes').length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">No Accommodation</p>
                  <p className="text-xl font-semibold">{registrants.filter(r => parseAccommodation(r) === 'no').length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">Filtered</p>
                  <p className="text-xl font-semibold">{filteredRegistrants.length}</p>
                </CardContent>
              </Card>
            </div>

            {registrantsLoading ? (
              <p className="text-sm text-muted-foreground">Loading registrants...</p>
            ) : filteredRegistrants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No registrants found for this filter.</p>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
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
                <p className="text-sm text-muted-foreground">Generating QR code...</p>
              )}
            </div>

            {qrEvent && (
              <div className="rounded-md bg-muted p-2 text-[11px] text-muted-foreground break-all">
                {`${window.location.origin}${buildEventRegistrationUrl({
                  id: qrEvent.id,
                  title: qrEvent.title,
                  type: qrEvent.eventType?.name || '',
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
              <Button onClick={downloadQrCode} className="bg-white text-black border border-black/20 hover:bg-sky-100 hover:text-black">
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
                <Select value={formData.typeId} onValueChange={(value) => setFormData(prev => ({ ...prev, typeId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
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
              <Button type="submit" className="bg-white text-black border border-black/20 hover:bg-sky-100 hover:text-black w-full sm:w-auto">
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