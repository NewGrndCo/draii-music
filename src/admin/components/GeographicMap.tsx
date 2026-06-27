import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { Globe2, ChevronRight, ArrowLeft } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { COUNTRY_COORDS, flagEmoji, toCountryCode, countryName } from '../lib/countries';

type Listen = {
  country?: string | null;
  region?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type FocusTarget = {
  coords: [number, number]; // [lng, lat] (kept for API compatibility with Analytics.tsx)
  zoom: number;
  label: string;
} | null;

interface Props {
  listens: Listen[];
  focus: FocusTarget;
  onClearFocus: () => void;
}

type Level = 'world' | 'country' | 'region';

type GeoAgg = Record<string, { n: number; latSum: number; lngSum: number; geoN: number }>;

const groupBy = <T,>(arr: T[], keyFn: (x: T) => string | null) => {
  const map: Record<string, number> = {};
  arr.forEach((x) => {
    const k = keyFn(x);
    if (!k) return;
    map[k] = (map[k] || 0) + 1;
  });
  return map;
};

const groupWithCoords = <T extends { latitude?: number | null; longitude?: number | null }>(
  arr: T[], keyFn: (x: T) => string | null,
): GeoAgg => {
  const map: GeoAgg = {};
  arr.forEach((x) => {
    const k = keyFn(x);
    if (!k) return;
    const row = (map[k] ||= { n: 0, latSum: 0, lngSum: 0, geoN: 0 });
    row.n += 1;
    if (typeof x.latitude === 'number' && typeof x.longitude === 'number') {
      row.latSum += x.latitude;
      row.lngSum += x.longitude;
      row.geoN += 1;
    }
  });
  return map;
};

// Convert react-simple-maps zoom (1=world, 4=country, 6=region, 8=city) → Leaflet zoom
const toLeafletZoom = (rsmZoom: number) => {
  if (rsmZoom <= 1) return 2;
  if (rsmZoom <= 3) return 4;
  if (rsmZoom <= 4) return 5;
  if (rsmZoom <= 6) return 7;
  if (rsmZoom <= 8) return 10;
  return 11;
};

// Imperative view-controller: flies the map whenever target changes
const ViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [map, center[0], center[1], zoom]);
  return null;
};

