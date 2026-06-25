import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Clock } from 'lucide-react';

interface Props {
  listens: { created_at?: string }[];
}

type Range = '24h' | '7d' | '30d';

const RANGE_CONFIG: Record<Range, { hours: number; bucketHours: number; label: (d: Date) => string }> = {
  '24h': { hours: 24, bucketHours: 1, label: (d) => `${d.getHours().toString().padStart(2, '0')}:00` },
  '7d':  { hours: 24 * 7, bucketHours: 6, label: (d) => `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}h` },
  '30d': { hours: 24 * 30, bucketHours: 24, label: (d) => `${d.getMonth() + 1}/${d.getDate()}` },
};

const RecentListensChart: React.FC<Props> = ({ listens }) => {
  const [range, setRange] = useState<Range>('24h');

  const { data, total } = useMemo(() => {
    const cfg = RANGE_CONFIG[range];
    const now = new Date();
    const start = new Date(now.getTime() - cfg.hours * 3600_000);
    const bucketMs = cfg.bucketHours * 3600_000;
    const buckets: { t: number; label: string; count: number }[] = [];
    const startBucket = Math.floor(start.getTime() / bucketMs) * bucketMs;
    for (let t = startBucket; t <= now.getTime(); t += bucketMs) {
      buckets.push({ t, label: cfg.label(new Date(t)), count: 0 });
    }
    let total = 0;
    listens.forEach((l) => {
      if (!l.created_at) return;
      const ts = new Date(l.created_at).getTime();
      if (ts < start.getTime()) return;
      const idx = Math.floor((ts - startBucket) / bucketMs);
      if (idx >= 0 && idx < buckets.length) {
        buckets[idx].count++;
        total++;
      }
    });
    return { data: buckets, total };
  }, [listens, range]);

  return (
    <div className="admin-glass rounded-2xl p-3 md:p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-display text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-300" />
          Recent listens
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/55">
            <span className="text-white/90 font-medium">{total.toLocaleString()}</span> plays in window
          </span>
          <div className="flex bg-white/[0.04] rounded-lg p-0.5 text-xs">
            {(['24h', '7d', '30d'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-md transition ${range === r ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer>
          <BarChart data={data} barCategoryGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
              interval={Math.max(0, Math.floor(data.length / 12) - 1)}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: 'rgba(15,15,30,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--admin-purple))" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(RecentListensChart);
