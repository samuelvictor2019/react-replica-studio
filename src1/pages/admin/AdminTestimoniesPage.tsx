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
    return <Badge className="bg-muted text-gray-800">Manual</Badge>;
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTestimonies = async () => {
    if (!can('testimonies.read')) return;
    
    setLoading(true);
    try {
      const res = await adminRequest<any>('/forms?page=1&limit=50&type=Testimony');
      const formItems = extractFormItems(res);
      
      const mappedTestimonies: Testimony[] = formItems.map(item => {
        const data = item.data || {};
        return {
          id: item.id,
          authorName: item.fullName || data.authorName || 'Anonymous',
          authorEmail: item.email || data.authorEmail || '',
          title: data.title || 'Untitled Testimony',
          content: data.content || '',
          category: data.category || 'other',
          status: mapFormStatusToTestimonyStatus(item.status),
          submittedDate: item.createdAt || new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          source: 'form',
          formSubmissionId: item.id
        };
      });

      setTestimonies(mappedTestimonies);
      setError('');
    } catch (error) {
      console.warn('Failed to load testimonies:', error);
      setError('Failed to load testimonies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonies();
  }, [can]);

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

    try {
      const formPayload = {
        type: 'Testimony',
        fullName: formData.authorName,
        email: formData.authorEmail,
        status: mapTestimonyStatusToFormStatus(formData.status),
        data: {
          title: formData.title,
          content: formData.content,
          category: formData.category,
          reviewerNotes: formData.reviewerNotes
        }
      };

      if (editingTestimony) {
        await adminRequest(`/forms/${editingTestimony.formSubmissionId || editingTestimony.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formPayload)
        });
      } else {
        await adminRequest('/forms', {
          method: 'POST',
          body: JSON.stringify(formPayload)
        });
      }
      setIsDialogOpen(false);
      resetForm();
      loadTestimonies();
    } catch (e: any) {
      console.warn('API call failed:', e.message);
      alert(e?.message || 'Failed to save testimony');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimony?')) return;

    try {
      await adminRequest(`/forms/${id}`, { method: 'DELETE' });
      loadTestimonies();
    } catch (e: any) {
      console.warn('API delete failed:', e.message);
      alert(e?.message || 'Failed to delete testimony');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminRequest(`/forms/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: mapTestimonyStatusToFormStatus('approved') })
      });
      loadTestimonies();
    } catch (e: any) {
      console.warn('API update failed:', e.message);
      alert(e?.message || 'Failed to approve testimony');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminRequest(`/forms/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: mapTestimonyStatusToFormStatus('rejected') })
      });
      loadTestimonies();
    } catch (e: any) {
      console.warn('API update failed:', e.message);
      alert(e?.message || 'Failed to reject testimony');
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
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Testimony Management</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">Member Testimonies</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage member testimony submissions</p>
        </div>
        {can('testimonies.create') && (
          <Button onClick={openCreateDialog} className="w-full sm:w-auto">
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
              <p className="text-muted-foreground">No {status} testimonies found</p>
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
              <Button type="submit" className="w-full sm:w-auto">
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
    </div>
  );
};

export default AdminTestimoniesPage;