const GeographicMap: React.FC<Props> = ({ listens, focus, onClearFocus }) => {
  const [level, setLevel] = useState<Level>('world');
  const [country, setCountry] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);

  const normalised = useMemo(
    () => listens.map((l) => ({ ...l, code: toCountryCode(l.country) })),
    [listens],
  );

  const byCountry = useMemo(() => groupBy(normalised, (l) => l.code), [normalised]);

  const countryAgg = useMemo(
    () => groupWithCoords(normalised, (l) => l.code),
    [normalised],
  );
  const regionAgg = useMemo(
    () => groupWithCoords(normalised.filter((l) => l.code === country), (l) => l.region || null),
    [normalised, country],
  );
  const cityAgg = useMemo(
    () => groupWithCoords(
      normalised.filter((l) => l.code === country && (l.region || null) === region),
      (l) => l.city || null,
    ),
    [normalised, country, region],
  );

  const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]);
  const topRegions = Object.entries(regionAgg).map(([k, v]) => [k, v.n] as [string, number]).sort((a, b) => b[1] - a[1]);
  const topCities = Object.entries(cityAgg).map(([k, v]) => [k, v.n] as [string, number]).sort((a, b) => b[1] - a[1]);

  const maxCountry = topCountries[0]?.[1] ?? 1;
  const maxRegion = topRegions[0]?.[1] ?? 1;
  const maxCity = topCities[0]?.[1] ?? 1;

  // Compute view: returns Leaflet-format [lat, lng] center + leaflet zoom
  const view = useMemo<{ center: [number, number]; zoom: number }>(() => {
    if (focus) {
      const [lng, lat] = focus.coords;
      return { center: [lat, lng], zoom: toLeafletZoom(focus.zoom) };
    }
    if (level === 'region' && country) {
      // average city coords if we have any, else country centroid
      const cities = Object.values(cityAgg).filter((c) => c.geoN > 0);
      if (cities.length) {
        const lat = cities.reduce((s, c) => s + c.latSum / c.geoN, 0) / cities.length;
        const lng = cities.reduce((s, c) => s + c.lngSum / c.geoN, 0) / cities.length;
        return { center: [lat, lng], zoom: 7 };
      }
      if (COUNTRY_COORDS[country]) {
        const [lng, lat] = COUNTRY_COORDS[country];
        return { center: [lat, lng], zoom: 6 };
      }
    }
    if (level === 'country' && country) {
      const regions = Object.values(regionAgg).filter((r) => r.geoN > 0);
      if (regions.length) {
        const lat = regions.reduce((s, r) => s + r.latSum / r.geoN, 0) / regions.length;
        const lng = regions.reduce((s, r) => s + r.lngSum / r.geoN, 0) / regions.length;
        return { center: [lat, lng], zoom: 5 };
      }
      if (COUNTRY_COORDS[country]) {
        const [lng, lat] = COUNTRY_COORDS[country];
        return { center: [lat, lng], zoom: 5 };
      }
    }
    return { center: [20, 0], zoom: 2 };
  }, [level, country, focus, regionAgg, cityAgg]);

  const goWorld = () => { setLevel('world'); setCountry(null); setRegion(null); onClearFocus(); };
  const goCountry = (code: string) => { setCountry(code); setRegion(null); setLevel('country'); onClearFocus(); };
  const goRegion = (r: string) => { setRegion(r); setLevel('region'); onClearFocus(); };

  // Build marker list with REAL leaflet coords [lat, lng]
  type MarkerSpec = {
    key: string; pos: [number, number]; label: string; n: number; max: number; onClick?: () => void;
  };
  const markers: MarkerSpec[] = useMemo(() => {
    if (focus) {
      const [lng, lat] = focus.coords;
      return [{ key: 'focus', pos: [lat, lng], label: focus.label, n: 1, max: 1 }];
    }
    if (level === 'world') {
      return topCountries.slice(0, 50).map(([code, n]) => {
        const agg = countryAgg[code];
        let pos: [number, number] | null = null;
        if (agg && agg.geoN > 0) {
          pos = [agg.latSum / agg.geoN, agg.lngSum / agg.geoN];
        } else if (COUNTRY_COORDS[code]) {
          const [lng, lat] = COUNTRY_COORDS[code];
          pos = [lat, lng];
        }
        if (!pos) return null;
        return { key: code, pos, label: countryName(code), n, max: maxCountry, onClick: () => goCountry(code) };
      }).filter(Boolean) as MarkerSpec[];
    }
    if (level === 'country' && country) {
      const fallback = COUNTRY_COORDS[country];
      return topRegions.slice(0, 30).map(([r, n], i) => {
        const agg = regionAgg[r];
        let pos: [number, number];
        if (agg && agg.geoN > 0) {
          pos = [agg.latSum / agg.geoN, agg.lngSum / agg.geoN];
        } else if (fallback) {
          const angle = (i / Math.max(1, topRegions.length)) * Math.PI * 2;
          pos = [fallback[1] + Math.sin(angle) * 2, fallback[0] + Math.cos(angle) * 2];
        } else {
          pos = [0, 0];
        }
        return { key: r, pos, label: r, n, max: maxRegion, onClick: () => goRegion(r) };
      });
    }
    if (level === 'region' && country) {
      const fallback = COUNTRY_COORDS[country];
      return topCities.slice(0, 50).map(([city, n], i) => {
        const agg = cityAgg[city];
        let pos: [number, number];
        if (agg && agg.geoN > 0) {
          pos = [agg.latSum / agg.geoN, agg.lngSum / agg.geoN];
        } else if (fallback) {
          const angle = (i / Math.max(1, topCities.length)) * Math.PI * 2;
          pos = [fallback[1] + Math.sin(angle) * 1, fallback[0] + Math.cos(angle) * 1];
        } else {
          pos = [0, 0];
        }
        return { key: city, pos, label: city, n, max: maxCity };
      });
    }
    return [];
  }, [level, country, focus, topCountries, topRegions, topCities, countryAgg, regionAgg, cityAgg, maxCountry, maxRegion, maxCity]);

  // Bottom list
  const list = useMemo(() => {
    if (level === 'world') {
      return topCountries.slice(0, 12).map(([code, n]) => ({
        key: code, label: countryName(code), flag: flagEmoji(code), n, onClick: () => goCountry(code),
      }));
    }
    if (level === 'country') {
      return topRegions.slice(0, 12).map(([r, n]) => ({
        key: r, label: r, n, onClick: () => goRegion(r),
      } as { key: string; label: string; flag?: string; n: number; onClick?: () => void }));
    }
    return topCities.slice(0, 12).map(([c, n]) => ({ key: c, label: c, n } as { key: string; label: string; flag?: string; n: number; onClick?: () => void }));
  }, [level, topCountries, topRegions, topCities]);

  const breadcrumb = (
    <div className="flex items-center gap-1.5 text-xs text-white/55 flex-wrap">
      <button onClick={goWorld} className="hover:text-white transition">World</button>
      {country && (
        <>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => { setLevel('country'); setRegion(null); onClearFocus(); }} className="hover:text-white transition flex items-center gap-1">
            <span>{flagEmoji(country)}</span>{countryName(country)}
          </button>
        </>
      )}
      {region && (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/85">{region}</span>
        </>
      )}
      {focus && (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/85">{focus.label}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="admin-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-purple-300" /> Geographic listenership
          </h3>
          {(level !== 'world' || focus) && (
            <button
              onClick={goWorld}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white/70"
            >
              <ArrowLeft className="h-3 w-3" /> World
            </button>
          )}
        </div>
        <span className="text-xs text-white/45">{Object.keys(byCountry).length} countries</span>
      </div>

      <div className="mb-3">{breadcrumb}</div>

      <div className="relative rounded-xl overflow-hidden border border-white/5" style={{ height: 460 }}>
        <MapContainer
          center={view.center}
          zoom={view.zoom}
          minZoom={2}
          maxZoom={14}
          scrollWheelZoom
          worldCopyJump
          style={{ height: '100%', width: '100%', background: 'hsl(var(--admin-bg))' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ViewController center={view.center} zoom={view.zoom} />
          {markers.map((m) => {
            const radius = 5 + (m.n / m.max) * 16;
            return (
              <CircleMarker
                key={m.key}
                center={m.pos}
                radius={radius}
                pathOptions={{
                  color: 'hsl(330, 90%, 70%)',
                  weight: 1.2,
                  fillColor: 'hsl(270, 90%, 65%)',
                  fillOpacity: 0.55,
                }}
                eventHandlers={m.onClick ? { click: m.onClick } : undefined}
              >
                <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                  <div style={{ fontWeight: 600 }}>{m.label}</div>
                  <div style={{ opacity: 0.7 }}>
                    {m.n.toLocaleString()} listen{m.n === 1 ? '' : 's'}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-white/45 py-6 text-center">
          {level === 'country'
            ? 'No state/region data recorded for this country yet — new listens will appear here as soon as fans tune in.'
            : level === 'region'
              ? 'No city data recorded for this state yet.'
              : 'No data at this level yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {list.map((row) => (
            <button
              key={row.key}
              onClick={row.onClick}
              disabled={!row.onClick}
              className={`flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs transition ${
                row.onClick ? 'hover:bg-white/[0.09] cursor-pointer' : 'cursor-default'
              }`}
            >
              <span className="text-white/80 font-medium flex items-center gap-1.5 truncate">
                {row.flag && <span className="text-base leading-none">{row.flag}</span>}
                <span className="truncate">{row.label}</span>
              </span>
              <span className="tabular-nums text-white/85 ml-2">{row.n.toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeographicMap;
