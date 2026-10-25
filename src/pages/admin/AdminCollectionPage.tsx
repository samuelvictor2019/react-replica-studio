import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { adminRequest } from '@/lib/adminApi';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminOutletContext } from './AdminLayout';

type CollectionItem = {
  id: string;
  title?: string;
  status?: string;
  updatedAt?: string;
  [key: string]: any;
};

const coreCollections = ['events', 'media', 'new-members', 'testimonies', 'pages'];

const AdminCollectionPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const { collection = 'events' } = useParams();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [jsonInput, setJsonInput] = useState('{\n  "title": "",\n  "status": "draft"\n}');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState<'create' | 'update' | 'delete' | null>(null);

  const endpoint = useMemo(() => {
    return coreCollections.includes(collection) ? `/${collection}` : `/content/${collection}`;
  }, [collection]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminRequest<{ items: CollectionItem[] }>(`${endpoint}?pageSize=200`);
      setItems(res.items);
    } catch (e: any) {
      setError(e?.message || 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedId('');
    setJsonInput('{\n  "title": "",\n  "status": "draft"\n}');
    load();
  }, [endpoint]);

  const selected = items.find((item) => item.id === selectedId);

  useEffect(() => {
    if (selected) setJsonInput(JSON.stringify(selected, null, 2));
  }, [selectedId]);

  const createItem = async () => {
    if (submittingAction) return;
    setSubmittingAction('create');
    try {
      const payload = JSON.parse(jsonInput);
      await adminRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Create failed');
    } finally {
      setSubmittingAction(null);
    }
  };

  const updateItem = async () => {
    if (!selectedId || submittingAction) return;
    setSubmittingAction('update');
    try {
      const payload = JSON.parse(jsonInput);
      await adminRequest(`${endpoint}/${selectedId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Update failed');
    } finally {
      setSubmittingAction(null);
    }
  };

  const deleteItem = async () => {
    if (!selectedId || submittingAction) return;
    setSubmittingAction('delete');
    try {
      await adminRequest(`${endpoint}/${selectedId}`, { method: 'DELETE' });
      setSelectedId('');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    } finally {
      setSubmittingAction(null);
    }
  };

  if (!can('content.read')) {
    return <p className="text-sm text-red-600">You do not have permission to view content collections.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Content Management</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground capitalize mt-1">Manage {collection.replace('-', ' ')}</h1>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-white/90 p-4">
          <h2 className="font-semibold text-black mb-3">Records</h2>
          {loading ? (
            <div role="status" aria-label="Loading records" aria-busy="true" className="space-y-3 py-1">
              <span className="sr-only">Loading records</span>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-md border border-border p-3" aria-hidden="true">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${selectedId === item.id ? 'border-sky-300 bg-sky-50' : 'border-border hover:bg-slate-50'}`}
                >
                  <p className="font-medium text-sm text-black">{item.title || item.slug || item.id}</p>
                  <p className="text-xs text-muted-foreground">Status: {item.status || 'n/a'}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white/90 p-4 space-y-3">
          <h2 className="font-semibold text-black">JSON Editor</h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-[320px] rounded-lg border border-border p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-sky-200"
          />

          <div className="flex flex-wrap gap-2">
            {can('content.create') && (
              <button
                onClick={createItem}
                disabled={!!submittingAction}
                className="inline-flex items-center justify-center rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-sky-100 hover:text-black disabled:opacity-50"
              >
                {submittingAction === 'create' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </button>
            )}
            {can('content.update') && (
              <button
                onClick={updateItem}
                disabled={!selectedId || !!submittingAction}
                className="inline-flex items-center justify-center rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-sky-100 hover:text-black disabled:opacity-50"
              >
                {submittingAction === 'update' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Selected'
                )}
              </button>
            )}
            {can('content.delete') && (
              <button
                onClick={deleteItem}
                disabled={!selectedId || !!submittingAction}
                className="inline-flex items-center justify-center rounded-full border border-black px-4 py-2 text-sm text-black hover:bg-sky-100 disabled:opacity-50"
              >
                {submittingAction === 'delete' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Selected'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCollectionPage;
