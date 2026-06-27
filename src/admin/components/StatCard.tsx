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
    <div className="admin-glass rounded-xl md:rounded-2xl p-3 md:p-5 relative overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_hsl(var(--admin-purple)/0.6)]">
      <div
        className="absolute -top-10 -right-10 h-24 w-24 md:h-32 md:w-32 rounded-full blur-3xl opacity-40 transition-opacity group-hover:opacity-70"
        style={{ background: c }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${c}, transparent)` }}
      />
      <div className="flex items-start justify-between gap-2 relative">
        <div className="min-w-0">
          <div className="admin-eyebrow truncate">{label}</div>
          <div className="font-display text-xl md:text-3xl font-semibold mt-1 md:mt-2 leading-tight break-words tracking-tight">{value}</div>
          {hint && <div className="text-[11px] md:text-xs text-white/55 mt-1">{hint}</div>}
        </div>
        <div
          className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 border"
          style={{ background: `${c}1f`, color: c, borderColor: `${c}33` }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
