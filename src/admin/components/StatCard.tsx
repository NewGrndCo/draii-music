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
    <div className="admin-glass rounded-xl md:rounded-2xl p-3 md:p-5 relative overflow-hidden group">
      <div
        className="absolute -top-10 -right-10 h-24 w-24 md:h-32 md:w-32 rounded-full blur-3xl opacity-40 transition-opacity group-hover:opacity-60"
        style={{ background: c }}
      />
      <div className="flex items-start justify-between gap-2 relative">
        <div className="min-w-0">
          <div className="text-[10px] md:text-[11px] uppercase tracking-widest text-white/55 truncate">{label}</div>
          <div className="font-display text-lg md:text-3xl font-semibold mt-1 md:mt-2 leading-tight break-words">{value}</div>
          {hint && <div className="text-[11px] md:text-xs text-white/50 mt-1">{hint}</div>}
        </div>
        <div className="h-7 w-7 md:h-9 md:w-9 rounded-lg md:rounded-xl flex items-center justify-center shrink-0" style={{ background: `${c}22`, color: c }}>
          <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
