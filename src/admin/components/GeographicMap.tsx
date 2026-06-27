import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Globe2, ChevronRight, ArrowLeft } from 'lucide-react';
import { COUNTRY_COORDS, flagEmoji, toCountryCode, countryName } from '../lib/countries';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type Listen = {
  country?: string | null;
  region?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type FocusTarget = {
  coords: [number, number];
  zoom: number;
  label: string;
} | null;

interface Props {
  listens: Listen[];
  focus: FocusTarget;
  onClearFocus: () => void;
}

type Level = 'world' | 'country' | 'region';

const groupBy = <T,>(arr: T[], keyFn: (x: T) => string | null) => {
  const map: Record<string, number> = {};
  arr.forEach((x) => {
    const k = keyFn(x);
    if (!k) return;
    map[k] = (map[k] || 0) + 1;
  });
  return map;
};

type GeoAgg = Record<string, { n: number; latSum: number; lngSum: number; geoN: number }>;
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


const GeographicMap: React.FC<Props> = ({ listens, focus, onClearFocus }) => {
  const [level, setLevel] = useState<Level>('world');
  const [country, setCountry] = useState<string | null>(null); // ISO-2
  const [region, setRegion] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; label: string; n: number } | null>(null);

  // Always normalise listens with an ISO-2 country code
  const normalised = useMemo(
    () => listens.map((l) => ({ ...l, code: toCountryCode(l.country) })),
    [listens],
  );

  // Counts at each level
  const byCountry = useMemo(() => groupBy(normalised, (l) => l.code), [normalised]);
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
  const byRegion = useMemo(() => Object.fromEntries(Object.entries(regionAgg).map(([k, v]) => [k, v.n])), [regionAgg]);
  const byCity = useMemo(() => Object.fromEntries(Object.entries(cityAgg).map(([k, v]) => [k, v.n])), [cityAgg]);

  const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]);
  const topRegions = Object.entries(byRegion).sort((a, b) => b[1] - a[1]);
  const topCities = Object.entries(byCity).sort((a, b) => b[1] - a[1]);

  const maxCountry = topCountries[0]?.[1] ?? 1;
  const maxRegion = topRegions[0]?.[1] ?? 1;
  const maxCity = topCities[0]?.[1] ?? 1;

  // Map view config
  const view = useMemo(() => {
    if (focus) return { center: focus.coords, zoom: focus.zoom };
    if (level === 'country' && country && COUNTRY_COORDS[country]) {
      return { center: COUNTRY_COORDS[country], zoom: 4 };
    }
    if (level === 'region' && country && COUNTRY_COORDS[country]) {
      return { center: COUNTRY_COORDS[country], zoom: 5 };
    }
    return { center: [0, 20] as [number, number], zoom: 1 };
  }, [level, country, focus]);

  const goWorld = () => { setLevel('world'); setCountry(null); setRegion(null); onClearFocus(); };
  const goCountry = (code: string) => { setCountry(code); setRegion(null); setLevel('country'); onClearFocus(); };
  const goRegion = (r: string) => { setRegion(r); setLevel('region'); onClearFocus(); };

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

  // Determine which markers to draw
  const markers = useMemo(() => {
    if (focus) return [{ key: 'focus', coords: focus.coords, label: focus.label, n: 1, max: 1 }];
    if (level === 'world') {
      return topCountries.slice(0, 30).map(([code, n]) => {
        const c = COUNTRY_COORDS[code];
        if (!c) return null;
        return { key: code, coords: c, label: countryName(code), n, max: maxCountry, onClick: () => goCountry(code) };
      }).filter(Boolean) as any[];
    }
    if (level === 'country' && country && COUNTRY_COORDS[country]) {
      const [lon, lat] = COUNTRY_COORDS[country];
      return topRegions.slice(0, 20).map(([r, n], i) => {
        const agg = regionAgg[r];
        let coords: [number, number];
        if (agg && agg.geoN > 0) {
          coords = [agg.lngSum / agg.geoN, agg.latSum / agg.geoN];
        } else {
          const angle = (i / Math.max(1, topRegions.length)) * Math.PI * 2;
          const radius = 4;
          coords = [lon + Math.cos(angle) * radius, lat + Math.sin(angle) * radius];
        }
        return { key: r, coords, label: r, n, max: maxRegion, onClick: () => goRegion(r) };
      });
    }
    if (level === 'region' && country && COUNTRY_COORDS[country]) {
      const [lon, lat] = COUNTRY_COORDS[country];
      return topCities.slice(0, 30).map(([city, n], i) => {
        const agg = cityAgg[city];
        let coords: [number, number];
        if (agg && agg.geoN > 0) {
          coords = [agg.lngSum / agg.geoN, agg.latSum / agg.geoN];
        } else {
          const angle = (i / Math.max(1, topCities.length)) * Math.PI * 2;
          const radius = 2;
          coords = [lon + Math.cos(angle) * radius, lat + Math.sin(angle) * radius];
        }
        return { key: city, coords, label: city, n, max: maxCity };
      });
    }
    return [];
  }, [level, country, focus, topCountries, topRegions, topCities, maxCountry, maxRegion, maxCity, regionAgg, cityAgg]);

  // Bottom list — depends on level
  const list: { key: string; label: string; flag?: string; n: number; onClick?: () => void }[] = useMemo(() => {
    if (level === 'world') {
      return topCountries.slice(0, 12).map(([code, n]) => ({
        key: code, label: countryName(code), flag: flagEmoji(code), n, onClick: () => goCountry(code),
      }));
    }
    if (level === 'country') {
      return topRegions.slice(0, 12).map(([r, n]) => ({
        key: r, label: r, n, onClick: () => goRegion(r),
      }));
    }
    return topCities.slice(0, 12).map(([c, n]) => ({ key: c, label: c, n }));
  }, [level, topCountries, topRegions, topCities]);

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

      <div className="relative rounded-xl overflow-hidden bg-[hsl(var(--admin-bg)/0.6)] border border-white/5">
        <ComposableMap
          projectionConfig={{ scale: 155 }}
          width={980}
          height={460}
          style={{ width: '100%', height: 'auto', background: 'transparent' }}
        >
          <ZoomableGroup center={view.center} zoom={view.zoom}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: any) =>
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill: 'hsl(var(--admin-glass) / 0.9)', stroke: 'hsl(var(--admin-glass-border) / 0.25)', strokeWidth: 0.4, outline: 'none' },
                      hover:   { fill: 'hsl(var(--admin-purple) / 0.35)', outline: 'none', cursor: 'pointer' },
                      pressed: { fill: 'hsl(var(--admin-purple) / 0.5)', outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
            {markers.map((m: any) => {
              const r = 3 + (m.n / m.max) * 14;
              const handleMove = (e: React.MouseEvent) =>
                setHover({ x: e.clientX, y: e.clientY, label: m.label, n: m.n });
              return (
                <Marker
                  key={m.key}
                  coordinates={m.coords}
                  onClick={m.onClick}
                >
                  <g
                    onMouseEnter={handleMove}
                    onMouseMove={handleMove}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: m.onClick ? 'pointer' : 'default', pointerEvents: 'all' }}
                  >
                    {/* invisible larger hit-area so the cursor reliably triggers hover */}
                    <circle r={Math.max(r + 6, 10)} fill="transparent" />
                    <circle r={r} fill="hsl(var(--admin-purple))" fillOpacity={0.55} stroke="hsl(var(--admin-pink))" strokeWidth={1.2} />
                    <circle r={2} fill="hsl(var(--admin-pink))" />
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {hover && (() => {
          const flipX = hover.x + 200 > window.innerWidth;
          const flipY = hover.y + 80 > window.innerHeight;
          return (
            <div
              className="pointer-events-none fixed z-50 px-2.5 py-1.5 rounded-md bg-black/90 border border-white/15 text-xs text-white shadow-2xl backdrop-blur-sm whitespace-nowrap"
              style={{
                left: flipX ? hover.x - 12 : hover.x + 14,
                top: flipY ? hover.y - 12 : hover.y + 14,
                transform: `translate(${flipX ? '-100%' : '0'}, ${flipY ? '-100%' : '0'})`,
              }}
            >
              <div className="font-medium">{hover.label}</div>
              <div className="text-white/60">{hover.n.toLocaleString()} listen{hover.n === 1 ? '' : 's'}</div>
            </div>
          );
        })()}
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
