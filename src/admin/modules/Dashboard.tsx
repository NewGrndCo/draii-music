import React, { useEffect, useState } from 'react';
import { adminStats } from '../lib/api';
import StatCard from '../components/StatCard';
import { Music2, Heart, PlayCircle, DollarSign, CalendarDays, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof adminStats>> | null>(null);

  useEffect(() => {
    adminStats()
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-glass rounded-2xl p-12 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-white/50" />
      </div>
    );
  }
  if (!data) return null;

  const totalPlays = data.songs.reduce((s, x: any) => s + (x.play_count || 0), 0);
  const totalLikes = data.songs.reduce((s, x: any) => s + (x.likes_count || 0), 0);
  const supportFund = data.songs.reduce((s, x: any) => s + (x.support_fund_cents || 0), 0)
                    + data.donations.reduce((s, x: any) => s + (x.amount_cents || 0), 0);
  const upcomingEvents = data.events.filter((e: any) =>
    e.status === 'active' && new Date(e.event_date) >= new Date(new Date().toDateString())
  ).length;
  const activeMerch = data.merch.filter((m: any) => m.active).length;
  const recentListens = data.listens.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
      <StatCard label="Songs"          value={data.songs.length} icon={Music2} />
      <StatCard label="Total Plays"    value={totalPlays.toLocaleString()} icon={PlayCircle} accent="blue" />
      <StatCard label="Total Likes"    value={totalLikes.toLocaleString()} icon={Heart} accent="pink" />
      <StatCard label="Support Fund"   value={`$${(supportFund / 100).toFixed(2)}`} icon={DollarSign} accent="purple" />
      <StatCard label="Upcoming Shows" value={upcomingEvents} icon={CalendarDays} accent="blue" />
      <StatCard label="Active Merch"   value={activeMerch} icon={ShoppingBag} accent="pink" />

      <div className="col-span-2 lg:col-span-3 xl:col-span-6 admin-glass rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold">Recent listens</h3>
          <span className="text-xs text-white/50">{recentListens.toLocaleString()} captured</span>
        </div>
        <ListensSpark listens={data.listens} />
      </div>
    </div>
  );
};

const ListensSpark: React.FC<{ listens: any[] }> = ({ listens }) => {
  // Bucket by hour for last 24h
  const now = Date.now();
  const buckets = new Array(24).fill(0);
  listens.forEach((l) => {
    const t = new Date(l.created_at).getTime();
    const hoursAgo = Math.floor((now - t) / 3.6e6);
    if (hoursAgo >= 0 && hoursAgo < 24) buckets[23 - hoursAgo]++;
  });
  const max = Math.max(1, ...buckets);
  return (
    <div className="flex items-end gap-1 h-24">
      {buckets.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md transition-all"
          style={{
            height: `${(v / max) * 100}%`,
            background: 'var(--admin-gradient)',
            opacity: 0.4 + (v / max) * 0.6,
          }}
          title={`${v} plays`}
        />
      ))}
    </div>
  );
};

export default Dashboard;
