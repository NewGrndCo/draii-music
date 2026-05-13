import React from 'react';

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ElementType;
  accent?: 'purple' | 'blue' | 'pink';
}

const colorFor = (a: Props['accent']) => {
  switch (a) {
    case 'blue': return 'hsl(var(--admin-blue))';
    case 'pink': return 'hsl(var(--admin-pink))';
    default: return 'hsl(var(--admin-purple))';
  }
};

const StatCard: React.FC<Props> = ({ label, value, hint, icon: Icon, accent = 'purple' }) => {
  const c = colorFor(accent);
  return (
    <div className="admin-glass rounded-2xl p-4 md:p-5 relative overflow-hidden group">
      <div
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-40 transition-opacity group-hover:opacity-60"
        style={{ background: c }}
      />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/55">{label}</div>
          <div className="font-display text-2xl md:text-3xl font-semibold mt-2">{value}</div>
          {hint && <div className="text-xs text-white/50 mt-1">{hint}</div>}
        </div>
        <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: `${c}22`, color: c }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
