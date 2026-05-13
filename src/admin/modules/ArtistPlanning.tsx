import React, { useEffect, useMemo, useState } from 'react';
import { adminCall, adminInsert, adminUpdate, adminDelete, adminStats } from '../lib/api';
import { Loader2, Plus, Trash2, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

type Stats = Awaited<ReturnType<typeof adminStats>>;

const STATUSES = [
  { id: 'recording',    label: 'Recording',    accent: 'from-purple-500/30 to-purple-500/5' },
  { id: 'mixing',       label: 'Mixing',       accent: 'from-pink-500/30 to-pink-500/5' },
  { id: 'distribution', label: 'Distribution', accent: 'from-blue-500/30 to-blue-500/5' },
  { id: 'promo',        label: 'Promo',        accent: 'from-amber-500/30 to-amber-500/5' },
  { id: 'released',     label: 'Released',     accent: 'from-emerald-500/30 to-emerald-500/5' },
] as const;

const monthKey = (d: string) => d.slice(0, 7);

const ArtistPlanning: React.FC = () => {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newRelease, setNewRelease] = useState({ title: '', target_date: '' });
  const [newExpense, setNewExpense] = useState({ label: '', amount: '', category: 'production', occurred_at: new Date().toISOString().slice(0, 10) });

  const reload = async () => {
    try {
      const d = await adminStats();
      setData(d);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const moveRelease = async (id: string, status: string) => {
    try {
      await adminUpdate('releases', id, { status });
      await reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const addRelease = async () => {
    if (!newRelease.title.trim()) return;
    try {
      await adminInsert('releases', { title: newRelease.title.trim(), target_date: newRelease.target_date || null, status: 'recording' });
      setNewRelease({ title: '', target_date: '' });
      await reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const removeRelease = async (id: string) => {
    if (!confirm('Delete this release?')) return;
    try { await adminDelete('releases', id); await reload(); } catch (e: any) { toast.error(e.message); }
  };

  const addExpense = async () => {
    const cents = Math.round(parseFloat(newExpense.amount || '0') * 100);
    if (!newExpense.label.trim() || !cents) return;
    try {
      await adminInsert('expenses', {
        label: newExpense.label.trim(),
        amount_cents: cents,
        category: newExpense.category,
        occurred_at: newExpense.occurred_at,
      });
      setNewExpense({ label: '', amount: '', category: 'production', occurred_at: new Date().toISOString().slice(0, 10) });
      await reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const removeExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try { await adminDelete('expenses', id); await reload(); } catch (e: any) { toast.error(e.message); }
  };

  // Revenue tracker math
  const revenue = useMemo(() => {
    if (!data) return { totalDonations: 0, totalSupportFund: 0, totalExpenses: 0, net: 0, monthly: [] as any[] };
    const totalDonations = data.donations.reduce((s: number, d: any) => s + (d.amount_cents || 0), 0);
    const totalSupportFund = data.songs.reduce((s: number, x: any) => s + (x.support_fund_cents || 0), 0);
    const totalExpenses = data.expenses.reduce((s: number, e: any) => s + (e.amount_cents || 0), 0);
    const net = totalDonations + totalSupportFund - totalExpenses;

    const months: Record<string, { month: string; income: number; expense: number }> = {};
    const ensure = (k: string) => (months[k] ??= { month: k, income: 0, expense: 0 });
    data.donations.forEach((d: any) => { ensure(monthKey(d.created_at)).income += (d.amount_cents || 0) / 100; });
    data.expenses.forEach((e: any) => { ensure(monthKey(e.occurred_at)).expense += (e.amount_cents || 0) / 100; });
    const monthly = Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
    return { totalDonations, totalSupportFund, totalExpenses, net, monthly };
  }, [data]);

  if (loading) return <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>;
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Release timeline planner */}
      <section className="admin-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="h-4 w-4 text-purple-300" />
          <h3 className="font-display text-base font-semibold">Release Timeline Planner</h3>
        </div>
        <p className="text-xs text-white/50 mb-4">Drag — well, click — releases through each stage from Recording to Released.</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={newRelease.title}
            onChange={(e) => setNewRelease({ ...newRelease, title: e.target.value })}
            placeholder="New release title"
            className="flex-1 min-w-[200px] bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-purple-300/50"
          />
          <input
            type="date"
            value={newRelease.target_date}
            onChange={(e) => setNewRelease({ ...newRelease, target_date: e.target.value })}
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-300/50"
          />
          <button
            onClick={addRelease}
            className="px-4 py-2 rounded-lg admin-gradient-bg text-sm font-medium text-white flex items-center gap-1.5 hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {STATUSES.map((s) => {
            const items = data.releases.filter((r: any) => r.status === s.id);
            return (
              <div key={s.id} className={`rounded-xl bg-gradient-to-b ${s.accent} border border-white/5 p-3 min-h-[200px]`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-widest text-white/65 font-semibold">{s.label}</div>
                  <span className="text-[10px] text-white/45">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 && (
                    <div className="text-[11px] text-white/35 text-center py-4">Empty</div>
                  )}
                  {items.map((r: any) => {
                    const idx = STATUSES.findIndex((x) => x.id === s.id);
                    return (
                      <div key={r.id} className="rounded-lg bg-black/40 border border-white/10 p-2 group">
                        <div className="text-sm text-white truncate">{r.title}</div>
                        {r.target_date && (
                          <div className="text-[10px] text-white/50 mt-0.5">Target {r.target_date}</div>
                        )}
                        <div className="flex items-center gap-1 mt-2">
                          {idx > 0 && (
                            <button
                              onClick={() => moveRelease(r.id, STATUSES[idx - 1].id)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-white/70"
                              title="Move back"
                            >←</button>
                          )}
                          {idx < STATUSES.length - 1 && (
                            <button
                              onClick={() => moveRelease(r.id, STATUSES[idx + 1].id)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-white/70"
                              title="Advance"
                            >→</button>
                          )}
                          <button
                            onClick={() => removeRelease(r.id)}
                            className="ml-auto text-[10px] p-1 rounded text-white/45 hover:text-pink-300 opacity-0 group-hover:opacity-100 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Revenue tracker */}
      <section className="admin-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-4 w-4 text-purple-300" />
          <h3 className="font-display text-base font-semibold">Revenue Tracker</h3>
        </div>
        <p className="text-xs text-white/50 mb-4">Income from donations &amp; support fund vs production expenses.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl bg-white/[0.04] border border-white/5 p-3">
            <div className="text-[10px] uppercase tracking-widest text-white/45">Donations</div>
            <div className="text-2xl font-display admin-gradient-text mt-1">${(revenue.totalDonations / 100).toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/5 p-3">
            <div className="text-[10px] uppercase tracking-widest text-white/45">Support fund</div>
            <div className="text-2xl font-display text-white mt-1">${(revenue.totalSupportFund / 100).toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/5 p-3">
            <div className="text-[10px] uppercase tracking-widest text-white/45">Expenses</div>
            <div className="text-2xl font-display text-pink-300 mt-1">${(revenue.totalExpenses / 100).toFixed(2)}</div>
          </div>
          <div className={`rounded-xl bg-white/[0.04] border p-3 ${revenue.net >= 0 ? 'border-emerald-500/20' : 'border-pink-500/20'}`}>
            <div className="text-[10px] uppercase tracking-widest text-white/45 flex items-center gap-1">
              {revenue.net >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-300" /> : <TrendingDown className="h-3 w-3 text-pink-300" />}
              Net
            </div>
            <div className={`text-2xl font-display mt-1 ${revenue.net >= 0 ? 'text-emerald-300' : 'text-pink-300'}`}>
              ${(revenue.net / 100).toFixed(2)}
            </div>
          </div>
        </div>

        {revenue.monthly.length > 0 && (
          <div className="h-56 mb-5">
            <ResponsiveContainer>
              <BarChart data={revenue.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(15,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }} />
                <Bar dataKey="income" fill="hsl(var(--admin-purple))" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(var(--admin-pink))" name="Expense" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Add expense */}
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 mb-3">
          <div className="text-[10px] uppercase tracking-widest text-white/55 mb-2">Log a new expense</div>
          <div className="flex flex-wrap gap-2">
            <input
              value={newExpense.label}
              onChange={(e) => setNewExpense({ ...newExpense, label: e.target.value })}
              placeholder="Label (Studio session, mix engineer…)"
              className="flex-1 min-w-[200px] bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-purple-300/50"
            />
            <input
              type="number"
              step="0.01"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              placeholder="USD"
              className="w-28 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-purple-300/50"
            />
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-300/50"
            >
              <option value="production">Production</option>
              <option value="mixing">Mixing/Master</option>
              <option value="promo">Promo</option>
              <option value="merch">Merch</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
            <input
              type="date"
              value={newExpense.occurred_at}
              onChange={(e) => setNewExpense({ ...newExpense, occurred_at: e.target.value })}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-300/50"
            />
            <button
              onClick={addExpense}
              className="px-4 py-2 rounded-lg admin-gradient-bg text-sm font-medium text-white flex items-center gap-1.5 hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Log
            </button>
          </div>
        </div>

        {/* Expense list */}
        {data.expenses.length === 0 ? (
          <div className="text-sm text-white/45 py-4 text-center">No expenses logged yet.</div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-white/45">
                  <th className="text-left px-2 py-2">Date</th>
                  <th className="text-left px-2 py-2">Label</th>
                  <th className="text-left px-2 py-2">Category</th>
                  <th className="text-right px-2 py-2">Amount</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.map((e: any) => (
                  <tr key={e.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                    <td className="px-2 py-2 text-white/65 text-xs tabular-nums">{e.occurred_at}</td>
                    <td className="px-2 py-2 text-white">{e.label}</td>
                    <td className="px-2 py-2 text-white/55 text-xs capitalize">{e.category}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-pink-300">${(e.amount_cents / 100).toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">
                      <button onClick={() => removeExpense(e.id)} className="text-white/35 hover:text-pink-300">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ArtistPlanning;
