import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Users, CheckCircle, Clock, Mail, Phone, MessageSquare, Edit, Trash2, Eye, Check, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  deleteFormSubmission,
  describeApiError,
  listFormSubmissions,
  updateFormSubmission,
  updateFormSubmissionStatus,
  type FormStatus,
  type FormSubmission,
  type FormType,
} from '@/lib/adminApi';
import { toast } from '@/components/ui/sonner';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
const readString = (data: Record<string, unknown>, key: string) => {
  const value = data[key];
  return typeof value === 'string' ? value : '';
};

const AdminFormsPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<FormStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<FormSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<FormSubmission | null>(null);
  const [formData, setFormData] = useState({
    type: 'Feedback' as FormType,
    fullName: '',
    email: '',
    phone: '',
    message: '',
    status: 'pending' as FormStatus
  });

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listFormSubmissions({
        page,
        limit: 25,
        statuses: activeStatus === 'all' ? undefined : [activeStatus],
      });
      setSubmissions(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (e: any) {
      console.warn('Failed to load submissions from API:', e.message);
      setError(describeApiError(e, 'Failed to load form submissions.'));
      setSubmissions([]);
      setPagination({ page, limit: 25, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [activeStatus, page]);

  useEffect(() => {
    if (can('forms.read')) void loadSubmissions();
  }, [can, loadSubmissions]);

  const resetForm = () => {
    setFormData({
      type: 'Feedback',
      fullName: '',
      email: '',
      phone: '',
      message: '',
      status: 'pending'
    });
    setEditingSubmission(null);
  };

  const openEditDialog = (submission: FormSubmission) => {
    const data = submission.data;
    setFormData({
      type: submission.type,
      fullName: submission.fullName || readString(data, 'fullName') || readString(data, 'name'),
      email: submission.email || readString(data, 'email'),
      phone: submission.phone || readString(data, 'phone'),
      message: readString(data, 'message'),
      status: submission.status === 'new' || submission.status === 'in_progress'
        ? 'pending'
        : submission.status === 'completed'
          ? 'approved'
          : submission.status === 'archived'
            ? 'cancelled'
            : submission.status
    });
    setEditingSubmission(submission);
    setIsDialogOpen(true);
  };

  const openViewDialog = (submission: FormSubmission) => {
    setViewingSubmission(submission);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!editingSubmission) return;

    setSubmitting(true);
    try {
      await updateFormSubmission(editingSubmission.id, {
        type: formData.type,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        data: { ...editingSubmission.data, message: formData.message },
      });
      toast.success('Form submission updated successfully.');
      setIsDialogOpen(false);
      resetForm();
      await loadSubmissions();
    } catch (e: any) {
      console.warn('API call failed:', e.message);
      const msg = describeApiError(e, 'Failed to update submission');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!submissionToDelete) return;
    setIsDeleting(true);

    try {
      await deleteFormSubmission(submissionToDelete.id);
      toast.success('Form submission deleted.');
      setSubmissionToDelete(null);
      if (submissions.length === 1 && page > 1) setPage(page - 1);
      else await loadSubmissions();
    } catch (e: any) {
      console.warn('API delete failed:', e.message);
      const msg = describeApiError(e, 'Failed to delete submission');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: FormStatus) => {
    try {
      await updateFormSubmissionStatus(id, status);
      toast.success(`Status updated to "${status.replace('_', ' ')}".`);
      await loadSubmissions();
    } catch (e: any) {
      console.warn('API update failed:', e.message);
      const msg = describeApiError(e, 'Failed to update status');
      setError(msg);
      toast.error(msg);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'new': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <MessageSquare className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'archived': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getFormTypeColor = (type: string) => {
    switch (type) {
      case 'Feedback': return 'bg-blue-100 text-blue-800';
      case 'Testimony': return 'bg-purple-100 text-purple-800';
      case 'Altar Call': return 'bg-green-100 text-green-800';
      case 'Naming Ceremony': return 'bg-orange-100 text-orange-800';
      case 'Counselling': return 'bg-red-100 text-red-800';
      case 'New Comers': return 'bg-yellow-100 text-yellow-800';
      case 'Pre-Marital Counselling': return 'bg-pink-100 text-pink-800';
      case 'Volunteer': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getSubmissionName = (submission: FormSubmission) => {
    return submission.fullName || readString(submission.data, 'fullName') || readString(submission.data, 'name') || 'N/A';
  };

  const getSubmissionEmail = (submission: FormSubmission) => {
    return submission.email || readString(submission.data, 'email') || 'N/A';
  };

  const getSubmissionPhone = (submission: FormSubmission) => {
    return submission.phone || readString(submission.data, 'phone');
  };

  const getSubmissionSummary = (submission: FormSubmission) => {
    const data = submission.data;
    return readString(data, 'message') || readString(data, 'testimony') || readString(data, 'title') ||
      Object.values(data).find((value): value is string => typeof value === 'string' && value.length > 10) || 'N/A';
  };

  if (!can('forms.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  if (loading) {
    return <AdminPageSkeleton label="form submissions" variant="table" columns={6} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Form Management</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">Form Submissions</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage form submissions from the website</p>
          {error && (
            <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{pagination.total} matching submissions</p>

      <Tabs
        value={activeStatus}
        onValueChange={(value) => {
          setPage(1);
          setActiveStatus(value as FormStatus | 'all');
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs sm:text-sm">Approved</TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs sm:text-sm">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeStatus} className="space-y-4">
          {submissions.length === 0 ? (
            <p className="text-muted-foreground">No form submissions found</p>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{getSubmissionName(submission)}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              {getSubmissionEmail(submission)}
                            </div>
                            {getSubmissionPhone(submission) && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                {getSubmissionPhone(submission)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getFormTypeColor(submission.type)}>
                            {submission.type.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="line-clamp-1">{getSubmissionSummary(submission)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(submission.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(submission.status)}
                              {submission.status.replace('_', ' ')}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openViewDialog(submission)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {can('forms.update') && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(submission)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {submission.status === 'pending' && (
                                  <>
                                    <Button variant="ghost" size="sm" aria-label="Approve submission" title="Approve submission" onClick={() => handleStatusUpdate(submission.id, 'approved')}>
                                      <Check className="w-4 h-4 text-green-600" />
                                    </Button>
                                    <Button variant="ghost" size="sm" aria-label="Cancel submission" title="Cancel submission" onClick={() => handleStatusUpdate(submission.id, 'cancelled')}>
                                      <XCircle className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                                {submission.status === 'new' && (
                                  <Button variant="ghost" size="sm" aria-label="Approve submission" title="Approve submission" onClick={() => handleStatusUpdate(submission.id, 'approved')}>
                                    <Check className="w-4 h-4 text-green-600" />
                                  </Button>
                                )}
                                {submission.status === 'in_progress' && (
                                  <Button variant="ghost" size="sm" aria-label="Approve submission" title="Approve submission" onClick={() => handleStatusUpdate(submission.id, 'approved')}>
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                )}
                              </>
                            )}
                            {can('forms.delete') && (
                              <Button variant="ghost" size="sm" onClick={() => setSubmissionToDelete(submission)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>Page {page} of {Math.max(1, pagination.totalPages)} · {pagination.total} submissions</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next page" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !submitting && setIsDialogOpen(open)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
            <DialogDescription>Update the details and status for this submission.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Form Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as FormType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Feedback">Feedback</SelectItem>
                    <SelectItem value="Testimony">Testimony</SelectItem>
                    <SelectItem value="Altar Call">Altar Call</SelectItem>
                    <SelectItem value="Naming Ceremony">Baby Dedication</SelectItem>
                    <SelectItem value="Counselling">Counselling</SelectItem>
                    <SelectItem value="New Comers">New Member</SelectItem>
                    <SelectItem value="Pre-Marital Counselling">Pre-Marital Counseling</SelectItem>
                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: FormStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-start items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {submitting
                  ? (editingSubmission ? 'Updating Submission...' : 'Adding Submission...')
                  : (editingSubmission ? 'Update Submission' : 'Add Submission')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Submission Dialog */}
      <Dialog open={!!viewingSubmission} onOpenChange={() => setViewingSubmission(null)}>
        <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-2xl">
          {viewingSubmission && (
            <>
              <div className="max-h-[88vh] overflow-y-auto p-8 sm:p-10">
                <DialogHeader className="space-y-0 border-b pb-7 pr-10 text-left">
                  <p className="text-xs font-medium text-muted-foreground">Form submission</p>
                  <DialogDescription className="sr-only">
                    Contact information, message, and status for this form submission.
                  </DialogDescription>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <DialogTitle className="min-w-0 text-2xl leading-tight">
                      {getSubmissionName(viewingSubmission)}
                    </DialogTitle>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Badge className={getFormTypeColor(viewingSubmission.type)}>
                        {viewingSubmission.type?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown type'}
                      </Badge>
                      <Badge className={getStatusColor(viewingSubmission.status)}>
                        <span className="flex items-center gap-1.5 capitalize">
                          {getStatusIcon(viewingSubmission.status)}
                          {viewingSubmission.status.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <section aria-label="Submitter contact" className="grid gap-5 border-b py-7 sm:grid-cols-2">
                  <div className="flex min-w-0 items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="mt-1 break-all text-sm text-foreground">{getSubmissionEmail(viewingSubmission)}</p>
                    </div>
                  </div>
                  {getSubmissionPhone(viewingSubmission) && (
                    <div className="flex min-w-0 items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="mt-1 break-words text-sm text-foreground">{getSubmissionPhone(viewingSubmission)}</p>
                      </div>
                    </div>
                  )}
                </section>

                <section aria-label="Submission message and notes" className="space-y-7 border-b py-7">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Message</h3>
                    <p className="mt-3 whitespace-pre-wrap break-words text-base leading-7 text-foreground">
                      {getSubmissionSummary(viewingSubmission)}
                    </p>
                  </div>

                  {viewingSubmission.notes && (
                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium text-muted-foreground">Internal notes</h3>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                        {viewingSubmission.notes}
                      </p>
                    </div>
                  )}
                </section>

                <dl className="grid grid-cols-2 gap-5 pt-7 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Submitted</dt>
                    <dd className="mt-1 text-foreground">
                      {new Date(viewingSubmission.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Last updated</dt>
                    <dd className="mt-1 text-foreground">
                      {new Date(viewingSubmission.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={Boolean(submissionToDelete)}
        onOpenChange={(open) => !open && !isDeleting && setSubmissionToDelete(null)}
        title="Delete Form Submission?"
        description={
          submissionToDelete
            ? `Are you sure you want to delete the submission from "${submissionToDelete.fullName || submissionToDelete.email || 'this user'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this form submission?'
        }
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Submission'}
        loading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminFormsPage;
