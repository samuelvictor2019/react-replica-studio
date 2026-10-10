import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Users, CheckCircle, Clock, Mail, Phone, MessageSquare, Edit, Trash2, Eye, Check } from 'lucide-react';
import { adminRequest } from '@/lib/adminApi';

type FormSubmission = {
  id: string;
  type: string;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  notes?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  data: {
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    feedbackType?: string;
    decision?: string;
    prayerNeed?: string;
    parentName?: string;
    babyName?: string;
    dob?: string;
    activeMember?: string;
    preferredDate?: string;
    title?: string;
    testimony?: string;
    shareOption?: string;
    confirm?: boolean;
    consent?: boolean;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
};

const DEDICATED_TYPES = new Set(['new comers', 'newcomers', 'new member', 'new-member', 'testimony']);

const parseSubmissionData = (rawData: any): Record<string, any> => {
  if (rawData && typeof rawData === 'object') return rawData;
  if (typeof rawData === 'string') {
    try {
      const parsed = JSON.parse(rawData);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};

const normalizeSubmission = (submission: any): FormSubmission => {
  const data = parseSubmissionData(submission?.data);
  const status = ['new', 'in_progress', 'completed', 'archived'].includes(String(submission?.status || ''))
    ? submission.status
    : 'new';

  return {
    id: String(submission?.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`),
    type: String(submission?.type || 'Feedback'),
    status,
    notes: submission?.notes || '',
    fullName: submission?.fullName || data.fullName || data.name || '',
    email: submission?.email || data.email || '',
    phone: submission?.phone || data.phone || '',
    data,
    createdAt: submission?.createdAt || new Date().toISOString(),
    updatedAt: submission?.updatedAt || submission?.createdAt || new Date().toISOString(),
  };
};

const isManagedByFormsPage = (submission: FormSubmission) => {
  const normalizedType = String(submission.type || '').toLowerCase().trim();
  if (DEDICATED_TYPES.has(normalizedType)) return false;

  const data = parseSubmissionData(submission.data);
  const isEventRegistrationLike = normalizedType === 'feedback' && Boolean(data.eventId || data.eventTitle || data.selectedDays || data.accommodation);
  if (isEventRegistrationLike) return false;

  return true;
};

const AdminFormsPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<FormSubmission | null>(null);
  const [formData, setFormData] = useState({
    type: 'Feedback',
    fullName: '',
    email: '',
    phone: '',
    message: '',
    status: 'new' as 'new' | 'in_progress' | 'completed' | 'archived',
    notes: ''
  });

  const isNotFoundError = (error: any) => {
    const message = String(error?.message || '');
    return message.includes('NOT_FOUND') || message.includes('404');
  };

  const isAuthPermissionError = (error: any) => {
    const message = String(error?.message || '').toLowerCase();
    return message.includes('forbidden') || message.includes('403') || message.includes('unauthorized') || message.includes('401') || message.includes('authentication expired');
  };

  // Load submissions from API on component mount
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const res = await adminRequest<{ items?: FormSubmission[]; data?: FormSubmission[] }>('/forms/submissions?page=1&limit=100');
        const apiItems = Array.isArray(res.items) ? res.items : Array.isArray(res.data) ? res.data : [];
        const normalizedItems = apiItems.map(normalizeSubmission).filter(isManagedByFormsPage);
        setSubmissions(normalizedItems);
        setError('');
      } catch (e: any) {
        console.warn('Failed to load submissions from API:', e.message);
        setError('Failed to load forms from backend.');
        setSubmissions([]);
      }
    };

    loadSubmissions();
  }, []);

  const resetForm = () => {
    setFormData({
      type: 'Feedback',
      fullName: '',
      email: '',
      phone: '',
      message: '',
      status: 'new',
      notes: ''
    });
    setEditingSubmission(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (submission: FormSubmission) => {
    const data = parseSubmissionData(submission.data);
    setFormData({
      type: submission.type,
      fullName: submission.fullName || data.fullName || data.name || '',
      email: submission.email || data.email || '',
      phone: submission.phone || data.phone || '',
      message: data.message || '',
      status: submission.status,
      notes: submission.notes || ''
    });
    setEditingSubmission(submission);
    setIsDialogOpen(true);
  };

  const openViewDialog = (submission: FormSubmission) => {
    setViewingSubmission(submission);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    try {
      if (editingSubmission) {
        // Update submission status and notes
        await adminRequest(`/forms/submissions/${editingSubmission.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: formData.status,
            notes: formData.notes
          })
        });
        
        // Update local state
        setSubmissions(prev => prev.map(submission =>
          submission.id === editingSubmission.id
            ? {
                ...submission,
                status: formData.status,
                notes: formData.notes,
                updatedAt: now
              }
            : submission
        ));
      } else {
        alert('Creating new submissions is not supported. Submissions are created automatically when users submit forms on the website.');
        return;
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (e: any) {
      console.warn('API call failed:', e.message);
      setError(e.message || 'Failed to update submission');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form submission?')) return;

    try {
      await adminRequest(`/forms/submissions/${id}`, { method: 'DELETE' });
      setSubmissions(prev => prev.filter(submission => submission.id !== id));
    } catch (e: any) {
      console.warn('API delete failed:', e.message);
      setError(e.message || 'Failed to delete submission');
    }
  };

  const handleStatusUpdate = async (id: string, status: 'new' | 'in_progress' | 'completed' | 'archived') => {
    const now = new Date().toISOString();
    
    try {
      await adminRequest(`/forms/submissions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      
      setSubmissions(prev => prev.map(submission =>
        submission.id === id
          ? {
              ...submission,
              status,
              updatedAt: now
            }
          : submission
      ));
    } catch (e: any) {
      console.warn('API update failed:', e.message);
      setError(e.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
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
    const data = parseSubmissionData(submission.data);
    return submission.fullName || data.fullName || data.name || 'N/A';
  };

  const getSubmissionEmail = (submission: FormSubmission) => {
    const data = parseSubmissionData(submission.data);
    return submission.email || data.email || 'N/A';
  };

  const getSubmissionPhone = (submission: FormSubmission) => {
    const data = parseSubmissionData(submission.data);
    return submission.phone || data.phone || '';
  };

  const getSubmissionSummary = (submission: FormSubmission) => {
    const data = parseSubmissionData(submission.data);
    return data.message || data.testimony || data.title || Object.values(data).find((value) => typeof value === 'string' && value.length > 10) || 'N/A';
  };

  const groupedSubmissions = submissions.reduce((acc, submission) => {
    if (!acc[submission.status]) acc[submission.status] = [];
    acc[submission.status].push(submission);
    return acc;
  }, {} as Record<string, FormSubmission[]>);

  const stats = {
    total: submissions.length,
    new: groupedSubmissions.new?.length || 0,
    inProgress: groupedSubmissions.in_progress?.length || 0,
    completed: groupedSubmissions.completed?.length || 0,
    archived: groupedSubmissions.archived?.length || 0
  };

  if (!can('forms.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">New</span>
            </div>
            <p className="text-2xl font-bold">{stats.new}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Archived</span>
            </div>
            <p className="text-2xl font-bold">{stats.archived}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="new" className="text-xs sm:text-sm">New ({stats.new})</TabsTrigger>
          <TabsTrigger value="in_progress" className="text-xs sm:text-sm">In Progress ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="archived" className="text-xs sm:text-sm">Archived ({groupedSubmissions.archived?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
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
                                {submission.status === 'new' && (
                                  <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(submission.id, 'in_progress')}>
                                    <Check className="w-4 h-4 text-green-600" />
                                  </Button>
                                )}
                                {submission.status === 'in_progress' && (
                                  <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(submission.id, 'completed')}>
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                )}
                              </>
                            )}
                            {can('forms.delete') && (
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(submission.id)}>
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

        {['new', 'in_progress', 'completed', 'archived'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {groupedSubmissions[status]?.length === 0 ? (
              <p className="text-muted-foreground">No {status.replace('_', ' ')} submissions found</p>
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
                      {groupedSubmissions[status]?.map((submission) => (
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
                                  {submission.status === 'new' && (
                                    <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(submission.id, 'in_progress')}>
                                      <Check className="w-4 h-4 text-green-600" />
                                    </Button>
                                  )}
                                  {submission.status === 'in_progress' && (
                                    <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(submission.id, 'completed')}>
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    </Button>
                                  )}
                                </>
                              )}
                              {can('forms.delete') && (
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(submission.id)}>
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
            <DialogTitle>{editingSubmission ? 'Edit Submission' : 'Add New Submission'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Form Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
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
                <Select value={formData.status} onValueChange={(value: 'new' | 'in_progress' | 'completed' | 'archived') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
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
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
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

            <div>
              <label className="text-sm font-medium">Internal Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Internal notes for processing this submission"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingSubmission ? 'Update Submission' : 'Add Submission'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Submission Dialog */}
      <Dialog open={!!viewingSubmission} onOpenChange={() => setViewingSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Form Submission Details</DialogTitle>
          </DialogHeader>
          {viewingSubmission && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{getSubmissionName(viewingSubmission)}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <Badge className={getFormTypeColor(viewingSubmission.type)}>
                      {viewingSubmission.type.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                    <Badge className={getStatusColor(viewingSubmission.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(viewingSubmission.status)}
                        {viewingSubmission.status.replace('_', ' ')}
                      </div>
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{getSubmissionEmail(viewingSubmission)}</span>
                    </div>
                    {getSubmissionPhone(viewingSubmission) && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{getSubmissionPhone(viewingSubmission)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 font-medium">{getSubmissionName(viewingSubmission)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="mt-1 p-4 bg-muted rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{getSubmissionSummary(viewingSubmission)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-gray-500">Submitted</label>
                  <p>{new Date(viewingSubmission.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Last Updated</label>
                  <p>{new Date(viewingSubmission.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {viewingSubmission.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Internal Notes</label>
                  <p className="mt-1 p-3 bg-blue-50 rounded text-sm">{viewingSubmission.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFormsPage;
