import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import {
  Megaphone, Plus, Trash2, Copy, Download, RefreshCw, ExternalLink,
  QrCode, Radio, BarChart3, ArrowLeft, Search,
} from 'lucide-react';
import {
  Campaign, CampaignEvent, CAMPAIGN_TYPES, DESTINATION_KINDS,
  campaignUrl, createCampaign, deleteCampaign, listCampaignEvents,
  listCampaigns, updateCampaign, generateCode,
} from '../lib/campaignsApi';
import { adminList } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Tab = 'dashboard' | 'list' | 'create' | 'analytics';

const TYPE_LABELS: Record<string, string> = {
  poster: 'Poster', flyer: 'Flyer', billboard: 'Billboard',
  business_card: 'Business Card', sticker: 'Sticker',
  nfc_card: 'NFC Card', nfc_poster: 'NFC Poster',
  clothing: 'Clothing', merch: 'Merchandise',
  vehicle_wrap: 'Vehicle Wrap', event_booth: 'Event Booth',
  social: 'Social Media', email: 'Email', other: 'Other',
};

const STATUS_COLOR: Record<string, string> = {
  draft:  'bg-white/10 text-white/70',
  active: 'bg-emerald-500/20 text-emerald-300',
  paused: 'bg-amber-500/20 text-amber-300',
  ended:  'bg-rose-500/20 text-rose-300',
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`admin-glass rounded-2xl p-4 md:p-5 ${className}`}>{children}</div>
);

const Stat: React.FC<{ label: string; value: React.ReactNode; sub?: string }> = ({ label, value, sub }) => (
  <Card>
    <div className="text-[11px] uppercase tracking-widest text-white/40">{label}</div>
    <div className="mt-2 text-2xl font-display font-semibold">{value}</div>
    {sub && <div className="text-xs text-white/50 mt-1">{sub}</div>}
  </Card>
);

