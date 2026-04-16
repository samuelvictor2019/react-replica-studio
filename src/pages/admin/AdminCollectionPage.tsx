import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { adminRequest } from '@/lib/adminApi';
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
  const [loading, setLoading] = useState(false);

  const endpoint = useMemo(() => {
    return coreCollections.includes(collection) ? `/api/admin/${collection}` : `/api/admin/content/${collection}`;
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
    try {
      const payload = JSON.parse(jsonInput);
      await adminRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Create failed');
    }
  };

  const updateItem = async () => {
    if (!selectedId) return;
    try {
      const payload = JSON.parse(jsonInput);
      await adminRequest(`${endpoint}/${selectedId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Update failed');
    }
  };

  const deleteItem = async () => {
    if (!selectedId) return;
    try {
      await adminRequest(`${endpoint}/${selectedId}`, { method: 'DELETE' });
      setSelectedId('');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  };

  if (!can('content.read')) {
    return <p className="text-sm text-red-600">You do not have permission to view content collections.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-black/40">Content Management</p>
        <h1 className="font-body text-3xl text-black capitalize mt-1">Manage {collection.replace('-', ' ')}</h1>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-white/90 p-4">
          <h2 className="font-semibold text-black mb-3">Records</h2>
          {loading ? (
            <p className="text-black/60 text-sm">Loading...</p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${selectedId === item.id ? 'border-sky-300 bg-sky-50' : 'border-border hover:bg-slate-50'}`}
                >
                  <p className="font-medium text-sm text-black">{item.title || item.slug || item.id}</p>
                  <p className="text-xs text-black/60">Status: {item.status || 'n/a'}</p>
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
              <button onClick={createItem} className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-sky-100 hover:text-black">
                Create
              </button>
            )}
            {can('content.update') && (
              <button onClick={updateItem} disabled={!selectedId} className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-sky-100 hover:text-black disabled:opacity-50">
                Update Selected
              </button>
            )}
            {can('content.delete') && (
              <button onClick={deleteItem} disabled={!selectedId} className="rounded-full border border-black px-4 py-2 text-sm text-black hover:bg-sky-100 disabled:opacity-50">
                Delete Selected
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCollectionPage;
