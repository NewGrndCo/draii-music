import React, { useEffect, useState } from 'react';
import { adminList, adminUpdate } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Loader2, Save, ExternalLink, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileRow {
  id: string;
  support_fund_enabled: boolean;
  stripe_payment_link: string | null;
}

const SupportFund: React.FC = () => {
  const [row, setRow] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminList<any>('artist_profile')
      .then((rows) => {
        const r = rows[0];
        if (!r) return setRow(null);
        setRow({
          id: r.id,
          support_fund_enabled: r.support_fund_enabled ?? true,
          stripe_payment_link: r.stripe_payment_link ?? '',
        });
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    try {
      const link = (row.stripe_payment_link || '').trim();
      if (link && !/^https:\/\/(buy\.stripe\.com|checkout\.stripe\.com|.*stripe\.com)/i.test(link)) {
        toast.error('Use a Stripe Payment Link (buy.stripe.com/...)');
        setSaving(false);
        return;
      }
      await adminUpdate('artist_profile', row.id, {
        support_fund_enabled: row.support_fund_enabled,
        stripe_payment_link: link || null,
      });
      toast.success('Support Fund settings saved');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-glass rounded-2xl p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-white/50" /></div>;
  if (!row) return <div className="admin-glass rounded-2xl p-6 text-sm text-white/60">Profile row missing.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="admin-glass rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold">Support Fund</h3>
                <p className="text-xs text-white/55 mt-0.5">Show a $ button on the public player so fans can tip you.</p>
              </div>
            </div>
            <Switch
              checked={row.support_fund_enabled}
              onCheckedChange={(v) => setRow({ ...row, support_fund_enabled: v })}
            />
          </div>
        </div>

        <div className="admin-glass rounded-2xl p-5 space-y-3">
          <div>
            <h3 className="font-display text-base font-semibold">Stripe Payment Link</h3>
            <p className="text-xs text-white/55 mt-1">
              Paste a Stripe Payment Link URL. Tapping the $ button on the player opens this checkout in a new tab — money goes directly into your Stripe account.
            </p>
          </div>
          <Label className="text-xs text-white/55">Payment Link URL</Label>
          <Input
            value={row.stripe_payment_link ?? ''}
            onChange={(e) => setRow({ ...row, stripe_payment_link: e.target.value })}
            placeholder="https://buy.stripe.com/abc123…"
            className="bg-white/5 border-white/10 text-white"
          />
          <a
            href="https://dashboard.stripe.com/payment-links"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 mt-1"
          >
            Open Stripe Payment Links <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <Button onClick={save} disabled={saving} className="admin-gradient-bg text-white border-0 hover:opacity-90">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save changes
        </Button>
      </div>

      <div className="space-y-5">
        <div className="admin-glass-strong rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-purple-300" />
            <h3 className="font-display text-sm font-semibold">How to set up</h3>
          </div>
          <ol className="text-xs text-white/65 space-y-2 list-decimal pl-4">
            <li>Create a free Stripe account at <span className="text-white">stripe.com</span>.</li>
            <li>Go to <span className="text-white">Products → Payment Links → New</span>.</li>
            <li>Choose "Customers choose what to pay" (Pay what you want).</li>
            <li>Copy the link (looks like <span className="text-white">https://buy.stripe.com/…</span>).</li>
            <li>Paste it here, save, and the $ button on the player will start collecting tips.</li>
          </ol>
          <p className="text-[11px] text-white/40 pt-2 border-t border-white/5">
            Until a link is set, the $ button shows the built-in tip dialog and saves intents to the database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportFund;
