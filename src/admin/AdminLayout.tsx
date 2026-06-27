import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Music2, Disc3, Users, Tag, BarChart3, CalendarDays,
  ShoppingBag, Settings, LogOut, ShieldCheck, Database,
  ChevronLeft, Mail, DollarSign, Megaphone,
} from 'lucide-react';
import { ADMIN_TOKEN_KEY } from './lib/api';

interface Props {
  active: string;
  onChange: (key: string) => void;
  children: React.ReactNode;
}

const items = [
  { key: 'dashboard',   label: 'Dashboard',     icon: LayoutDashboard },
  { key: 'songs',       label: 'Songs',         icon: Music2 },
  { key: 'releases',    label: 'Releases',      icon: Disc3 },
  { key: 'artists',     label: 'Artists',       icon: Users },
  { key: 'genres',      label: 'Genres',        icon: Tag },
  { key: 'analytics',   label: 'Analytics',     icon: BarChart3 },
  { key: 'revenue',     label: 'Revenue',       icon: DollarSign },
  { key: 'campaigns',   label: 'Campaigns',     icon: Megaphone },
  { key: 'events',      label: 'Events',        icon: CalendarDays },
  { key: 'merch',       label: 'Merch',         icon: ShoppingBag },
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
      data-admin
      className="min-h-screen w-full text-white relative"
      style={{
        background: `radial-gradient(1200px 600px at 10% -10%, hsl(var(--admin-purple) / 0.22), transparent 60%),
                     radial-gradient(900px 600px at 110% 10%, hsl(var(--admin-blue) / 0.18), transparent 60%),
                     radial-gradient(800px 500px at 50% 110%, hsl(var(--admin-cyan) / 0.10), transparent 60%),
                     hsl(var(--admin-bg))`,
      }}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 admin-glass-strong m-3 rounded-2xl p-4 sticky top-3 h-[calc(100vh-1.5rem)]">
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="h-9 w-9 flex items-center justify-center">
              <img src="/lovable-uploads/5ae7ab3a-8c2b-4cbe-9d1d-322b4912ca63.png" alt="Draii" className="h-full w-full object-contain" />
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
        <main className="flex-1 min-w-0 p-2 sm:p-3 md:p-6">
          {/* Header */}
          <header className="admin-glass-strong rounded-xl md:rounded-2xl px-3 md:px-6 py-3 md:py-4 flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="md:hidden h-8 w-8 flex items-center justify-center shrink-0">
                <img src="/lovable-uploads/5ae7ab3a-8c2b-4cbe-9d1d-322b4912ca63.png" alt="Draii" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base md:text-2xl font-semibold leading-tight truncate">
                  <span className="admin-gradient-text">ArtistNode&nbsp;</span>
                  <span className="text-white/85 hidden sm:inline">&nbsp;Dashboard</span>
                </h1>
                <p className="text-[10px] md:text-xs text-white/50 mt-0.5 truncate">Manage every surface of draiirynell.com in real time.</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <StatusPill label="Database" ok icon={Database} />
              <StatusPill label="Stripe" ok={false} icon={ShieldCheck} />
            </div>
          </header>

          {/* Mobile tab bar */}
          <div className="md:hidden -mx-2 mb-3 sticky top-0 z-10 py-1 backdrop-blur-md">
            <div className="flex gap-1.5 px-2 overflow-x-auto scrollbar-hidden snap-x snap-mandatory">
              {items.map(({ key, label, icon: Icon }) => {
                const isActive = active === key;
                return (
                  <button
                    key={key}
                    onClick={() => onChange(key)}
                    aria-label={label}
                    title={label}
                    className={`shrink-0 snap-start flex flex-col items-center justify-center gap-0.5 w-[64px] h-[56px] rounded-xl active:scale-95 transition
                      ${isActive ? 'admin-gradient-bg text-white shadow-[0_0_18px_-6px_hsl(var(--admin-purple)/0.7)]' : 'admin-glass text-white/70'}`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="text-[10px] leading-none font-medium truncate max-w-[60px]">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
