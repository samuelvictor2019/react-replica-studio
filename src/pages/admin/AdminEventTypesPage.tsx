import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
  Tags,
  CheckCircle2,
  XCircle,
  Wand2,
} from 'lucide-react';
import type { AdminOutletContext } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/sonner';
import {
  describeApiError,
  eventTypesApi,
  type EventType,
  type EventTypePayload,
} from '@/lib/adminApi';
import { slugify } from '@/lib/utils';

type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'name' | 'newest' | 'oldest';
type FormErrors = Partial<Record<keyof EventTypePayload, string>>;

const EMPTY_FORM: EventTypePayload = { name: '', slug: '', description: '', isActive: true };
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : format(date, 'MMM dd, yyyy');
};

const AdminEventTypesPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');

  // Create / edit dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [form, setForm] = useState<EventTypePayload>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  // View dialog
  const [viewing, setViewing] = useState<EventType | null>(null);

  // Delete confirmation
  const [deleting, setDeleting] = useState<EventType | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Rows whose active toggle is in flight
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const loadEventTypes = useCallback(async () => {
    setLoading(true);
    try {
      const items = await eventTypesApi.list();
      setEventTypes(items);
      setLoadError('');
    } catch (e) {
      setLoadError(describeApiError(e, 'Failed to load event types.'));
      setEventTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEventTypes();
  }, [loadEventTypes]);

  const counts = useMemo(() => {
    const active = eventTypes.filter((t) => t.isActive).length;
    return { all: eventTypes.length, active, inactive: eventTypes.length - active };
  }, [eventTypes]);

  const visibleEventTypes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = eventTypes.filter((t) => {
      if (statusFilter === 'active' && !t.isActive) return false;
      if (statusFilter === 'inactive' && t.isActive) return false;
      if (!query) return true;
      return [t.name, t.slug, t.description].some((v) => String(v || '').toLowerCase().includes(query));
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortKey === 'newest' ? -diff : diff;
    });
  }, [eventTypes, search, statusFilter, sortKey]);

  // ----- Create / Edit -----------------------------------------------------

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSlugTouched(false);
    setIsFormOpen(true);
  };

  const openEdit = (eventType: EventType) => {
    setEditing(eventType);
    setForm({
      name: eventType.name || '',
      slug: eventType.slug || '',
      description: eventType.description || '',
      isActive: Boolean(eventType.isActive),
    });
    setFormErrors({});
    // Never silently rewrite an existing slug — it may be referenced by URLs.
    setSlugTouched(true);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setIsFormOpen(false);
  };

  const updateField = <K extends keyof EventTypePayload>(key: K, value: EventTypePayload[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (values: EventTypePayload): FormErrors => {
    const errors: FormErrors = {};
    const name = values.name.trim();
    const slug = values.slug.trim();

    if (!name) errors.name = 'Name is required.';
    else if (name.length > NAME_MAX) errors.name = `Name must be ${NAME_MAX} characters or fewer.`;
    else if (
      eventTypes.some((t) => t.id !== editing?.id && t.name.trim().toLowerCase() === name.toLowerCase())
    ) {
      errors.name = 'An event type with this name already exists.';
    }

    if (!slug) errors.slug = 'Slug is required.';
    else if (!SLUG_PATTERN.test(slug)) errors.slug = 'Use lowercase letters, numbers and single hyphens only.';
    else if (eventTypes.some((t) => t.id !== editing?.id && t.slug === slug)) {
      errors.slug = 'This slug is already in use.';
    }

    if (values.description.length > DESCRIPTION_MAX) {
      errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: EventTypePayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      isActive: form.isActive,
    };

    const errors = validate(payload);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const updated = await eventTypesApi.update(editing.id, payload);
        setEventTypes((prev) =>
          prev.map((t) => (t.id === editing.id ? { ...t, ...payload, ...(updated?.id ? updated : {}) } : t)),
        );
        toast.success(`"${payload.name}" updated`);
      } else {
        const created = await eventTypesApi.create(payload);
        if (created?.id) setEventTypes((prev) => [...prev, created]);
        else await loadEventTypes();
        toast.success(`"${payload.name}" created`);
      }
      setIsFormOpen(false);
    } catch (err) {
      toast.error(describeApiError(err, editing ? 'Failed to update event type.' : 'Failed to create event type.'));
    } finally {
      setSaving(false);
    }
  };

  // ----- Quick toggle ------------------------------------------------------

  const toggleActive = async (eventType: EventType, nextValue: boolean) => {
    setTogglingIds((prev) => new Set(prev).add(eventType.id));
    // Optimistic update, rolled back on failure.
    setEventTypes((prev) => prev.map((t) => (t.id === eventType.id ? { ...t, isActive: nextValue } : t)));
    try {
      await eventTypesApi.update(eventType.id, { isActive: nextValue });
      toast.success(`"${eventType.name}" ${nextValue ? 'activated' : 'deactivated'}`);
    } catch (err) {
      setEventTypes((prev) =>
        prev.map((t) => (t.id === eventType.id ? { ...t, isActive: eventType.isActive } : t)),
      );
      toast.error(describeApiError(err, 'Failed to update status.'));
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(eventType.id);
        return next;
      });
    }
  };

  // ----- Delete ------------------------------------------------------------

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await eventTypesApi.remove(deleting.id);
      setEventTypes((prev) => prev.filter((t) => t.id !== deleting.id));
      toast.success(`"${deleting.name}" deleted`);
      setDeleting(null);
    } catch (err) {
      toast.error(
        describeApiError(err, 'Failed to delete event type. It may still be assigned to one or more events.'),
      );
    } finally {
      setDeleteInProgress(false);
    }
  };

  // ----- Render ------------------------------------------------------------

  if (!can('content.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  const canCreate = can('content.create');
  const canUpdate = can('content.update');
  const canDelete = can('content.delete');

  const statCards: Array<{ key: StatusFilter; label: string; value: number; icon: JSX.Element; accent: string }> = [
    { key: 'all', label: 'Total types', value: counts.all, icon: <Tags className="w-4 h-4" />, accent: 'text-primary bg-primary/10' },
    { key: 'active', label: 'Active', value: counts.active, icon: <CheckCircle2 className="w-4 h-4" />, accent: 'text-emerald-600 bg-emerald-500/10' },
    { key: 'inactive', label: 'Inactive', value: counts.inactive, icon: <XCircle className="w-4 h-4" />, accent: 'text-amber-600 bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Events Management</p>
          <h1 className="font-body text-2xl sm:text-3xl text-foreground mt-1">Event Types</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define the categories used to classify church events (e.g. Conference, Service, Retreat).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            id="event-types-refresh"
            variant="outline"
            size="icon"
            onClick={loadEventTypes}
            disabled={loading}
            aria-label="Refresh event types"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {canCreate && (
            <Button id="event-types-create" onClick={openCreate} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Event Type
            </Button>
          )}
        </div>
      </div>

      {/* Stats (double as filters) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statCards.map((stat) => (
          <button
            key={stat.key}
            id={`event-types-stat-${stat.key}`}
            type="button"
            onClick={() => setStatusFilter(stat.key)}
            className={`text-left rounded-xl border p-4 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 ${
              statusFilter === stat.key ? 'border-primary ring-1 ring-primary/30 bg-primary/[0.03]' : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</span>
              <span className={`rounded-lg p-1.5 ${stat.accent}`}>{stat.icon}</span>
            </div>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {loading ? <Skeleton className="h-7 w-10" /> : stat.value}
            </div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="event-types-search"
            placeholder="Search by name, slug or description..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v: StatusFilter) => setStatusFilter(v)}>
            <SelectTrigger id="event-types-status-filter" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortKey} onValueChange={(v: SortKey) => setSortKey(v)}>
            <SelectTrigger id="event-types-sort" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A–Z)</SelectItem>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
          <Button variant="outline" size="sm" onClick={loadEventTypes}>
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-md">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="min-w-[180px]">Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="min-w-[220px]">Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full max-w-[160px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : visibleEventTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-14">
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="rounded-full bg-muted p-3">
                          <Tags className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground">
                          {eventTypes.length === 0 ? 'No event types yet' : 'No matching event types'}
                        </p>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {eventTypes.length === 0
                            ? 'Create your first event type to start categorising events.'
                            : 'Try adjusting your search or status filter.'}
                        </p>
                        {eventTypes.length === 0 && canCreate && (
                          <Button size="sm" className="mt-2" onClick={openCreate}>
                            <Plus className="w-4 h-4 mr-1" /> Add Event Type
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleEventTypes.map((eventType) => (
                    <TableRow key={eventType.id} className="group">
                      <TableCell>
                        <button
                          type="button"
                          className="font-medium text-foreground hover:text-primary hover:underline underline-offset-4 text-left"
                          onClick={() => setViewing(eventType)}
                        >
                          {eventType.name}
                        </button>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {eventType.slug || '—'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {eventType.description || <em className="opacity-60">No description</em>}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canUpdate && (
                            <Switch
                              id={`event-type-active-${eventType.id}`}
                              checked={eventType.isActive}
                              disabled={togglingIds.has(eventType.id)}
                              onCheckedChange={(checked) => toggleActive(eventType, checked)}
                              aria-label={`Toggle ${eventType.name} active`}
                            />
                          )}
                          <Badge variant="outline" className="gap-1.5 font-medium px-2 py-0.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${eventType.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}
                            />
                            {eventType.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(eventType.updatedAt || eventType.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider delayDuration={150}>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  id={`event-type-view-${eventType.id}`}
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewing(eventType)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>View details</p></TooltipContent>
                            </Tooltip>
                            {canUpdate && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    id={`event-type-edit-${eventType.id}`}
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEdit(eventType)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Edit</p></TooltipContent>
                              </Tooltip>
                            )}
                            {canDelete && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    id={`event-type-delete-${eventType.id}`}
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleting(eventType)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Delete</p></TooltipContent>
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
          {!loading && visibleEventTypes.length > 0 && (
            <div className="border-t px-4 py-3 text-xs text-muted-foreground">
              Showing {visibleEventTypes.length} of {eventTypes.length} event type{eventTypes.length === 1 ? '' : 's'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => (open ? setIsFormOpen(true) : closeForm())}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Event Type' : 'New Event Type'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the details of this event type. Changes apply to all events using it.'
                : 'Create a new category that events can be assigned to.'}
            </DialogDescription>
          </DialogHeader>

          <form id="event-type-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="event-type-name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="event-type-name"
                value={form.name}
                maxLength={NAME_MAX}
                placeholder="e.g. Conference"
                autoFocus
                onChange={(e) => updateField('name', e.target.value)}
                aria-invalid={Boolean(formErrors.name)}
              />
              {formErrors.name && <p className="text-xs text-red-600">{formErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="event-type-slug">Slug <span className="text-red-500">*</span></Label>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                  onClick={() => {
                    setSlugTouched(false);
                    updateField('slug', slugify(form.name));
                  }}
                  disabled={!form.name.trim()}
                >
                  <Wand2 className="w-3 h-3" /> Generate from name
                </button>
              </div>
              <Input
                id="event-type-slug"
                value={form.slug}
                placeholder="e.g. conference"
                className="font-mono text-sm"
                onChange={(e) => {
                  setSlugTouched(true);
                  updateField('slug', e.target.value.toLowerCase());
                }}
                aria-invalid={Boolean(formErrors.slug)}
              />
              {formErrors.slug ? (
                <p className="text-xs text-red-600">{formErrors.slug}</p>
              ) : (
                <p className="text-xs text-muted-foreground">URL-friendly identifier. Lowercase letters, numbers and hyphens.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="event-type-description">Description</Label>
                <span className="text-xs text-muted-foreground">
                  {form.description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
              <Textarea
                id="event-type-description"
                value={form.description}
                rows={4}
                maxLength={DESCRIPTION_MAX}
                placeholder="Briefly describe what kind of events belong to this type"
                onChange={(e) => updateField('description', e.target.value)}
                aria-invalid={Boolean(formErrors.description)}
              />
              {formErrors.description && <p className="text-xs text-red-600">{formErrors.description}</p>}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="event-type-is-active" className="cursor-pointer">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive types are hidden when creating new events.</p>
              </div>
              <Switch
                id="event-type-is-active"
                checked={form.isActive}
                onCheckedChange={(checked) => updateField('isActive', checked)}
              />
            </div>
          </form>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button id="event-type-submit" type="submit" form="event-type-form" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? 'Save changes' : 'Create event type'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="sm:max-w-md">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {viewing.name}
                  <Badge variant={viewing.isActive ? 'default' : 'secondary'}>
                    {viewing.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </DialogTitle>
                <DialogDescription>Event type details</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-3 gap-y-3 gap-x-4 text-sm">
                <dt className="text-muted-foreground">Slug</dt>
                <dd className="col-span-2"><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{viewing.slug || '—'}</code></dd>
                <dt className="text-muted-foreground">Description</dt>
                <dd className="col-span-2 whitespace-pre-wrap">{viewing.description || '—'}</dd>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="col-span-2">{formatDate(viewing.createdAt)}</dd>
                <dt className="text-muted-foreground">Last updated</dt>
                <dd className="col-span-2">{formatDate(viewing.updatedAt)}</dd>
                {typeof viewing.version === 'number' && (
                  <>
                    <dt className="text-muted-foreground">Version</dt>
                    <dd className="col-span-2">{viewing.version}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">ID</dt>
                <dd className="col-span-2 font-mono text-xs break-all text-muted-foreground">{viewing.id}</dd>
              </dl>
              {canUpdate && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const target = viewing;
                      setViewing(null);
                      openEdit(target);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && !deleteInProgress && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Events currently assigned to this type may lose their category.
              Consider deactivating it instead if you only want to hide it from new events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="event-type-confirm-delete"
              onClick={(e) => {
                e.preventDefault(); // keep dialog open until the request resolves
                confirmDelete();
              }}
              disabled={deleteInProgress}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteInProgress && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEventTypesPage;
