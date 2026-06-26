
-- campaigns
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'draft',
  start_date date,
  end_date date,
  budget_cents integer,
  notes text,
  destination_kind text NOT NULL DEFAULT 'external',
  destination_id uuid,
  destination_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages campaigns"
  ON public.campaigns FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER campaigns_set_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX campaigns_status_idx ON public.campaigns(status);

-- campaign_events
CREATE TABLE public.campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  visitor_hash text,
  is_unique boolean NOT NULL DEFAULT false,
  session_id text,
  referral_method text DEFAULT 'short_link',
  ip text,
  country text,
  region text,
  city text,
  latitude double precision,
  longitude double precision,
  device text,
  browser text,
  os text,
  response_ms integer,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_events TO authenticated;
GRANT ALL ON public.campaign_events TO service_role;

ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages campaign events"
  ON public.campaign_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX campaign_events_campaign_created_idx
  ON public.campaign_events(campaign_id, created_at DESC);
CREATE INDEX campaign_events_visitor_idx
  ON public.campaign_events(visitor_hash);
