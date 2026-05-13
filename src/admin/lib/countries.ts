// ISO-3166 alpha-2 helpers used by the Analytics map.

// Approximate centroids for common ISO-3166 alpha-2 codes (longitude, latitude)
export const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [-98, 39], CA: [-106, 56], MX: [-102, 23], BR: [-52, -10], AR: [-64, -34],
  CO: [-74, 4], CL: [-71, -30], PE: [-75, -10], VE: [-66, 7],
  GB: [-2, 54], FR: [2, 46], DE: [10, 51], ES: [-4, 40], IT: [12, 42], NL: [5, 52],
  BE: [4, 50], CH: [8, 47], AT: [14, 47], PT: [-8, 39], IE: [-8, 53],
  SE: [15, 62], NO: [10, 62], FI: [26, 64], DK: [10, 56], PL: [19, 52],
  CZ: [15, 49], HU: [19, 47], RO: [25, 46], GR: [22, 39],
  UA: [32, 49], RU: [100, 61], BY: [28, 53],
  TR: [35, 39], EG: [30, 26], NG: [8, 9], ZA: [24, -29], KE: [37, -1], MA: [-7, 32],
  GH: [-1, 8], ET: [40, 9], TZ: [35, -6],
  IN: [78, 22], PK: [70, 30], BD: [90, 24], CN: [104, 35], JP: [138, 36], KR: [127, 36],
  TW: [121, 24], HK: [114, 22], SG: [104, 1], TH: [101, 15], VN: [108, 16],
  ID: [113, -2], PH: [121, 12], MY: [102, 4],
  AU: [134, -25], NZ: [172, -41],
  SA: [45, 24], AE: [54, 24], IL: [35, 31], IR: [54, 32], IQ: [44, 33],
};

// Minimal name → ISO map covering the codes above. Used to normalise data
// stored as full country names (e.g. ipapi returns "United States").
const NAME_TO_CODE: Record<string, string> = {
  'united states': 'US', 'united states of america': 'US', 'usa': 'US',
  'united kingdom': 'GB', 'great britain': 'GB', 'england': 'GB',
  'canada': 'CA', 'mexico': 'MX', 'brazil': 'BR', 'argentina': 'AR',
  'colombia': 'CO', 'chile': 'CL', 'peru': 'PE', 'venezuela': 'VE',
  'france': 'FR', 'germany': 'DE', 'spain': 'ES', 'italy': 'IT', 'netherlands': 'NL',
  'belgium': 'BE', 'switzerland': 'CH', 'austria': 'AT', 'portugal': 'PT', 'ireland': 'IE',
  'sweden': 'SE', 'norway': 'NO', 'finland': 'FI', 'denmark': 'DK', 'poland': 'PL',
  'czech republic': 'CZ', 'czechia': 'CZ', 'hungary': 'HU', 'romania': 'RO', 'greece': 'GR',
  'ukraine': 'UA', 'russia': 'RU', 'belarus': 'BY',
  'turkey': 'TR', 'egypt': 'EG', 'nigeria': 'NG', 'south africa': 'ZA',
  'kenya': 'KE', 'morocco': 'MA', 'ghana': 'GH', 'ethiopia': 'ET', 'tanzania': 'TZ',
  'india': 'IN', 'pakistan': 'PK', 'bangladesh': 'BD', 'china': 'CN', 'japan': 'JP',
  'south korea': 'KR', 'korea': 'KR', 'taiwan': 'TW', 'hong kong': 'HK',
  'singapore': 'SG', 'thailand': 'TH', 'vietnam': 'VN',
  'indonesia': 'ID', 'philippines': 'PH', 'malaysia': 'MY',
  'australia': 'AU', 'new zealand': 'NZ',
  'saudi arabia': 'SA', 'united arab emirates': 'AE', 'uae': 'AE',
  'israel': 'IL', 'iran': 'IR', 'iraq': 'IQ',
};

// Best-effort country name → ISO-2 code. Returns the input upper-cased if it
// already looks like a 2-letter code.
export const toCountryCode = (raw?: string | null): string | null => {
  if (!raw) return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.length === 2 && /^[A-Za-z]{2}$/.test(t)) return t.toUpperCase();
  const k = t.toLowerCase();
  return NAME_TO_CODE[k] || null;
};

// Convert ISO-2 code to a flag emoji (regional indicator symbols).
export const flagEmoji = (code?: string | null): string => {
  if (!code || code.length !== 2) return '🌐';
  const cc = code.toUpperCase();
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
};

// Friendly name fallback when we only have a code.
const CODE_TO_NAME: Record<string, string> = Object.entries(NAME_TO_CODE).reduce(
  (acc, [name, code]) => {
    if (!acc[code]) acc[code] = name.replace(/\b\w/g, (m) => m.toUpperCase());
    return acc;
  },
  {} as Record<string, string>,
);

export const countryName = (code?: string | null): string => {
  if (!code) return 'Unknown';
  return CODE_TO_NAME[code.toUpperCase()] || code.toUpperCase();
};
