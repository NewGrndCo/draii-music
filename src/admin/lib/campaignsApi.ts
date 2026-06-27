import { adminCall, adminList, adminInsert, adminUpdate, adminDelete } from './api';

export interface Campaign {
  id: string;
  code: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'ended';
  start_date: string | null;
  end_date: string | null;
  budget_cents: number | null;
  notes: string | null;
  destination_kind: string;
  destination_id: string | null;
  destination_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignEvent {
  id: string;
  campaign_id: string;
  visitor_hash: string | null;
  is_unique: boolean;
  session_id: string | null;
  referral_method: string | null;
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  response_ms: number | null;
  user_agent: string | null;
  created_at: string;
}

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

export function generateCode(len = 8): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHA[bytes[i] % ALPHA.length];
  return out;
}

export const CAMPAIGN_TYPES = [
  'poster','flyer','billboard','business_card','sticker',
  'nfc_card','nfc_poster','clothing','merch','vehicle_wrap',
  'event_booth','social','email','other',
] as const;

export const DESTINATION_KINDS = [
  'song','release','merch','event','artist','playlist','external',
] as const;

export async function listCampaigns(): Promise<Campaign[]> {
  return adminList<Campaign>('campaigns');
}

export async function listCampaignEvents(): Promise<CampaignEvent[]> {
  const { data } = await adminCall<{ data: CampaignEvent[] }>({
    op: 'list', table: 'campaign_events',
  });
  return data || [];
}

export async function createCampaign(payload: Partial<Campaign>): Promise<Campaign> {
  let code = payload.code;
  if (!code) {
    // Try a few times to avoid rare collisions
    for (let i = 0; i < 5; i++) {
      const candidate = generateCode();
      try {
        return await adminInsert<Campaign>('campaigns', { ...payload, code: candidate });
      } catch (e: any) {
        if (!String(e?.message || '').includes('duplicate')) throw e;
      }
    }
    code = generateCode(10);
  }
  return adminInsert<Campaign>('campaigns', { ...payload, code });
}

export const updateCampaign = (id: string, payload: Partial<Campaign>) =>
  adminUpdate<Campaign>('campaigns', id, payload);

export const deleteCampaign = (id: string) => adminDelete('campaigns', id);

export const CAMPAIGN_BASE_URL = 'https://drairynell.com';

export function campaignUrl(code: string): string {
  return `${CAMPAIGN_BASE_URL}/c/${code}`;
}
