import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, ListChecks, ScrollText, Settings, Menu } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import clsx from 'clsx';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/triggers', label: 'Triggers', icon: Zap },
  { to: '/queue', label: 'Queue', icon: ListChecks },
  { to: '/audit', label: 'Audit Log', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={clsx(
        'flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-200',
        sidebarOpen ? 'w-56' : 'w-14',
      )}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
        <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
          <Menu size={20} />
        </button>
        {sidebarOpen && (
          <span className="font-bold text-brand-500 text-lg tracking-tight">NexEvent</span>
        )}
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )
            }
          >
            <Icon size={18} />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
