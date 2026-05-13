import React, { useEffect, useState } from 'react';
import { adminList, adminInsert, adminUpdate, adminDelete } from '../lib/api';
import { Loader2, Plus, Trash2, MapPin, ExternalLink, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  ticket_url: string | null;
  cover_image: string | null;
  status: 'active' | 'expired';
}

const Events: React.FC = () => {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ title: '', event_date: '', event_time: '', location: '', ticket_url: '' });

  const refresh = () => {
    setLoading(true);
    adminList<EventRow>('events').then(setRows).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(refresh, []);

  const create = async () => {
    if (!draft.title || !draft.event_date) { toast.error('Title and date are required'); return; }
    try {
      const row = await adminInsert<EventRow>('events', { ...draft, status: 'active' });
      setRows((p) => [row, ...p]);
      setDraft({ title: '', event_date: '', event_time: '', location: '', ticket_url: '' });
    } catch (e: any) { toast.error(e.message); }
  };

  const toggle = async (e: EventRow) => {
    const newStatus = e.status === 'active' ? 'expired' : 'active';
    try {
      const u = await adminUpdate<EventRow>('events', e.id, { status: newStatus });
      setRows((p) => p.map((x) => x.id === e.id ? { ...x, ...u } : x));
    } catch (err: any) { toast.error(err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete event?')) return;
    try { await adminDelete('events', id); setRows((p) => p.filter((x) => x.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const upcoming = rows
    .filter((e) => e.status === 'active')
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="admin-glass rounded-2xl p-5">
          <h3 className="font-display text-base font-semibold mb-3">Add an event</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <Input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="md:col-span-2 bg-white/5 border-white/10 text-white" />
            <Input type="date" value={draft.event_date} onChange={(e) => setDraft({ ...draft, event_date: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input type="time" value={draft.event_time} onChange={(e) => setDraft({ ...draft, event_time: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="Location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="Ticket URL" value={draft.ticket_url} onChange={(e) => setDraft({ ...draft, ticket_url: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <Button onClick={create} className="mt-3 admin-gradient-bg text-white border-0 hover:opacity-90"><Plus className="h-4 w-4 mr-1" /> Add event</Button>
        </div>

        <div className="admin-glass rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-white/50 text-sm">No events yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {rows.map((e) => (
                <div key={e.id} className="p-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-white/55 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(e.event_date).toLocaleDateString()} {e.event_time?.slice(0, 5)}</span>
                      {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>}
                    </div>
                  </div>
                  {e.ticket_url && <a href={e.ticket_url} target="_blank" className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Tickets</a>}
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span>{e.status === 'active' ? 'Active' : 'Expired'}</span>
                    <Switch checked={e.status === 'active'} onCheckedChange={() => toggle(e)} />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(e.id)} className="h-8 w-8 text-rose-300"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="admin-glass-strong rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-widest text-white/45">Frontend preview</div>
        <h3 className="font-display text-base font-semibold mb-4">Upcoming events</h3>
        {upcoming.length === 0 ? (
          <div className="text-sm text-white/50 py-6 text-center">Nothing upcoming.</div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((e) => (
              <div key={e.id} className="rounded-xl admin-gradient-soft-bg border border-white/10 p-3">
                <div className="text-xs text-purple-200/80">{new Date(e.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                <div className="font-medium mt-0.5">{e.title}</div>
                <div className="text-xs text-white/55">{e.location}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
