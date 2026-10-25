import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Eye, CheckCircle, Clock, XCircle, Edit, Trash2, ThumbsUp, ThumbsDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  deleteFormSubmission,
  describeApiError,
  listFormSubmissions,
  updateFormSubmission,
  updateFormSubmissionStatus,
  type FormStatus,
  type FormSubmission,
} from '@/lib/adminApi';
import { toast } from '@/components/ui/sonner';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
type Testimony = {
  id: string;
  authorName: string;
  authorEmail: string;
  title: string;
  content: string;
  category: 'salvation' | 'healing' | 'provision' | 'deliverance' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedDate?: string;
  reviewerNotes?: string;
  createdAt: string;
  updatedAt: string;
  source?: 'manual' | 'form';
  data: Record<string, unknown>;
};


const AdminTestimoniesPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testimonyToDelete, setTestimonyToDelete] = useState<Testimony | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTestimony, setEditingTestimony] = useState<Testimony | null>(null);
  const [viewingTestimony, setViewingTestimony] = useState<Testimony | null>(null);
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    title: '',
    content: '',
    category: 'salvation' as 'salvation' | 'healing' | 'provision' | 'deliverance' | 'other',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    reviewerNotes: ''
  });

  const mapFormStatusToTestimonyStatus = (status: FormStatus): Testimony['status'] => {
    if (status === 'approved' || status === 'completed') return 'approved';
    if (status === 'rejected' || status === 'archived') return 'rejected';
    return 'pending';
  };

  const mapTestimonyStatusToFormStatus = (status: Testimony['status']): FormStatus => {
    return status;
  };

  const readString = (data: Record<string, unknown>, key: string) => {
    const value = data[key];
    return typeof value === 'string' ? value : '';
  };

  const getSourceBadge = (source?: Testimony['source']) => {
    if (source === 'form') {
      return <Badge className="bg-sky-100 text-sky-800">Form</Badge>;
    }
    return <Badge className="bg-muted text-gray-800">Manual</Badge>;
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStatus, setActiveStatus] = useState<Testimony['status'] | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });

  const loadTestimonies = useCallback(async () => {
    if (!can('testimonies.read')) return;

    setLoading(true);
    try {
      const statuses: FormStatus[] | undefined = activeStatus === 'pending'
        ? ['pending']
        : activeStatus === 'approved'
          ? ['approved']
          : activeStatus === 'rejected'
            ? ['rejected']
            : undefined;
      const response = await listFormSubmissions({ page, limit: 25, type: 'Testimony', statuses });
      const mappedTestimonies: Testimony[] = response.data.map((item: FormSubmission) => {
        const data = item.data || {};
        return {
          id: item.id,
          authorName: item.fullName || readString(data, 'fullName') || readString(data, 'authorName') || 'Anonymous',
          authorEmail: item.email || readString(data, 'authorEmail'),
          title: readString(data, 'title') || 'Untitled Testimony',
          content: readString(data, 'testimony') || readString(data, 'content'),
          category: ['salvation', 'healing', 'provision', 'deliverance', 'other'].includes(readString(data, 'category'))
            ? readString(data, 'category') as Testimony['category']
            : 'other',
          status: mapFormStatusToTestimonyStatus(item.status),
          submittedDate: item.createdAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          reviewerNotes: item.notes,
          source: 'form',
          data,
        };
      });

      setTestimonies(mappedTestimonies);
      setPagination(response.pagination);
      setError('');
    } catch (e: any) {
      console.warn('Failed to load testimonies:', e);
      setError(describeApiError(e, 'Failed to load testimonies.'));
      setTestimonies([]);
      setPagination({ page, limit: 25, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [activeStatus, can, page]);

  useEffect(() => {
    void loadTestimonies();
  }, [loadTestimonies]);

  const openEditDialog = (testimony: Testimony) => {
    setFormData({
      authorName: testimony.authorName,
      authorEmail: testimony.authorEmail,
      title: testimony.title,
      content: testimony.content,
      category: testimony.category,
      status: testimony.status,
      reviewerNotes: testimony.reviewerNotes || ''
    });
    setEditingTestimony(testimony);
    setIsDialogOpen(true);
  };

  const openViewDialog = (testimony: Testimony) => {
    setViewingTestimony(testimony);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !editingTestimony) return;

    setSubmitting(true);
    try {
      await updateFormSubmission(editingTestimony.id, {
        fullName: formData.authorName,
        email: formData.authorEmail,
        status: mapTestimonyStatusToFormStatus(formData.status),
        notes: formData.reviewerNotes,
        data: {
          ...editingTestimony.data,
          title: formData.title,
          testimony: formData.content,
          category: formData.category,
        },
      });
      toast.success(`Testimony "${formData.title}" updated.`);
      setIsDialogOpen(false);
      setEditingTestimony(null);
      await loadTestimonies();
    } catch (e: any) {
      console.warn('API call failed:', e.message);
      toast.error(describeApiError(e, 'Failed to save testimony'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!testimonyToDelete) return;
    setIsDeleting(true);

    try {
      await deleteFormSubmission(testimonyToDelete.id);
      toast.success(`Testimony "${testimonyToDelete.title}" deleted.`);
      setTestimonyToDelete(null);
      if (testimonies.length === 1 && page > 1) setPage(page - 1);
      else await loadTestimonies();
    } catch (e: any) {
      console.warn('API delete failed:', e.message);
      toast.error(describeApiError(e, 'Failed to delete testimony'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateFormSubmissionStatus(id, mapTestimonyStatusToFormStatus('approved'));
      await loadTestimonies();
      toast.success('Testimony approved.');
    } catch (e: any) {
      console.warn('API update failed:', e.message);
      toast.error(describeApiError(e, 'Failed to approve testimony'));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateFormSubmissionStatus(id, mapTestimonyStatusToFormStatus('rejected'));
      await loadTestimonies();
      toast.success('Testimony rejected.');
    } catch (e: any) {
      console.warn('API update failed:', e.message);
      toast.error(describeApiError(e, 'Failed to reject testimony'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'salvation': return 'bg-blue-100 text-blue-800';
      case 'healing': return 'bg-green-100 text-green-800';
      case 'provision': return 'bg-purple-100 text-purple-800';
      case 'deliverance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  if (!can('testimonies.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  if (loading) {
    return <AdminPageSkeleton label="testimonies" variant="table" columns={7} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Testimony Management</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">Member Testimonies</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage member testimony submissions</p>
          {error && <p role="alert" className="text-sm text-destructive mt-2">{error}</p>}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{pagination.total} matching testimonies</p>

      <Tabs
        value={activeStatus}
        onValueChange={(value) => {
          setPage(1);
          setActiveStatus(value as Testimony['status'] | 'all');
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs sm:text-sm">Approved</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeStatus} className="space-y-4">
          {testimonies.length === 0 ? (
            <p className="text-muted-foreground">No testimonies found</p>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonies.map((testimony) => (
                      <TableRow key={testimony.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">{testimony.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{(testimony.content || '').substring(0, 50)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{testimony.authorName}</p>
                            <p className="text-sm text-gray-500">{testimony.authorEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSourceBadge(testimony.source)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(testimony.category)}>
                            {testimony.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(testimony.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(testimony.status)}
                              {testimony.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {testimony.submittedDate ? new Date(testimony.submittedDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openViewDialog(testimony)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {can('testimonies.update') && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(testimony)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {testimony.status === 'pending' && (
                                  <>
                                    <Button variant="ghost" size="sm" onClick={() => handleApprove(testimony.id)}>
                                      <ThumbsUp className="w-4 h-4 text-green-600" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleReject(testimony.id)}>
                                      <ThumbsDown className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                            {can('testimonies.delete') && (
                              <Button variant="ghost" size="sm" onClick={() => setTestimonyToDelete(testimony)}>
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
        <span>Page {page} of {Math.max(1, pagination.totalPages)} · {pagination.total} testimonies</span>
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
            <DialogTitle>Edit Testimony</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Author Name</label>
                <Input
                  value={formData.authorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Author Email</label>
                <Input
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorEmail: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Testimony Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value: 'salvation' | 'healing' | 'provision' | 'deliverance' | 'other') => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salvation">Salvation</SelectItem>
                    <SelectItem value="healing">Healing</SelectItem>
                    <SelectItem value="provision">Provision</SelectItem>
                    <SelectItem value="deliverance">Deliverance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: 'pending' | 'approved' | 'rejected') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Reviewer Notes</label>
              <Textarea
                value={formData.reviewerNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewerNotes: e.target.value }))}
                rows={3}
                placeholder="Internal notes for review process"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-start items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {submitting ? 'Updating Testimony...' : 'Update Testimony'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Testimony Dialog */}
      <Dialog open={!!viewingTestimony} onOpenChange={() => setViewingTestimony(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Testimony Details</DialogTitle>
          </DialogHeader>
          {viewingTestimony && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{viewingTestimony.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>By {viewingTestimony.authorName}</span>
                    <Badge className={getCategoryColor(viewingTestimony.category)}>
                      {viewingTestimony.category}
                    </Badge>
                    <Badge className={getStatusColor(viewingTestimony.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(viewingTestimony.status)}
                        {viewingTestimony.status}
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{viewingTestimony.content}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-500">Submitted</label>
                  <p>{new Date(viewingTestimony.submittedDate).toLocaleDateString()}</p>
                </div>
                {viewingTestimony.reviewedDate && (
                  <div>
                    <label className="font-medium text-gray-500">Reviewed</label>
                    <p>{new Date(viewingTestimony.reviewedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {viewingTestimony.reviewerNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Reviewer Notes</label>
                  <p className="mt-1 p-3 bg-blue-50 rounded text-sm">{viewingTestimony.reviewerNotes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4">
                <span className="text-sm text-gray-500">Contact:</span>
                <span className="text-sm">{viewingTestimony.authorEmail}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={Boolean(testimonyToDelete)}
        onOpenChange={(open) => !open && !isDeleting && setTestimonyToDelete(null)}
        title="Delete Testimony?"
        description={
          testimonyToDelete
            ? `Are you sure you want to delete the testimony "${testimonyToDelete.title}" by ${testimonyToDelete.authorName}? This action cannot be undone.`
            : 'Are you sure you want to delete this testimony?'
        }
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Testimony'}
        loading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminTestimoniesPage;
