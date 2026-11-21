import { readFileSync, writeFileSync } from 'node:fs';

const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const values = Object.fromEntries(raw.split(/\r?\n/).filter((line) => line.includes('=')).map((line) => {
  const separator = line.indexOf('=');
  return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^"|"$/g, '')];
}));
const url = process.env.VITE_SUPABASE_URL || values.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || values.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Missing public Supabase configuration for song previews');
writeFileSync(new URL('../netlify/song-preview-config.ts', import.meta.url),
  `// Generated at build time from the same public configuration as the frontend.\nexport const supabaseUrl = ${JSON.stringify(url)};\nexport const supabaseKey = ${JSON.stringify(key)};\n`);
