import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pause, Play, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTriggers, useDeleteTrigger, usePauseTrigger, useResumeTrigger } from '../hooks/useTriggers';
import { Badge } from '../components/Badge';
import type { TriggerStatus } from '@nexevent/shared-types';

export function TriggersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTriggers(page);
  const deleteTrigger = useDeleteTrigger();
  const pauseTrigger = usePauseTrigger();
  const resumeTrigger = useResumeTrigger();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this trigger?')) return;
    await toast.promise(deleteTrigger.mutateAsync(id), {
      loading: 'Deleting…',
      success: 'Trigger deleted',
      error: (e) => e.message,
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Triggers</h1>
        <Link
          to="/triggers/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> New Trigger
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Contract</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.items.map((t) => (
                <tr key={t.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/triggers/${t.id}`} className="hover:text-brand-500">{t.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{t.actionType}</td>
                  <td className="px-4 py-3">
                    <Badge label={t.status} variant={t.status as TriggerStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs truncate max-w-[160px]">
                    {t.filter.contractId ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {t.status === 'active' ? (
                        <button onClick={() => pauseTrigger.mutate(t.id)} className="text-yellow-400 hover:text-yellow-300">
                          <Pause size={16} />
                        </button>
                      ) : (
                        <button onClick={() => resumeTrigger.mutate(t.id)} className="text-green-400 hover:text-green-300">
                          <Play size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex gap-2 justify-end">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 bg-gray-800 rounded disabled:opacity-40">Prev</button>
          <span className="px-3 py-1 text-gray-400">{page} / {data.totalPages}</span>
          <button disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-gray-800 rounded disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
