import { useTriggers } from '../hooks/useTriggers';
import { useQueueMetrics } from '../hooks/useQueue';
import { Zap, CheckCircle, XCircle, Clock } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: triggers } = useTriggers(1, 100);
  const { data: queue } = useQueueMetrics();

  const active = triggers?.items.filter((t) => t.status === 'active').length ?? 0;
  const paused = triggers?.items.filter((t) => t.status === 'paused').length ?? 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Triggers" value={active} icon={Zap} color="bg-brand-600/20 text-brand-500" />
        <StatCard label="Paused Triggers" value={paused} icon={Clock} color="bg-yellow-600/20 text-yellow-400" />
        <StatCard label="Queue Completed" value={queue?.live.completed ?? 0} icon={CheckCircle} color="bg-green-600/20 text-green-400" />
        <StatCard label="Queue Failed" value={queue?.live.failed ?? 0} icon={XCircle} color="bg-red-600/20 text-red-400" />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold mb-3 text-gray-300">Queue Status</h2>
        {queue ? (
          <div className="grid grid-cols-3 gap-4 text-center">
            {Object.entries(queue.live).map(([k, v]) => (
              <div key={k} className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400 capitalize">{k}</p>
                <p className="text-xl font-bold">{v as number}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Loading queue metrics…</p>
        )}
      </div>
    </div>
  );
}
