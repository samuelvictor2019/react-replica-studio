import { useState, useRef } from 'react';
import { Upload, Trash2, Copy, Check, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useUploadedImages } from '@/hooks/useUploadedImages';
import { adminRequest } from '@/lib/adminApi';

export default function AdminImageLibrary() {
  const { items, loading, error, hasMore, loadMore, refresh } = useUploadedImages({ folder: 'wgc', pageSize: 20 });
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageTitle, setImageTitle] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setImageTitle(nameWithoutExt);
    setSelectedFile(file);
    setIsUploadDialogOpen(true);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folder', 'wgc');
    formData.append('title', imageTitle);

    setUploading(true);
    try {
      const token = localStorage.getItem('wgc_admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/uploads/image`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }
      
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setImageTitle('');
      refresh();
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await adminRequest(`/uploads/${encodeURIComponent(id)}`, { method: 'DELETE' });
      refresh();
    } catch (err) {
      console.error('Failed to delete image', err);
      alert('Failed to delete image. It might not be supported by the backend.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Image Library</h2>
          <p className="text-sm text-muted-foreground">Upload and manage images used across the site</p>
        </div>
        <Button onClick={handleUploadClick} disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">{error}</p>}

      {items.length === 0 && !loading && !error && (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30">
          <Upload className="w-8 h-8 mx-auto mb-3 opacity-20" />
          <p>No images uploaded yet.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((img) => (
          <Card key={img.id} className="overflow-hidden group hover:shadow-md transition-shadow">
            <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
              <img 
                src={img.url.replace('/upload/', '/upload/c_fill,w_300,h_300,q_auto,f_auto/')} 
                alt={img.name} 
                className="object-cover w-full h-full"
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => copyToClipboard(img.url, img.id)} title="Copy URL">
                  {copiedId === img.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => window.open(img.url, '_blank')} title="Open Full Image">
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteImage(img.id)} title="Delete Image">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-2.5">
              <p className="text-xs font-medium truncate" title={img.name}>{img.name}</p>
              {img.width && img.height && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{img.width} × {img.height}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center py-6">
          <Button variant="outline" onClick={() => loadMore()}>Load More Images</Button>
        </div>
      )}

      <Dialog open={isUploadDialogOpen} onOpenChange={(open) => !uploading && setIsUploadDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Image Title</label>
              <Input 
                value={imageTitle} 
                onChange={(e) => setImageTitle(e.target.value)} 
                placeholder="Enter a title for this image"
                required
                autoFocus
              />
            </div>
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected file: {selectedFile.name}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
