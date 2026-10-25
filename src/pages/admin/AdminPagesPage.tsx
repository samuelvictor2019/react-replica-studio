import { useEffect, useState } from 'react';
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
import { FileText, Eye, Edit, Globe, Lock, Plus, Trash2, ExternalLink, Save, Loader2 } from 'lucide-react';
import { adminRequest, describeApiError } from '@/lib/adminApi';
import { toast } from '@/components/ui/sonner';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'members_only';
  category: 'announcement' | 'ministry' | 'event' | 'resource' | 'other';
  author: string;
  publishedDate?: string;
  lastModified: string;
  createdAt: string;
  updatedAt: string;
};


const AdminPagesPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const [pages, setPages] = useState<Page[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [viewingPage, setViewingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    visibility: 'public' as 'public' | 'private' | 'members_only',
    category: 'announcement' as 'announcement' | 'ministry' | 'event' | 'resource' | 'other',
    author: 'Admin'
  });

  const [loading, setLoading] = useState(true);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await adminRequest<{ data: Page[] }>('/pages');
      setPages(res.data || []);
    } catch (e: any) {
      console.warn('Failed to load pages:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'draft',
      visibility: 'public',
      category: 'announcement',
      author: 'Admin'
    });
    setEditingPage(null);
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !editingPage) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, editingPage]);

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (page: Page) => {
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || '',
      status: page.status,
      visibility: page.visibility,
      category: page.category,
      author: page.author
    });
    setEditingPage(page);
    setIsDialogOpen(true);
  };

  const openViewDialog = (page: Page) => {
    setViewingPage(page);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (editingPage) {
        await adminRequest(`/pages/${editingPage.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData)
        });
      } else {
        await adminRequest('/pages', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        toast.success(`Page "${formData.title}" created.`);
      }
      setIsDialogOpen(false);
      resetForm();
      loadPages();
    } catch (e: any) {
      console.warn('Failed to save page:', e.message);
      const msg = describeApiError(e, 'Failed to save page');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;
    setIsDeleting(true);

    try {
      await adminRequest(`/pages/${pageToDelete.id}`, { method: 'DELETE' });
      toast.success(`Page "${pageToDelete.title}" deleted.`);
      setPageToDelete(null);
      loadPages();
    } catch (e: any) {
      console.warn('Failed to delete page:', e.message);
      const msg = describeApiError(e, 'Failed to delete page');
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await adminRequest(`/pages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'published' })
      });
      toast.success('Page published successfully.');
      loadPages();
    } catch (e: any) {
      console.warn('Failed to publish page:', e.message);
      const msg = describeApiError(e, 'Failed to publish page');
      toast.error(msg);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'published': return <Globe className="w-4 h-4" />;
      case 'archived': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      case 'members_only': return <Eye className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'ministry': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'resource': return 'bg-orange-100 text-orange-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const groupedPages = pages.reduce((acc, page) => {
    if (!acc[page.status]) acc[page.status] = [];
    acc[page.status].push(page);
    return acc;
  }, {} as Record<string, Page[]>);

  const stats = {
    total: pages.length,
    published: groupedPages.published?.length || 0,
    drafts: groupedPages.draft?.length || 0,
    archived: groupedPages.archived?.length || 0
  };

  if (!can('content.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  if (loading) {
    return <AdminPageSkeleton label="pages" variant="table" columns={6} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Page Management</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">Dynamic Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage dynamic website pages</p>
        </div>
        {can('content.create') && (
          <Button onClick={openCreateDialog} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Page
          </Button>
        )}
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
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Published</span>
            </div>
            <p className="text-2xl font-bold">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Edit className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Drafts</span>
            </div>
            <p className="text-2xl font-bold">{stats.drafts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Archived</span>
            </div>
            <p className="text-2xl font-bold">{stats.archived}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="published" className="text-xs sm:text-sm">Published ({stats.published})</TabsTrigger>
          <TabsTrigger value="draft" className="text-xs sm:text-sm">Drafts ({stats.drafts})</TabsTrigger>
          <TabsTrigger value="archived" className="text-xs sm:text-sm">Archived ({stats.archived})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {pages.length === 0 ? (
            <p className="text-muted-foreground">No pages found</p>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{page.title}</p>
                            <p className="text-sm text-gray-500">/{page.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(page.category)}>
                            {page.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(page.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(page.status)}
                              {page.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getVisibilityIcon(page.visibility)}
                            <span className="text-sm capitalize">{page.visibility.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(page.lastModified).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openViewDialog(page)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {can('content.update') && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(page)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {page.status === 'draft' && (
                                  <Button variant="ghost" size="sm" onClick={() => handlePublish(page.id)}>
                                    <Save className="w-4 h-4 text-green-600" />
                                  </Button>
                                )}
                              </>
                            )}
                            {can('content.delete') && (
                              <Button variant="ghost" size="sm" onClick={() => setPageToDelete(page)}>
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

        {['published', 'draft', 'archived'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {groupedPages[status]?.length === 0 ? (
              <p className="text-muted-foreground">No {status} pages found</p>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedPages[status]?.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{page.title}</p>
                              <p className="text-sm text-gray-500">/{page.slug}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(page.category)}>
                              {page.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(page.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(page.status)}
                                {page.status}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getVisibilityIcon(page.visibility)}
                              <span className="text-sm capitalize">{page.visibility.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(page.lastModified).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openViewDialog(page)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {can('content.update') && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(page)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  {page.status === 'draft' && (
                                    <Button variant="ghost" size="sm" onClick={() => handlePublish(page.id)}>
                                      <Save className="w-4 h-4 text-green-600" />
                                    </Button>
                                  )}
                                </>
                              )}
                              {can('content.delete') && (
                                <Button variant="ghost" size="sm" onClick={() => setPageToDelete(page)}>
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
      <Dialog open={isDialogOpen} onOpenChange={(open) => !submitting && setIsDialogOpen(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
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
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Visibility</label>
                <Select value={formData.visibility} onValueChange={(value: 'public' | 'private' | 'members_only') => setFormData(prev => ({ ...prev, visibility: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="members_only">Members Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value: 'announcement' | 'ministry' | 'event' | 'resource' | 'other') => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="ministry">Ministry</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Excerpt (optional)</label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
                placeholder="Brief summary of the page content"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={12}
                required
                placeholder="Write your page content here..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Author</label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
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
                  ? (editingPage ? 'Updating Page...' : 'Creating Page...')
                  : (editingPage ? 'Update Page' : 'Create Page')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Page Dialog */}
      <Dialog open={!!viewingPage} onOpenChange={() => setViewingPage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Page Preview</DialogTitle>
          </DialogHeader>
          {viewingPage && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{viewingPage.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <Badge className={getCategoryColor(viewingPage.category)}>
                      {viewingPage.category}
                    </Badge>
                    <Badge className={getStatusColor(viewingPage.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(viewingPage.status)}
                        {viewingPage.status}
                      </div>
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getVisibilityIcon(viewingPage.visibility)}
                      <span className="capitalize">{viewingPage.visibility.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">/{viewingPage.slug}</p>
                </div>
                {viewingPage.status === 'published' && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live
                  </Button>
                )}
              </div>

              {viewingPage.excerpt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Excerpt</label>
                  <p className="mt-1 text-gray-700 italic">{viewingPage.excerpt}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Content</label>
                <div className="mt-2 p-4 bg-muted rounded-lg border">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">{viewingPage.content}</pre>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pt-4 border-t">
                <div>
                  <label className="font-medium text-gray-500">Author</label>
                  <p>{viewingPage.author}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Last Modified</label>
                  <p>{new Date(viewingPage.lastModified).toLocaleDateString()}</p>
                </div>
                {viewingPage.publishedDate && (
                  <div>
                    <label className="font-medium text-gray-500">Published</label>
                    <p>{new Date(viewingPage.publishedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={Boolean(pageToDelete)}
        onOpenChange={(open) => !open && !isDeleting && setPageToDelete(null)}
        title="Delete Page?"
        description={
          pageToDelete
            ? `Are you sure you want to delete "${pageToDelete.title}"? This action cannot be undone.`
            : 'Are you sure you want to delete this page?'
        }
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Page'}
        loading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminPagesPage;
