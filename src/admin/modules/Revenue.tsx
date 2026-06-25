import React, { useEffect, useMemo, useState } from 'react';
import { adminInsert, adminDelete, adminStats } from '../lib/api';
import SupportFund from './SupportFund';
import { Loader2, Plus, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

type Stats = Awaited<ReturnType<typeof adminStats>>;

const monthKey = (d: string) => (d || '').slice(0, 7);

const Revenue: React.FC = () => {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    label: '',
    amount: '',
    category: 'production',
    occurred_at: new Date().toISOString().slice(0, 10),
  });

  const reload = async () => {
    try { setData(await adminStats()); } catch (e: any) { toast.error(e.message); }
  };

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

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
      <SupportFund />

      <section className="admin-glass rounded-2xl p-3 md:p-5">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-4 w-4 text-purple-300" />
          <h3 className="font-display text-base font-semibold">Revenue Tracker</h3>
        </div>
        <p className="text-xs text-white/50 mb-4">Donations &amp; support fund income vs. production expenses.</p>

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

export default Revenue;
