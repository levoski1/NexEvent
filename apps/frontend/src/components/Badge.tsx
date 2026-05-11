import clsx from 'clsx';

const variants = {
  active: 'bg-green-900/50 text-green-400 border-green-700',
  paused: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
  error: 'bg-red-900/50 text-red-400 border-red-700',
  success: 'bg-green-900/50 text-green-400 border-green-700',
  failed: 'bg-red-900/50 text-red-400 border-red-700',
  pending: 'bg-gray-800 text-gray-400 border-gray-600',
  waiting: 'bg-blue-900/50 text-blue-400 border-blue-700',
};

type Variant = keyof typeof variants;

export function Badge({ label, variant }: { label: string; variant: Variant }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        variants[variant] ?? variants.pending,
      )}
    >
      {label}
    </span>
  );
}
