import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Eye, CheckCircle, Clock, XCircle, Plus, Edit, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { adminRequest } from '@/lib/adminApi';

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
  formSubmissionId?: string;
};

type FormSubmission = {
  id: string;
  type: string;
  status?: 'new' | 'in_progress' | 'completed' | 'archived';
  notes?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'wgc_admin_testimonies';

const AdminTestimoniesPage = () => {
  const { can, user } = useOutletContext<AdminOutletContext>();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const isNotFoundError = (error: any) => {
    const message = String(error?.message || '');
    return message.includes('NOT_FOUND') || message.includes('404');
  };

  const mapFormStatusToTestimonyStatus = (status?: string): Testimony['status'] => {
    if (status === 'completed') return 'approved';
    if (status === 'archived') return 'rejected';
    return 'pending';
  };

  const mapTestimonyStatusToFormStatus = (status: Testimony['status']) => {
    if (status === 'approved') return 'completed';
    if (status === 'rejected') return 'archived';
    return 'in_progress';
  };

  const extractFormItems = (payload: any): FormSubmission[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;
    return [];
  };

  const getSourceBadge = (source?: Testimony['source']) => {
    if (source === 'form') {
      return <Badge className="bg-sky-100 text-sky-800">Form</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Manual</Badge>;
  };

  // Load testimonies from API on component mount
  useEffect(() => {
    const loadTestimonies = async () => {
      let localManualTestimonies: Testimony[] = [];

      const stored = localStorage.getItem(STORAGE_KEY);
      try {
        const parsed = stored ? JSON.parse(stored) : [];
        localManualTestimonies = (Array.isArray(parsed) ? parsed : []).filter((item: Testimony) => item.source !== 'form');
      } catch (error) {
        console.error('Failed to load testimonies from storage:', error);
        localManualTestimonies = [];
      }

      try {
        let formTestimonies: Testimony[] = [];
        if (can('testimonies.read') && can('forms.read')) {
          let formItems: FormSubmission[] = [];

          try {
            const formsRes = await adminRequest<{ items?: FormSubmission[]; data?: FormSubmission[] }>(
              '/forms?page=1&limit=100&type=Testimony'
            );
            formItems = extractFormItems(formsRes);
          } catch (primaryError: any) {
            if (!isNotFoundError(primaryError)) {
              throw primaryError;
            }
            const fallbackRes = await adminRequest<{ items?: FormSubmission[]; data?: FormSubmission[] }>(
              '/admin/forms/all?page=1&pageSize=100'
            );
            const fallbackItems = extractFormItems(fallbackRes);
            formItems = fallbackItems.filter((item) => String(item.type || '').toLowerCase().trim() === 'testimony');
          }

          formTestimonies = formItems
            .filter((submission) => String(submission.type || '').toLowerCase().trim() === 'testimony')
            .map((submission) => ({
              id: `form-${submission.id}`,
              authorName: submission.fullName || submission.data?.fullName || 'Anonymous',
              authorEmail: submission.email || submission.data?.email || 'no-email@submitted.local',
              title: submission.data?.title || 'Untitled Testimony',
              content: submission.data?.testimony || submission.data?.message || '',
              category: 'other',
              status: mapFormStatusToTestimonyStatus(submission.status),
              submittedDate: submission.createdAt,
              reviewedDate:
                submission.status === 'completed' || submission.status === 'archived'
                  ? submission.updatedAt || submission.createdAt
                  : undefined,
              reviewerNotes: submission.notes || '',
              createdAt: submission.createdAt,
              updatedAt: submission.updatedAt,
              source: 'form',
              formSubmissionId: submission.id,
            }));
        }

        const combined = [...formTestimonies, ...localManualTestimonies];
        const uniqueById = Array.from(new Map(combined.map((item) => [item.id, item])).values());

        setTestimonies(uniqueById);
        // Save to localStorage as backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueById.filter((item) => item.source !== 'form')));
      } catch (e: any) {
        console.warn('Failed to load testimonies from API:', e.message);
        setTestimonies(localManualTestimonies);
      }
    };

    loadTestimonies();
  }, [can, user.role]);

  // Save only non-form testimonies to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonies.filter((item) => item.source !== 'form')));
  }, [testimonies]);

  const resetForm = () => {
    setFormData({
      authorName: '',
      authorEmail: '',
      title: '',
      content: '',
      category: 'salvation',
      status: 'pending',
      reviewerNotes: ''
    });
    setEditingTestimony(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

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
    const now = new Date().toISOString();

    try {
      if (editingTestimony) {
        if (editingTestimony.source === 'form') {
          const formId = editingTestimony.formSubmissionId || editingTestimony.id.replace(/^form-/, '');
          await adminRequest(`/forms/${formId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              fullName: formData.authorName,
              email: formData.authorEmail,
              type: 'Testimony',
              data: {
                title: formData.title,
                testimony: formData.content,
                category: formData.category,
              },
              status: mapTestimonyStatusToFormStatus(formData.status),
              notes: formData.reviewerNotes,
            })
          });
        }
        // Update local state
        setTestimonies(prev => prev.map(testimony =>
          testimony.id === editingTestimony.id
            ? {
                ...testimony,
                ...formData,
                updatedAt: now,
                reviewedDate: formData.status !== 'pending' && testimony.status === 'pending' ? now : testimony.reviewedDate
              }
            : testimony
        ));
      } else {
        const newTestimony: Testimony = {
          id: `manual-${Date.now()}`,
          authorName: formData.authorName,
          authorEmail: formData.authorEmail,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          status: formData.status,
          submittedDate: now,
          reviewedDate: formData.status !== 'pending' ? now : undefined,
          reviewerNotes: formData.reviewerNotes,
          createdAt: now,
          updatedAt: now,
          source: 'manual',
        };
        setTestimonies(prev => [newTestimony, ...prev]);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (e: any) {
      console.warn('API call failed:', e.message);
      alert(e?.message || 'Failed to save testimony');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimony?')) return;

    const testimony = testimonies.find(item => item.id === id);
    if (!testimony) return;

    try {
      if (testimony.source === 'form') {
        const formId = testimony.formSubmissionId || testimony.id.replace(/^form-/, '');
        await adminRequest(`/forms/${formId}`, { method: 'DELETE' });
      }
      setTestimonies(prev => prev.filter(testimony => testimony.id !== id));
    } catch (e: any) {
      console.warn('API delete failed:', e.message);
      alert(e?.message || 'Failed to delete testimony');
    }
  };

  const handleApprove = async (id: string) => {
    const now = new Date().toISOString();
    const testimony = testimonies.find(item => item.id === id);
    if (!testimony) return;

    try {
      if (testimony.source === 'form') {
        const formId = testimony.formSubmissionId || testimony.id.replace(/^form-/, '');
        await adminRequest(`/forms/${formId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' })
        });
      }
      setTestimonies(prev => prev.map(testimony =>
        testimony.id === id
          ? { ...testimony, status: 'approved', reviewedDate: now, updatedAt: now }
          : testimony
      ));
    } catch (e: any) {
      console.warn('API update failed, updating local storage:', e.message);
      // Fallback to localStorage when API fails
      setTestimonies(prev => prev.map(testimony =>
        testimony.id === id
          ? { ...testimony, status: 'approved', reviewedDate: now, updatedAt: now }
          : testimony
      ));
    }
  };

  const handleReject = async (id: string) => {
    const now = new Date().toISOString();
    const testimony = testimonies.find(item => item.id === id);
    if (!testimony) return;

    try {
      if (testimony.source === 'form') {
        const formId = testimony.formSubmissionId || testimony.id.replace(/^form-/, '');
        await adminRequest(`/forms/${formId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'archived' })
        });
      }
      setTestimonies(prev => prev.map(testimony =>
        testimony.id === id
          ? { ...testimony, status: 'rejected', reviewedDate: now, updatedAt: now }
          : testimony
      ));
    } catch (e: any) {
      console.warn('API update failed, updating local storage:', e.message);
      // Fallback to localStorage when API fails
      setTestimonies(prev => prev.map(testimony =>
        testimony.id === id
          ? { ...testimony, status: 'rejected', reviewedDate: now, updatedAt: now }
          : testimony
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedTestimonies = testimonies.reduce((acc, testimony) => {
    if (!acc[testimony.status]) acc[testimony.status] = [];
    acc[testimony.status].push(testimony);
    return acc;
  }, {} as Record<string, Testimony[]>);

  const stats = {
    total: testimonies.length,
    pending: groupedTestimonies.pending?.length || 0,
    approved: groupedTestimonies.approved?.length || 0,
    rejected: groupedTestimonies.rejected?.length || 0
  };

  if (!can('testimonies.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-black/40">Testimony Management</p>
          <h1 className="font-heading text-2xl sm:text-3xl text-black mt-1">Member Testimonies</h1>
          <p className="text-sm text-black/70 mt-1">Review and manage member testimony submissions</p>
        </div>
        {can('testimonies.create') && (
          <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Testimony
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Approved</span>
            </div>
            <p className="text-2xl font-bold">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Rejected</span>
            </div>
            <p className="text-2xl font-bold">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved" className="text-xs sm:text-sm">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {testimonies.length === 0 ? (
            <p className="text-black/60">No testimonies found</p>
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
                            <p className="text-sm text-gray-500 line-clamp-1">{testimony.content.substring(0, 50)}...</p>
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
                          {new Date(testimony.submittedDate).toLocaleDateString()}
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
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(testimony.id)}>
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

        {['pending', 'approved', 'rejected'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {groupedTestimonies[status]?.length === 0 ? (
              <p className="text-black/60">No {status} testimonies found</p>
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
                      {groupedTestimonies[status]?.map((testimony) => (
                        <TableRow key={testimony.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium line-clamp-1">{testimony.title}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">{testimony.content.substring(0, 50)}...</p>
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
                            {new Date(testimony.submittedDate).toLocaleDateString()}
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
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(testimony.id)}>
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
        ))}
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTestimony ? 'Edit Testimony' : 'Add New Testimony'}</DialogTitle>
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

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                {editingTestimony ? 'Update Testimony' : 'Add Testimony'}
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

              <div className="bg-gray-50 p-4 rounded-lg">
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
    </div>
  );
};

export default AdminTestimoniesPage;