// ---------- Dashboard ----------
const Dashboard: React.FC<{ campaigns: Campaign[]; events: CampaignEvent[]; onOpen: (id: string) => void }> = ({ campaigns, events, onOpen }) => {
  const active = campaigns.filter((c) => c.status === 'active').length;
  const uniques = events.filter((e) => e.is_unique).length;
  const scansByCampaign = useMemo(() => {
    const m = new Map<string, number>();
    events.forEach((e) => m.set(e.campaign_id, (m.get(e.campaign_id) || 0) + 1));
    return m;
  }, [events]);
  const top = [...campaigns]
    .map((c) => ({ c, scans: scansByCampaign.get(c.id) || 0 }))
    .sort((a, b) => b.scans - a.scans).slice(0, 5);
  const recent = events.slice(0, 10);
  const tally = (key: keyof CampaignEvent) => {
    const m = new Map<string, number>();
    events.forEach((e) => {
      const v = (e[key] as string) || 'Unknown';
      m.set(v, (m.get(v) || 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  };
  const topCountries = tally('country');
  const topDevices = tally('device');
  const topBrowsers = tally('browser');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total Campaigns" value={campaigns.length} />
        <Stat label="Active" value={active} />
        <Stat label="Total Scans" value={events.length} />
        <Stat label="Unique Visitors" value={uniques} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <div className="text-sm font-semibold mb-3">Top Campaigns</div>
          {top.length === 0 && <div className="text-xs text-white/40">No scans yet.</div>}
          <div className="space-y-2">
            {top.map(({ c, scans }) => (
              <button key={c.id} onClick={() => onOpen(c.id)} className="w-full flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5 text-left">
                <div className="min-w-0">
                  <div className="text-sm truncate">{c.name}</div>
                  <div className="text-[11px] text-white/40">{TYPE_LABELS[c.type] || c.type}</div>
                </div>
                <div className="text-sm font-semibold">{scans}</div>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold mb-3">Recent Activity</div>
          {recent.length === 0 && <div className="text-xs text-white/40">No activity yet.</div>}
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {recent.map((e) => {
              const c = campaigns.find((x) => x.id === e.campaign_id);
              return (
                <div key={e.id} className="flex items-center justify-between text-xs text-white/70 px-2 py-1.5 rounded hover:bg-white/5">
                  <div className="truncate">
                    <span className="text-white">{c?.name || '—'}</span>
                    <span className="text-white/40"> · {[e.city, e.country].filter(Boolean).join(', ') || 'Unknown'}</span>
                  </div>
                  <div className="text-white/40 shrink-0 ml-3">{new Date(e.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[
          { title: 'Top Locations', rows: topCountries },
          { title: 'Top Devices',   rows: topDevices },
          { title: 'Top Browsers',  rows: topBrowsers },
        ].map(({ title, rows }) => (
          <Card key={title}>
            <div className="text-sm font-semibold mb-3">{title}</div>
            {rows.length === 0 && <div className="text-xs text-white/40">No data.</div>}
            <div className="space-y-1.5">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-xs">
                  <span className="text-white/70">{k}</span>
                  <span className="text-white/50">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ---------- List ----------
const List: React.FC<{ campaigns: Campaign[]; events: CampaignEvent[]; onOpen: (id: string) => void; onDelete: (id: string) => void; onNew: () => void }> = ({ campaigns, events, onOpen, onDelete, onNew }) => {
  const [q, setQ] = useState('');
  const scans = useMemo(() => {
    const m = new Map<string, number>();
    events.forEach((e) => m.set(e.campaign_id, (m.get(e.campaign_id) || 0) + 1));
    return m;
  }, [events]);
  const filtered = campaigns.filter((c) =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.code.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaigns…" className="pl-9 bg-white/5 border-white/10" />
        </div>
        <Button onClick={onNew} className="admin-gradient-bg"><Plus className="h-4 w-4 mr-1.5" />New Campaign</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-widest text-white/40">
            <tr className="text-left"><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Code</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3 text-right">Scans</th><th className="py-2 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="py-2.5 pr-3"><button onClick={() => onOpen(c.id)} className="text-left hover:text-white">{c.name}</button></td>
                <td className="py-2.5 pr-3 text-white/60">{TYPE_LABELS[c.type] || c.type}</td>
                <td className="py-2.5 pr-3 font-mono text-xs text-white/70">{c.code}</td>
                <td className="py-2.5 pr-3"><span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${STATUS_COLOR[c.status] || ''}`}>{c.status}</span></td>
                <td className="py-2.5 pr-3 text-right">{scans.get(c.id) || 0}</td>
                <td className="py-2.5 text-right">
                  <button onClick={() => onOpen(c.id)} className="text-white/60 hover:text-white p-1.5"><ExternalLink className="h-4 w-4 inline" /></button>
                  <button onClick={() => { if (confirm('Delete this campaign?')) onDelete(c.id); }} className="text-rose-300/70 hover:text-rose-300 p-1.5"><Trash2 className="h-4 w-4 inline" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-white/40 text-sm">No campaigns yet — create your first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ---------- Form ----------
const blank = (): Partial<Campaign> => ({
  name: '', type: 'poster', status: 'active',
  start_date: null, end_date: null, budget_cents: null, notes: '',
  destination_kind: 'song', destination_id: null, destination_url: null,
});

const Form: React.FC<{ initial?: Campaign | null; onSaved: (c: Campaign) => void; onCancel: () => void }> = ({ initial, onSaved, onCancel }) => {
  const [form, setForm] = useState<Partial<Campaign>>(initial || blank());
  const [destOptions, setDestOptions] = useState<{ id: string; label: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const kind = form.destination_kind;
    if (kind === 'external' || kind === 'artist' || kind === 'playlist') { setDestOptions([]); return; }
    const map: Record<string, () => Promise<any[]>> = {
      song: () => adminList<any>('songs'),
      release: () => adminList<any>('releases'),
      merch: () => adminList<any>('merch'),
      event: () => adminList<any>('events'),
    };
    map[kind!]?.()
      .then((rows) => setDestOptions(rows.map((r) => ({
        id: r.id,
        label: r.title || r.name || r.id,
      }))))
      .catch(() => setDestOptions([]));
  }, [form.destination_kind]);

  const save = async () => {
    if (!form.name?.trim()) { toast.error('Name is required'); return; }
    if (form.destination_kind === 'external' && !form.destination_url) {
      toast.error('External URL is required'); return;
    }
    setSaving(true);
    try {
      const c = initial
        ? await updateCampaign(initial.id, form)
        : await createCampaign(form);
      toast.success(initial ? 'Updated' : 'Created');
      onSaved(c);
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const showIdPicker = form.destination_kind && !['external', 'artist', 'playlist'].includes(form.destination_kind);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onCancel}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <h3 className="text-lg font-display font-semibold">{initial ? 'Edit Campaign' : 'New Campaign'}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>Campaign Name</Label>
          <Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10 mt-1" />
        </div>
        <div>
          <Label>Type</Label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm">
            {CAMPAIGN_TYPES.map((t) => <option key={t} value={t} className="bg-black">{TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <Label>Status</Label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="mt-1 w-full bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm">
            {['draft','active','paused','ended'].map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
          </select>
        </div>
        <div>
          <Label>Start Date</Label>
          <Input type="date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value || null })} className="bg-white/5 border-white/10 mt-1" />
        </div>
        <div>
          <Label>End Date</Label>
          <Input type="date" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value || null })} className="bg-white/5 border-white/10 mt-1" />
        </div>
        <div>
          <Label>Budget (USD)</Label>
          <Input type="number" value={form.budget_cents ? form.budget_cents / 100 : ''} onChange={(e) => setForm({ ...form, budget_cents: e.target.value ? Math.round(Number(e.target.value) * 100) : null })} className="bg-white/5 border-white/10 mt-1" />
        </div>
        <div>
          <Label>Destination Type</Label>
          <select value={form.destination_kind} onChange={(e) => setForm({ ...form, destination_kind: e.target.value, destination_id: null, destination_url: null })} className="mt-1 w-full bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm">
            {DESTINATION_KINDS.map((k) => <option key={k} value={k} className="bg-black">{k}</option>)}
          </select>
        </div>
        {showIdPicker && (
          <div className="md:col-span-2">
            <Label>Destination</Label>
            <select value={form.destination_id || ''} onChange={(e) => setForm({ ...form, destination_id: e.target.value || null })} className="mt-1 w-full bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm">
              <option value="" className="bg-black">— Select —</option>
              {destOptions.map((o) => <option key={o.id} value={o.id} className="bg-black">{o.label}</option>)}
            </select>
          </div>
        )}
        {form.destination_kind === 'external' && (
          <div className="md:col-span-2">
            <Label>External URL</Label>
            <Input placeholder="https://…" value={form.destination_url || ''} onChange={(e) => setForm({ ...form, destination_url: e.target.value })} className="bg-white/5 border-white/10 mt-1" />
          </div>
        )}
        <div className="md:col-span-2">
          <Label>Notes</Label>
          <Textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-white/5 border-white/10 mt-1" rows={3} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={saving} onClick={save} className="admin-gradient-bg">{saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Campaign'}</Button>
      </div>
    </Card>
  );
};

// ---------- Detail ----------
const Detail: React.FC<{ campaign: Campaign; events: CampaignEvent[]; onBack: () => void; onEdit: () => void; onUpdated: (c: Campaign) => void; onDelete: () => void }> = ({ campaign, events, onBack, onEdit, onUpdated, onDelete }) => {
  const [qrPng, setQrPng] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const url = campaignUrl(campaign.code);
  const myEvents = events.filter((e) => e.campaign_id === campaign.id);
  const uniques = myEvents.filter((e) => e.is_unique).length;

  useEffect(() => {
    QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: '#000000', light: '#ffffff' } }).then(setQrPng).catch(() => {});
    QRCode.toString(url, { type: 'svg', margin: 2 }).then(setQrSvg).catch(() => {});
  }, [url]);

  const copy = (text: string, label = 'Copied') => {
    navigator.clipboard.writeText(text).then(() => toast.success(label));
  };

  const download = (dataUrl: string, name: string) => {
    const a = document.createElement('a');
    a.href = dataUrl; a.download = name; a.click();
  };

  const downloadSvg = () => {
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    download(URL.createObjectURL(blob), `campaign-${campaign.code}.svg`);
  };

  const regenerateCode = async () => {
    if (!confirm('Regenerate the campaign code? Old QR codes and NFC tags will stop working.')) return;
    const c = await updateCampaign(campaign.id, { code: generateCode() });
    onUpdated(c);
    toast.success('Code regenerated');
  };

  const tally = (key: keyof CampaignEvent) => {
    const m = new Map<string, number>();
    myEvents.forEach((e) => { const v = (e[key] as string) || 'Unknown'; m.set(v, (m.get(v) || 0) + 1); });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
          <h3 className="text-lg font-display font-semibold flex-1">{campaign.name}</h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${STATUS_COLOR[campaign.status] || ''}`}>{campaign.status}</span>
          <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-rose-300 hover:text-rose-200"><Trash2 className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/40">Tracking URL</div>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs truncate">{url}</code>
              <Button size="sm" variant="ghost" onClick={() => copy(url, 'URL copied')}><Copy className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div><div className="text-white/40 uppercase tracking-widest text-[10px]">Type</div><div className="mt-1">{TYPE_LABELS[campaign.type] || campaign.type}</div></div>
              <div><div className="text-white/40 uppercase tracking-widest text-[10px]">Destination</div><div className="mt-1 capitalize">{campaign.destination_kind}</div></div>
              <div><div className="text-white/40 uppercase tracking-widest text-[10px]">Code</div><div className="mt-1 font-mono">{campaign.code}</div></div>
              <div><div className="text-white/40 uppercase tracking-widest text-[10px]">Created</div><div className="mt-1">{new Date(campaign.created_at).toLocaleDateString()}</div></div>
            </div>
            {campaign.notes && (
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-widest text-white/40">Notes</div>
                <div className="mt-1 text-sm text-white/80 whitespace-pre-wrap">{campaign.notes}</div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center">
            {qrPng ? <img src={qrPng} alt="QR" className="w-48 h-48 rounded-lg bg-white p-2" /> : <div className="w-48 h-48 bg-white/5 rounded-lg animate-pulse" />}
            <div className="grid grid-cols-2 gap-2 mt-3 w-48">
              <Button size="sm" variant="ghost" onClick={() => download(qrPng, `campaign-${campaign.code}.png`)}><Download className="h-3.5 w-3.5 mr-1" />PNG</Button>
              <Button size="sm" variant="ghost" onClick={downloadSvg}><Download className="h-3.5 w-3.5 mr-1" />SVG</Button>
              <Button size="sm" variant="ghost" onClick={() => window.print()}>Print</Button>
              <Button size="sm" variant="ghost" onClick={regenerateCode}><RefreshCw className="h-3.5 w-3.5 mr-1" />New</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Radio className="h-4 w-4 text-white/60" />
          <div className="text-sm font-semibold">NFC Programming</div>
        </div>
        <p className="text-xs text-white/60 mb-2">Copy this URL into your NFC writing app (e.g. NFC Tools) and write to an NTAG215 tag.</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs truncate">{url}</code>
          <Button size="sm" variant="ghost" onClick={() => copy(url, 'NFC URL copied')}><Copy className="h-4 w-4" /></Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total Scans" value={myEvents.length} />
        <Stat label="Unique Visitors" value={uniques} />
        <Stat label="Repeat Visits" value={myEvents.length - uniques} />
        <Stat label="Avg Response" value={`${Math.round((myEvents.reduce((a, e) => a + (e.response_ms || 0), 0) / Math.max(myEvents.length, 1)))}ms`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[
          { title: 'Locations', rows: tally('country') },
          { title: 'Devices',   rows: tally('device') },
          { title: 'Browsers',  rows: tally('browser') },
        ].map(({ title, rows }) => (
          <Card key={title}>
            <div className="text-sm font-semibold mb-3">{title}</div>
            {rows.length === 0 && <div className="text-xs text-white/40">No data.</div>}
            <div className="space-y-1.5">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-xs">
                  <span className="text-white/70">{k}</span><span className="text-white/50">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="text-sm font-semibold mb-3">Recent Visits</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-widest text-white/40">
              <tr className="text-left"><th className="py-2 pr-3">Time</th><th className="py-2 pr-3">Location</th><th className="py-2 pr-3">Device</th><th className="py-2 pr-3">Browser</th><th className="py-2 pr-3">Source</th><th className="py-2 pr-3">Visitor</th></tr>
            </thead>
            <tbody>
              {myEvents.slice(0, 50).map((e) => (
                <tr key={e.id} className="border-t border-white/5">
                  <td className="py-2 pr-3 text-white/60">{new Date(e.created_at).toLocaleString([], { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}</td>
                  <td className="py-2 pr-3">{[e.city, e.region, e.country].filter(Boolean).join(', ') || '—'}</td>
                  <td className="py-2 pr-3 text-white/60">{e.device || '—'}</td>
                  <td className="py-2 pr-3 text-white/60">{e.browser || '—'}</td>
                  <td className="py-2 pr-3 text-white/60">{e.referral_method || '—'}</td>
                  <td className="py-2 pr-3">{e.is_unique ? <span className="text-emerald-300">New</span> : <span className="text-white/40">Repeat</span>}</td>
                </tr>
              ))}
              {myEvents.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-white/40">No visits yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ---------- Module shell ----------
const Campaigns: React.FC = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [cs, es] = await Promise.all([listCampaigns(), listCampaignEvents()]);
      setCampaigns(cs);
      setEvents(es);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const selected = campaigns.find((c) => c.id === selectedId) || null;

  const handleDelete = async (id: string) => {
    await deleteCampaign(id);
    toast.success('Deleted');
    setSelectedId(null);
    setEditing(null);
    reload();
  };

  // ----- Render flows -----
  if (creating || editing) {
    return (
      <Form
        initial={editing}
        onSaved={(c) => {
          setCreating(false);
          setEditing(null);
          setSelectedId(c.id);
          reload();
        }}
        onCancel={() => { setCreating(false); setEditing(null); }}
      />
    );
  }

  if (selected) {
    return (
      <Detail
        campaign={selected}
        events={events}
        onBack={() => setSelectedId(null)}
        onEdit={() => setEditing(selected)}
        onUpdated={(c) => { setCampaigns((prev) => prev.map((x) => x.id === c.id ? c : x)); }}
        onDelete={() => handleDelete(selected.id)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-white/70" />
          <h2 className="text-xl font-display font-semibold">Campaigns</h2>
        </div>
        <div className="ml-auto flex gap-1.5 admin-glass rounded-full p-1">
          {([
            ['dashboard', 'Dashboard', BarChart3],
            ['list', 'All', Megaphone],
            ['create', 'Create', Plus],
          ] as [Tab, string, any][]).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => { if (k === 'create') { setCreating(true); } else setTab(k); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${tab === k && k !== 'create' ? 'admin-gradient-bg text-white' : 'text-white/60 hover:text-white'}`}
            >
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-white/40 text-sm">Loading…</div>
      ) : tab === 'dashboard' ? (
        <Dashboard campaigns={campaigns} events={events} onOpen={setSelectedId} />
      ) : (
        <List
          campaigns={campaigns}
          events={events}
          onOpen={setSelectedId}
          onDelete={handleDelete}
          onNew={() => setCreating(true)}
        />
      )}
    </div>
  );
};

export default Campaigns;
