import React, { useEffect, useState } from 'react';
import { adminList, adminInsert, adminUpdate, adminDelete, adminUploadFile } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash2, ImageIcon, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface MerchRow {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  stock: number;
  image_url: string | null;
  external_url: string | null;
  active: boolean;
}

const Merch: React.FC = () => {
  const [rows, setRows] = useState<MerchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ name: '', price: '', stock: '', external_url: '' });

  const refresh = () => {
    setLoading(true);
    adminList<MerchRow>('merch').then(setRows).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(refresh, []);

  const create = async () => {
    if (!draft.name) { toast.error('Name required'); return; }
    try {
      const row = await adminInsert<MerchRow>('merch', {
        name: draft.name,
        price_cents: Math.round(Number(draft.price || 0) * 100),
        stock: Number(draft.stock || 0),
        external_url: draft.external_url || null,
        active: true,
      });
      setRows((p) => [row, ...p]);
      setDraft({ name: '', price: '', stock: '', external_url: '' });
    } catch (e: any) { toast.error(e.message); }
  };

  const updateField = async (id: string, payload: Partial<MerchRow>) => {
    try {
      const u = await adminUpdate<MerchRow>('merch', id, payload);
      setRows((p) => p.map((x) => x.id === id ? { ...x, ...u } : x));
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete product?')) return;
    try { await adminDelete('merch', id); setRows((p) => p.filter((x) => x.id !== id)); }
    catch (e: any) { toast.error(e.message); }
  };

  const uploadImage = async (id: string, file: File) => {
    try {
      const path = `${id}-${Date.now()}.${file.name.split('.').pop()}`;
      const url = await adminUploadFile('merch-images', path, file);
      await updateField(id, { image_url: url });
    } catch (e: any) { toast.error(e.message); }
  };

  const activeMerch = rows.filter((m) => m.active);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="admin-glass rounded-2xl p-5">
          <h3 className="font-display text-base font-semibold mb-3">Add a product</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <Input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="md:col-span-2 bg-white/5 border-white/10 text-white" />
            <Input placeholder="Price (USD)" type="number" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="Stock" type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="External link" value={draft.external_url} onChange={(e) => setDraft({ ...draft, external_url: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          </div>
          <Button onClick={create} className="mt-3 admin-gradient-bg text-white border-0 hover:opacity-90"><Plus className="h-4 w-4 mr-1" /> Add product</Button>
        </div>

        {loading ? (
          <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rows.map((m) => (
              <div key={m.id} className="admin-glass rounded-2xl overflow-hidden">
                <label className="block aspect-[4/3] bg-white/[0.04] relative cursor-pointer group">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30"><ImageIcon className="h-10 w-10" /></div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(m.id, e.target.files[0])} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs text-white">Click to upload</div>
                </label>
                <div className="p-4 space-y-2">
                  <Input value={m.name} onChange={(e) => setRows((p) => p.map((x) => x.id === m.id ? { ...x, name: e.target.value } : x))} onBlur={(e) => updateField(m.id, { name: e.target.value })} className="bg-transparent border-0 px-0 h-7 text-base font-medium text-white focus-visible:ring-0" />
                  <div className="flex items-center gap-2">
                    <Input type="number" step="0.01" value={(m.price_cents / 100).toString()} onChange={(e) => setRows((p) => p.map((x) => x.id === m.id ? { ...x, price_cents: Math.round(Number(e.target.value) * 100) } : x))} onBlur={(e) => updateField(m.id, { price_cents: Math.round(Number(e.target.value) * 100) })} className="bg-white/5 border-white/10 text-white h-8" />
                    <Input type="number" value={m.stock} onChange={(e) => setRows((p) => p.map((x) => x.id === m.id ? { ...x, stock: Number(e.target.value) } : x))} onBlur={(e) => updateField(m.id, { stock: Number(e.target.value) })} className="bg-white/5 border-white/10 text-white h-8 w-20" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Switch checked={m.active} onCheckedChange={(v) => updateField(m.id, { active: v })} /> Active
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => remove(m.id)} className="h-8 w-8 text-rose-300"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live slider preview */}
      <div className="admin-glass-strong rounded-2xl p-5">
        <div className="text-[11px] uppercase tracking-widest text-white/45">Frontend preview</div>
        <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-purple-300" /> Active merch slider</h3>
        {activeMerch.length === 0 ? (
          <div className="text-sm text-white/50 py-6 text-center">No active products.</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-hidden pb-2">
            {activeMerch.map((m) => (
              <div key={m.id} className="shrink-0 w-40 rounded-xl border border-white/10 admin-gradient-soft-bg overflow-hidden">
                <div className="aspect-square bg-white/[0.04]">
                  {m.image_url && <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-2">
                  <div className="text-xs font-medium truncate">{m.name}</div>
                  <div className="text-[11px] text-white/55">${(m.price_cents / 100).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Merch;
