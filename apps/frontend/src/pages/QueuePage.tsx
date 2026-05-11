import { useQueueMetrics } from '../hooks/useQueue';
import { Badge } from '../components/Badge';
import { formatDistanceToNow } from 'date-fns';

export function QueuePage() {
  const { data, isLoading } = useQueueMetrics();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Queue Monitor</h1>
      <p className="text-gray-500 text-sm">Auto-refreshes every 5 seconds</p>

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {data && Object.entries(data.live).map(([k, v]) => (
              <div key={k} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 capitalize mb-1">{k}</p>
                <p className="text-3xl font-bold">{v as number}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="font-semibold text-gray-300">Metric History</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  <th className="text-left px-4 py-2">Time</th>
                  <th className="text-left px-4 py-2">Waiting</th>
                  <th className="text-left px-4 py-2">Active</th>
                  <th className="text-left px-4 py-2">Completed</th>
                  <th className="text-left px-4 py-2">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {(data?.history as Array<Record<string, unknown>>)?.slice(0, 20).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-800/50">
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {formatDistanceToNow(new Date(row.createdAt as string), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-2">{row.waiting as number}</td>
                    <td className="px-4 py-2">{row.active as number}</td>
                    <td className="px-4 py-2 text-green-400">{row.completed as number}</td>
                    <td className="px-4 py-2 text-red-400">{row.failed as number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
