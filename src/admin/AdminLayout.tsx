import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Library, BarChart3, CalendarDays,
  ShoppingBag, Settings, LogOut, ShieldCheck, Database,
  Music2, Wifi, ChevronLeft, Mail, DollarSign,
  Sparkles, Megaphone, Kanban,
} from 'lucide-react';
import { ADMIN_TOKEN_KEY } from './lib/api';

interface Props {
  active: string;
  onChange: (key: string) => void;
  children: React.ReactNode;
}

const items = [
  { key: 'dashboard',   label: 'Dashboard',     icon: LayoutDashboard },
  { key: 'library',     label: 'Library',       icon: Library },
  { key: 'analytics',   label: 'Analytics',     icon: BarChart3 },
  { key: 'predictive',  label: 'Predictive',    icon: Sparkles },
  { key: 'outreach',    label: 'Outreach',      icon: Megaphone },
  { key: 'planning',    label: 'Planning',      icon: Kanban },
  { key: 'events',      label: 'Events',        icon: CalendarDays },
  { key: 'merch',       label: 'Merch',         icon: ShoppingBag },
  { key: 'support',     label: 'Support Fund',  icon: DollarSign },
  { key: 'mailing',     label: 'Mailing',       icon: Mail },
  { key: 'settings',    label: 'Settings',      icon: Settings },
];

const StatusPill: React.FC<{ label: string; ok?: boolean; icon: React.ElementType }> = ({ label, ok = true, icon: Icon }) => (
  <div className="flex items-center gap-2 admin-glass rounded-full px-3 py-1.5 text-xs">
    <Icon className="h-3.5 w-3.5" style={{ color: ok ? 'hsl(var(--admin-success))' : 'hsl(var(--admin-warn))' }} />
    <span className="text-white/80">{label}</span>
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{ background: ok ? 'hsl(var(--admin-success))' : 'hsl(var(--admin-warn))', boxShadow: ok ? '0 0 8px hsl(var(--admin-success))' : '0 0 8px hsl(var(--admin-warn))' }}
    />
  </div>
);

const AdminLayout: React.FC<Props> = ({ active, onChange, children }) => {
  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    window.location.reload();
  };

  return (
    <div
      className="min-h-screen w-full text-white relative"
      style={{
        background: `radial-gradient(1200px 600px at 10% -10%, hsl(var(--admin-purple) / 0.18), transparent 60%),
                     radial-gradient(900px 600px at 110% 10%, hsl(var(--admin-blue) / 0.18), transparent 60%),
                     hsl(var(--admin-bg))`,
      }}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 admin-glass-strong m-3 rounded-2xl p-4 sticky top-3 h-[calc(100vh-1.5rem)]">
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="h-9 w-9 rounded-xl admin-gradient-bg flex items-center justify-center shadow-lg">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display font-semibold text-base leading-none">Draii Rynell</div>
              <div className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Admin</div>
            </div>
          </div>
          <nav className="mt-4 flex-1 space-y-1">
            {items.map(({ key, label, icon: Icon }) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                    ${isActive
                      ? 'admin-gradient-soft-bg text-white border border-white/10 shadow-[0_0_24px_-8px_hsl(var(--admin-purple)/0.6)]'
                      : 'text-white/65 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full admin-gradient-bg" />}
                </button>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-white/5 space-y-1">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/55 hover:text-white hover:bg-white/5"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to player
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/55 hover:text-white hover:bg-white/5"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 min-w-0 p-3 md:p-6">
          {/* Header */}
          <header className="admin-glass-strong rounded-2xl px-4 md:px-6 py-4 flex flex-wrap items-center gap-3 mb-6">
            <div className="flex-1 min-w-[200px]">
              <h1 className="font-display text-lg md:text-2xl font-semibold leading-tight">
                <span className="admin-gradient-text">DR Admin</span>
                <span className="text-white/85"> Control Center</span>
              </h1>
              <p className="text-xs text-white/50 mt-0.5">Manage every surface of draiirynell.com in real time.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label="Database" ok icon={Database} />
              <StatusPill label="Stripe" ok={false} icon={ShieldCheck} />
              <StatusPill label="Spotify API" ok={false} icon={Wifi} />
            </div>
          </header>

          {/* Mobile tab bar */}
          <div className="md:hidden -mx-1 mb-4 overflow-x-auto scrollbar-hidden">
            <div className="flex gap-2 px-1">
              {items.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => onChange(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs whitespace-nowrap
                    ${active === key ? 'admin-gradient-bg text-white' : 'admin-glass text-white/70'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
