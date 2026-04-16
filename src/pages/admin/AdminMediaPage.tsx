import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Play, Image as ImageIcon, Youtube, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { adminRequest } from '@/lib/adminApi';

type MediaItem = {
  id: string;
  title: string;
  author?: string;
  type: 'youtube' | 'image' | 'video';
  url: string;
  thumbnail?: string;
  category: 'sermons' | 'worship' | 'announcements' | 'other';
  description?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'wgc_admin_media';

const AdminMediaPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    type: 'youtube' as 'youtube' | 'image' | 'video',
    url: '',
    thumbnail: '',
    category: 'sermons' as 'sermons' | 'worship' | 'announcements' | 'other',
    description: ''
  });

  // Load media from localStorage (no API for media)
  useEffect(() => {
    const loadMedia = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setMedia(JSON.parse(stored));
        } catch {
          setMedia([]);
        }
      }
    };

    loadMedia();
  }, []);

  // Save media to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(media));
  }, [media]);

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      type: 'youtube',
      url: '',
      thumbnail: '',
      category: 'sermons',
      description: ''
    });
    setEditingMedia(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: MediaItem) => {
    setFormData({
      title: item.title,
      author: item.author || '',
      type: item.type,
      url: item.url,
      thumbnail: item.thumbnail || '',
      category: item.category,
      description: item.description || ''
    });
    setEditingMedia(item);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    // Media is stored locally (no API available)
    if (editingMedia) {
      setMedia(prev => prev.map(item =>
        item.id === editingMedia.id
          ? { ...item, ...formData, updatedAt: now }
          : item
      ));
    } else {
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        ...formData,
        createdAt: now,
        updatedAt: now
      };
      setMedia(prev => [...prev, newMedia]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;

    // Media is stored locally (no API available)
    setMedia(prev => prev.filter(item => item.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube className="w-4 h-4 text-red-600" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-green-600" />;
      case 'video': return <Play className="w-4 h-4 text-blue-600" />;
      default: return <Upload className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sermons': return 'bg-purple-100 text-purple-800';
      case 'worship': return 'bg-blue-100 text-blue-800';
      case 'announcements': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedMedia = media.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MediaItem[]>);

  if (!can('content.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-black/40">Media Management</p>
          <h1 className="font-body text-2xl sm:text-3xl text-black mt-1">Church Media Library</h1>
          <p className="text-sm text-black/70 mt-1">Manage sermons, worship content, and announcements</p>
        </div>
        {can('content.create') && (
          <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Media
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All ({media.length})</TabsTrigger>
          <TabsTrigger value="sermons" className="text-xs sm:text-sm">Sermons ({groupedMedia.sermons?.length || 0})</TabsTrigger>
          <TabsTrigger value="worship" className="text-xs sm:text-sm">Worship ({groupedMedia.worship?.length || 0})</TabsTrigger>
          <TabsTrigger value="announcements" className="text-xs sm:text-sm">Announcements ({groupedMedia.announcements?.length || 0})</TabsTrigger>
          <TabsTrigger value="other" className="text-xs sm:text-sm">Other ({groupedMedia.other?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {media.length === 0 ? (
            <p className="text-black/60">No media items found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => window.open(item.url, '_blank')}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        {can('content.update') && (
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {can('content.delete') && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                    {item.author && (
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{item.author}</p>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Added {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {['sermons', 'worship', 'announcements', 'other'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {groupedMedia[category]?.length === 0 ? (
              <p className="text-black/60">No {category} found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedMedia[category]?.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => window.open(item.url, '_blank')}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {can('content.update') && (
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {can('content.delete') && (
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                      {item.author && (
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{item.author}</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMedia ? 'Edit Media' : 'Add New Media'}</DialogTitle>
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
                <label className="text-sm font-medium">Author / Preacher / Singer</label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="e.g. Apostle Adebowale Adesina"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value: 'youtube' | 'image' | 'video') => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">URL</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder={formData.type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://example.com/file.mp4'}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value: 'sermons' | 'worship' | 'announcements' | 'other') => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sermons">Sermons</SelectItem>
                    <SelectItem value="worship">Worship</SelectItem>
                    <SelectItem value="announcements">Announcements</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Thumbnail URL (optional)</label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the media content"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                {editingMedia ? 'Update Media' : 'Add Media'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMediaPage;