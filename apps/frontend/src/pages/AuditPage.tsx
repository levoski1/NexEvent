import { useState } from 'react';
import { useAuditLogs } from '../hooks/useQueue';
import { Badge } from '../components/Badge';
import { formatDistanceToNow } from 'date-fns';

export function AuditPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogs(page);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Audit Log</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Resource</th>
                <th className="text-left px-4 py-3">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.items.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={log.action}
                      variant={log.action.includes('failed') ? 'error' : log.action.includes('deleted') ? 'error' : 'active'}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 truncate max-w-[200px]">
                    {log.resourceId}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 truncate max-w-[120px]">
                    {log.integrityHash.slice(0, 12)}…
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
