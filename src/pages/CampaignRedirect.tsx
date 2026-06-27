import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SITE_URL } from '@/lib/siteUrl';

const CampaignRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const fired = useRef(false);

  useEffect(() => {
    if (!code || fired.current) return;
    fired.current = true;

    const referrer = document.referrer || '';
    const session_id =
      sessionStorage.getItem('cmp_sid') ||
      (() => {
        const id = crypto.randomUUID();
        sessionStorage.setItem('cmp_sid', id);
        return id;
      })();

    let done = false;
    const go = (url: string) => {
      if (done) return;
      done = true;
      try {
        const u = new URL(url, SITE_URL);
        if (!/^https?:$/.test(u.protocol)) throw new Error('bad scheme');
        // Never bounce the user to the Supabase functions origin.
        if (/supabase\.(co|in)$/.test(u.hostname)) {
          window.location.replace(SITE_URL);
          return;
        }
        window.location.replace(u.toString());
      } catch {
        window.location.replace(SITE_URL);
      }
    };

    // Safety fallback — if function hangs, send them home after 2.5s
    const t = setTimeout(() => go(SITE_URL), 2500);

    supabase.functions
      .invoke('campaign-track', { body: { code, referrer, session_id, site_origin: SITE_URL } })
      .then(({ data, error }) => {
        clearTimeout(t);
        if (error || !data?.destination_url) {
          go('/');
          return;
        }
        go(data.destination_url);
      })
      .catch(() => {
        clearTimeout(t);
        go('/');
      });
  }, [code]);

  return (
    <div className="min-h-screen bg-black text-white/70 flex items-center justify-center text-sm">
      Redirecting…
    </div>
  );
};

export default CampaignRedirect;
