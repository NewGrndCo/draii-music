import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, ExternalLink } from 'lucide-react';

interface MerchRow {
  id: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  external_url: string | null;
}

const UpcomingMerch: React.FC = () => {
  const [items, setItems] = useState<MerchRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from('merch')
        .select('id,name,price_cents,image_url,external_url')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .limit(12);
      setItems((data as MerchRow[]) ?? []);
      setLoaded(true);
    })();
  }, []);

  if (!loaded) return <div aria-hidden className="mt-2 rounded-2xl border border-white/5 bg-white/[0.02] h-[180px]" style={{ contain: 'layout paint' }} />;
  if (items.length === 0) return null;

  return (
    <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3">
      <div className="flex items-center gap-2 mb-3 text-white/80">
        <ShoppingBag className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold tracking-wide">Merch</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hidden pb-1">
        {items.map((m) => {
          const Card = (
            <>
              <div className="aspect-square bg-white/[0.04]">
                {m.image_url && (
                  <img src={m.image_url} alt={m.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-2">
                <div className="text-xs font-medium truncate flex items-center gap-1">
                  {m.name}
                  {m.external_url && <ExternalLink className="w-3 h-3 text-white/50" />}
                </div>
                <div className="text-[11px] text-purple-200/80">
                  ${(m.price_cents / 100).toFixed(2)}
                </div>
              </div>
            </>
          );
          const trackClick = () => {
            let geo: any = {};
            try { const c = sessionStorage.getItem('live-presence-geo-v1'); if (c) geo = JSON.parse(c); } catch {}
            supabase.from('merch_clicks').insert({
              merch_id: m.id, country: geo.country, region: geo.region, city: geo.city,
            }).then(() => {});
          };
          return m.external_url ? (
            <a
              key={m.id}
              href={m.external_url}
              target="_blank"
              rel="noreferrer"
              onClick={trackClick}
              className="shrink-0 w-36 rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/15 to-blue-500/10 overflow-hidden hover:border-purple-400/40 transition"
            >
              {Card}
            </a>
          ) : (
            <button
              key={m.id}
              onClick={trackClick}
              className="shrink-0 w-36 rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/15 to-blue-500/10 overflow-hidden text-left"
            >
              {Card}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingMerch;
