import React, { useEffect, useMemo, useState } from 'react';
import { adminList, adminDelete, adminUpdate } from '@/admin/lib/api';
import { Mail, Trash2, MapPin, Search, Download, Lock, BellRing } from 'lucide-react';
import { toast } from 'sonner';

interface Entry {
  id: string;
  email: string;
  phone: string | null;
  ip_address: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  user_agent: string | null;
  created_at: string;
}

const MailingList: React.FC = () => {
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [modalEnabled, setModalEnabled] = useState(true);
  const [required, setRequired] = useState(false);
  const [savingFlag, setSavingFlag] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [data, profiles] = await Promise.all([
        adminList<Entry>('mailing_list'),
        adminList<any>('artist_profile'),
      ]);
      setRows(data || []);
      const p = profiles?.[0];
      if (p) {
        setProfileId(p.id);
        setModalEnabled(p.mailing_modal_enabled ?? true);
        setRequired(p.mailing_required ?? false);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateFlag = async (key: 'mailing_modal_enabled' | 'mailing_required', value: boolean) => {
    if (!profileId) return;
    const prev = key === 'mailing_modal_enabled' ? modalEnabled : required;
    if (key === 'mailing_modal_enabled') setModalEnabled(value); else setRequired(value);
    setSavingFlag(key);
    try {
      await adminUpdate('artist_profile', profileId, { [key]: value });
      toast.success('Setting saved');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
      if (key === 'mailing_modal_enabled') setModalEnabled(prev); else setRequired(prev);
    } finally {
      setSavingFlag(null);
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      [r.email, r.phone, r.country, r.city, r.region, r.ip_address]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(s))
    );
  }, [rows, q]);

  const remove = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    try {
      await adminDelete('mailing_list', id);
      setRows(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    }
  };

  const exportCsv = () => {
    const head = ['email','phone','country','region','city','ip_address','created_at'];
    const lines = [head.join(',')].concat(
      filtered.map(r => head.map(k => {
        const v = (r as any)[k] ?? '';
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      }).join(','))
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mailing-list-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="admin-glass-strong rounded-2xl p-5 flex flex-wrap items-center gap-3">
        <div className="h-10 w-10 rounded-xl admin-gradient-bg flex items-center justify-center">
          <Mail className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h2 className="font-display text-lg font-semibold">Mailing List</h2>
          <p className="text-xs text-white/50">{rows.length} subscriber{rows.length === 1 ? '' : 's'} · IP & location captured on signup</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search email, country…"
            className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
          />
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="admin-glass-strong rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
        <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07]">
          <BellRing className="h-4 w-4 text-pink-400 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Show signup popup</span>
              <input
                type="checkbox"
                checked={modalEnabled}
                disabled={!profileId || savingFlag === 'mailing_modal_enabled'}
                onChange={(e) => updateFlag('mailing_modal_enabled', e.target.checked)}
                className="h-4 w-4 accent-pink-500"
              />
            </div>
            <p className="text-xs text-white/50 mt-1">Display the mailing list popup to new visitors.</p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07]">
          <Lock className="h-4 w-4 text-purple-400 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Require signup to listen</span>
              <input
                type="checkbox"
                checked={required}
                disabled={!profileId || savingFlag === 'mailing_required'}
                onChange={(e) => updateFlag('mailing_required', e.target.checked)}
                className="h-4 w-4 accent-purple-500"
              />
            </div>
            <p className="text-xs text-white/50 mt-1">Visitors must enter their info before audio plays.</p>
          </div>
        </label>
      </div>

      <div className="admin-glass-strong rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-white/50">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-white/50">No subscribers yet.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white/90">{r.email}</td>
                  <td className="px-4 py-3 text-white/70">{r.phone || '—'}</td>
                  <td className="px-4 py-3 text-white/70">
                    {(r.city || r.region || r.country) ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-white/40" />
                        {[r.city, r.region, r.country].filter(Boolean).join(', ')}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-white/60 font-mono text-xs">{r.ip_address || '—'}</td>
                  <td className="px-4 py-3 text-white/60 text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MailingList;
