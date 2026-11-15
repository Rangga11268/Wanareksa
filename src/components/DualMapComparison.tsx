import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AOIRegion, RawHotspot } from '../engine/harmonizer';
import { Language, translations } from '../data/translations';
import { resolveHotspotLocation, getIndonesianLocalTime } from '../utils/locationResolver';
import { Split, RefreshCw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DualMapComparisonProps {
  language: Language;
  selectedAOI: AOIRegion;
  allHotspots: RawHotspot[];
}

export const DualMapComparison: React.FC<DualMapComparisonProps> = ({
  language,
  selectedAOI,
  allHotspots,
}) => {
  const t = translations[language];
  const [yearA, setYearA] = useState<number>(2015);
  const [yearB, setYearB] = useState<number>(2021);
  const [isSyncMove, setIsSyncMove] = useState<boolean>(true);
  const [basemap, setBasemap] = useState<'satellite' | 'dark' | 'nasa_truecolor' | 'nasa_bands721'>('satellite');

  const mapARef = useRef<HTMLDivElement>(null);
  const mapBRef = useRef<HTMLDivElement>(null);
  const leafletMapA = useRef<L.Map | null>(null);
  const leafletMapB = useRef<L.Map | null>(null);
  const tileLayerARef = useRef<L.TileLayer | null>(null);
  const tileLayerBRef = useRef<L.TileLayer | null>(null);
  const canvasRendererA = useRef<L.Canvas | null>(null);
  const canvasRendererB = useRef<L.Canvas | null>(null);
  const layerGroupA = useRef<L.LayerGroup | null>(null);
  const layerGroupB = useRef<L.LayerGroup | null>(null);

  const getTileUrl = (bm: 'satellite' | 'dark' | 'nasa_truecolor' | 'nasa_bands721', yr: number) => {
    if (bm === 'nasa_truecolor') {
      const dStr = `${yr}-09-15`;
      return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${dStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
    }
    if (bm === 'nasa_bands721') {
      const dStr = `${yr}-09-15`;
      return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_Bands721/default/${dStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
    }
    if (bm === 'dark') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    }
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  };

  // Filter hotspots for year A and year B
  const hotspotsA = useMemo(() => {
    const yStr = String(yearA);
    return allHotspots.filter((h) => h.date && h.date.startsWith(yStr));
  }, [allHotspots, yearA]);

  const hotspotsB = useMemo(() => {
    const yStr = String(yearB);
    return allHotspots.filter((h) => h.date && h.date.startsWith(yStr));
  }, [allHotspots, yearB]);

  // Statistics
  const statsA = useMemo(() => {
    const count = hotspotsA.length;
    const totalFrp = hotspotsA.reduce((sum, h) => sum + h.frp, 0);
    const avgConfidence = count > 0 ? Math.round(hotspotsA.reduce((s, h) => s + (h.confidence || 80), 0) / count) : 0;
    return { count, totalFrp: Math.round(totalFrp), avgConfidence };
  }, [hotspotsA]);

  const statsB = useMemo(() => {
    const count = hotspotsB.length;
    const totalFrp = hotspotsB.reduce((sum, h) => sum + h.frp, 0);
    const avgConfidence = count > 0 ? Math.round(hotspotsB.reduce((s, h) => s + (h.confidence || 80), 0) / count) : 0;
    return { count, totalFrp: Math.round(totalFrp), avgConfidence };
  }, [hotspotsB]);

  // Initialize Maps
  useEffect(() => {
    const INDONESIA_BOUNDS: L.LatLngBoundsExpression = [
      [-11.5, 94.0],
      [6.5, 141.5],
    ];

    const timer = setTimeout(() => {
      if (mapARef.current && !leafletMapA.current) {
        const canvasA = L.canvas({ padding: 0.5 });
        canvasRendererA.current = canvasA;

        const mapA = L.map(mapARef.current, {
          center: selectedAOI.center,
          zoom: selectedAOI.zoom,
          minZoom: 4,
          maxZoom: 18,
          maxBounds: INDONESIA_BOUNDS,
          maxBoundsViscosity: 1.0,
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true,
          renderer: canvasA,
        });

        tileLayerARef.current = L.tileLayer(getTileUrl(basemap, yearA), {
          maxZoom: 18,
        }).addTo(mapA);

        layerGroupA.current = L.layerGroup().addTo(mapA);
        leafletMapA.current = mapA;
      }

      if (mapBRef.current && !leafletMapB.current) {
        const canvasB = L.canvas({ padding: 0.5 });
        canvasRendererB.current = canvasB;

        const mapB = L.map(mapBRef.current, {
          center: selectedAOI.center,
          zoom: selectedAOI.zoom,
          minZoom: 4,
          maxZoom: 18,
          maxBounds: INDONESIA_BOUNDS,
          maxBoundsViscosity: 1.0,
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true,
          renderer: canvasB,
        });

        tileLayerBRef.current = L.tileLayer(getTileUrl(basemap, yearB), {
          maxZoom: 18,
        }).addTo(mapB);

        layerGroupB.current = L.layerGroup().addTo(mapB);
        leafletMapB.current = mapB;
      }

      // Synchronize pan and zoom
      if (leafletMapA.current && leafletMapB.current) {
        const mapA = leafletMapA.current;
        const mapB = leafletMapB.current;

        const onMoveA = () => {
          if (!isSyncMove) return;
          mapB.setView(mapA.getCenter(), mapA.getZoom(), { animate: false });
        };
        const onMoveB = () => {
          if (!isSyncMove) return;
          mapA.setView(mapB.getCenter(), mapB.getZoom(), { animate: false });
        };

        mapA.on('move', onMoveA);
        mapB.on('move', onMoveB);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (leafletMapA.current) {
        leafletMapA.current.off();
        leafletMapA.current.remove();
        leafletMapA.current = null;
        tileLayerARef.current = null;
      }
      if (leafletMapB.current) {
        leafletMapB.current.off();
        leafletMapB.current.remove();
        leafletMapB.current = null;
        tileLayerBRef.current = null;
      }
    };
  }, [selectedAOI, isSyncMove]);

  // Synchronize dynamic basemap switches
  useEffect(() => {
    if (leafletMapA.current) {
      if (tileLayerARef.current) leafletMapA.current.removeLayer(tileLayerARef.current);
      tileLayerARef.current = L.tileLayer(getTileUrl(basemap, yearA), { maxZoom: 18 }).addTo(leafletMapA.current);
    }
    if (leafletMapB.current) {
      if (tileLayerBRef.current) leafletMapB.current.removeLayer(tileLayerBRef.current);
      tileLayerBRef.current = L.tileLayer(getTileUrl(basemap, yearB), { maxZoom: 18 }).addTo(leafletMapB.current);
    }
  }, [basemap, yearA, yearB]);

  // Re-center when AOI changes
  useEffect(() => {
    if (leafletMapA.current) {
      leafletMapA.current.setView(selectedAOI.center, selectedAOI.zoom);
    }
    if (leafletMapB.current) {
      leafletMapB.current.setView(selectedAOI.center, selectedAOI.zoom);
    }
  }, [selectedAOI]);

  // Update Map Markers
  useEffect(() => {
    if (!leafletMapA.current || !layerGroupA.current) return;
    layerGroupA.current.clearLayers();

    hotspotsA.forEach((h) => {
      const radius = Math.min(12, Math.max(4, Math.sqrt(h.frp) * 0.8));
      const color = h.frp > 150 ? '#dc2626' : h.frp > 50 ? '#ea580c' : '#d97706';

      const circle = L.circleMarker([h.lat, h.lon], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.75,
        renderer: canvasRendererA.current || undefined,
      });

      const loc = resolveHotspotLocation(h.lat, h.lon, selectedAOI.id, language);
      const localTime = getIndonesianLocalTime(h.date, h.time, h.lon);

      circle.bindPopup(
        `<div class="hotspot-popup">
          <div class="hotspot-popup-title" style="margin-bottom:2px;">${h.instrument} (${h.satellite})</div>
          <div class="hotspot-popup-regency" style="margin-bottom:3px;">${loc.regency}</div>
          <div class="hotspot-popup-landscape" style="margin-bottom:4px;">${loc.landscape}</div>
          <div class="hotspot-popup-card" style="font-size:11px;margin-bottom:4px;padding:6px;">
            <div class="hotspot-popup-text-strong"><b>${language === 'id' ? 'Koordinat' : 'Coords'}:</b> <span style="font-family:monospace">${h.lat.toFixed(4)}&deg;, ${h.lon.toFixed(4)}&deg;</span></div>
            <div class="hotspot-popup-text-muted"><b>${language === 'id' ? 'Waktu' : 'Time'}:</b> ${localTime.timeFormatted} (${h.date})</div>
            <div class="hotspot-popup-text-strong"><b>${language === 'id' ? 'Daya Termal' : 'Thermal Power'}:</b> ${Math.round(h.frp)} MW</div>
          </div>
          <a href="${loc.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="hotspot-popup-link" style="font-size:10.5px;">
            ${language === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}
          </a>
        </div>`,
        { maxWidth: 260 }
      );
      circle.addTo(layerGroupA.current!);
    });
  }, [hotspotsA, selectedAOI, language]);

  useEffect(() => {
    if (!leafletMapB.current || !layerGroupB.current) return;
    layerGroupB.current.clearLayers();

    hotspotsB.forEach((h) => {
      const radius = Math.min(12, Math.max(4, Math.sqrt(h.frp) * 0.8));
      const color = h.frp > 150 ? '#dc2626' : h.frp > 50 ? '#ea580c' : '#d97706';

      const circle = L.circleMarker([h.lat, h.lon], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.75,
        renderer: canvasRendererB.current || undefined,
      });

      const loc = resolveHotspotLocation(h.lat, h.lon, selectedAOI.id, language);
      const localTime = getIndonesianLocalTime(h.date, h.time, h.lon);

      circle.bindPopup(
        `<div class="hotspot-popup">
          <div class="hotspot-popup-title" style="margin-bottom:2px;">${h.instrument} (${h.satellite})</div>
          <div class="hotspot-popup-regency" style="margin-bottom:3px;">${loc.regency}</div>
          <div class="hotspot-popup-landscape" style="margin-bottom:4px;">${loc.landscape}</div>
          <div class="hotspot-popup-card" style="font-size:11px;margin-bottom:4px;padding:6px;">
            <div class="hotspot-popup-text-strong"><b>${language === 'id' ? 'Koordinat' : 'Coords'}:</b> <span style="font-family:monospace">${h.lat.toFixed(4)}&deg;, ${h.lon.toFixed(4)}&deg;</span></div>
            <div class="hotspot-popup-text-muted"><b>${language === 'id' ? 'Waktu' : 'Time'}:</b> ${localTime.timeFormatted} (${h.date})</div>
            <div class="hotspot-popup-text-strong"><b>${language === 'id' ? 'Daya Termal' : 'Thermal Power'}:</b> ${Math.round(h.frp)} MW</div>
          </div>
          <a href="${loc.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="hotspot-popup-link" style="font-size:10.5px;">
            ${language === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'}
          </a>
        </div>`,
        { maxWidth: 260 }
      );
      circle.addTo(layerGroupB.current!);
    });
  }, [hotspotsB, selectedAOI, language]);

  const years = Array.from({ length: 27 }, (_, i) => 2000 + i);

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl shadow-xs overflow-hidden transition-colors">
      
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-[#e5e5e7] dark:border-[#1f2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbfbfd] dark:bg-[#0f172a]">
        <div>
          <div className="flex items-center gap-2">
            <Split className="w-4 h-4 text-[#0071e3] dark:text-blue-400" />
            <h2 className="font-bold text-base text-[#1d1d1f] dark:text-white">
              {language === 'id' ? 'Komparasi Spasial Dua Titik Waktu (Side-by-Side)' : 'Side-by-Side Dual Year Spatial Comparison'}
            </h2>
          </div>
          <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af] mt-1">
            {language === 'id'
              ? `Bandingkan sebaran titik panas di ${selectedAOI.name} antara dua tahun berbeda dengan sinkronisasi navigasi peta otomatis.`
              : `Compare hotspot distributions in ${selectedAOI.name} between two years with locked synchronous map navigation.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Basemap Switcher */}
          <div className="flex items-center bg-[#f5f5f7] dark:bg-[#1f2937] p-1 rounded-xl border border-[#e5e5e7] dark:border-[#374151] text-xs font-semibold">
            <button
              onClick={() => setBasemap('satellite')}
              aria-label={language === 'id' ? 'Basemap Satelit HD' : 'HD Satellite Basemap'}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer min-h-[30px] ${
                basemap === 'satellite'
                  ? 'bg-sky-700 text-white font-bold shadow-xs'
                  : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              {language === 'id' ? 'Satelit HD' : 'Sat HD'}
            </button>
            <button
              onClick={() => setBasemap('dark')}
              aria-label={language === 'id' ? 'Basemap Kanvas Gelap' : 'Dark Canvas Basemap'}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer min-h-[30px] ${
                basemap === 'dark'
                  ? 'bg-sky-700 text-white font-bold shadow-xs'
                  : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              {language === 'id' ? 'Kanvas Gelap' : 'Dark'}
            </button>
            <button
              onClick={() => setBasemap('nasa_truecolor')}
              aria-label={language === 'id' ? 'Basemap NASA GIBS TrueColor' : 'NASA GIBS TrueColor Basemap'}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer min-h-[30px] flex items-center gap-1 ${
                basemap === 'nasa_truecolor'
                  ? 'bg-sky-700 text-white font-bold shadow-xs'
                  : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
              title={language === 'id' ? 'NASA GIBS TrueColor (Citra Satelit MODIS per Tahun)' : 'NASA Global Imagery Browse Services (MODIS TrueColor per Year)'}
            >
              <span>NASA True</span>
            </button>
            <button
              onClick={() => setBasemap('nasa_bands721')}
              aria-label={language === 'id' ? 'Basemap NASA GIBS FalseColor Bands 7-2-1' : 'NASA GIBS FalseColor Bands 7-2-1'}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer min-h-[30px] flex items-center gap-1 ${
                basemap === 'nasa_bands721'
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
              title={language === 'id' ? 'NASA GIBS FalseColor Bands 7-2-1 (Menembus Asap & Bekas Kebakaran)' : 'NASA GIBS FalseColor Bands 7-2-1 (Smoke Cutter & Burn Scars)'}
            >
              <span>7-2-1</span>
            </button>
          </div>

          <button
            onClick={() => setIsSyncMove(!isSyncMove)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
              isSyncMove
                ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#111827] border-[#1d1d1f] dark:border-white'
                : 'bg-white dark:bg-[#1f2937] text-[#6e6e73] dark:text-[#9ca3af] border-[#e5e5e7] dark:border-[#374151] hover:border-[#1d1d1f] dark:hover:border-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>
              {isSyncMove
                ? language === 'id' ? 'Sinkron Gerak Aktif' : 'Sync Move Locked'
                : language === 'id' ? 'Sinkron Lepas' : 'Independent Move'}
            </span>
          </button>
        </div>
      </div>

      {/* Dual Viewport Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-[#e5e5e7] dark:border-[#1f2937]">
        
        {/* Pane A */}
        <div className="border-b lg:border-b-0 lg:border-r border-[#e5e5e7] dark:border-[#1f2937] flex flex-col min-h-[380px] sm:min-h-[440px]">
          {/* Controls Bar A */}
          <div className="bg-white dark:bg-[#111827] px-4 py-3 border-b border-[#e5e5e7] dark:border-[#1f2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="dual-map-year-a" className="text-xs font-bold text-[#86868b] dark:text-[#9ca3af] uppercase cursor-pointer">
                {language === 'id' ? 'Tahun A:' : 'Year A:'}
              </label>
              <select
                id="dual-map-year-a"
                name="yearA"
                aria-label={language === 'id' ? 'Pilih Tahun Komparasi A' : 'Select Comparison Year A'}
                value={yearA}
                onChange={(e) => setYearA(Number(e.target.value))}
                className="bg-[#f5f5f7] dark:bg-[#1f2937] border border-[#e5e5e7] dark:border-[#374151] rounded-lg px-3 py-1.5 text-xs font-bold text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#1d1d1f] dark:focus:border-white cursor-pointer min-h-[36px]"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-[#1f2937] text-[#1d1d1f] dark:text-white">
                    {y} {y === 2015 ? (language === 'id' ? '(El Niño Super)' : '(Super El Niño)') : y === 2019 ? (language === 'id' ? '(El Niño Moderat)' : '(Moderate El Niño)') : y === 2021 ? (language === 'id' ? '(La Niña Basah)' : '(Wet La Niña)') : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-[#86868b] dark:text-[#9ca3af]">{language === 'id' ? 'Titik: ' : 'Points: '}</span>
                <strong className="num text-[#1d1d1f] dark:text-white">{statsA.count.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[#86868b] dark:text-[#9ca3af]">FRP: </span>
                <strong className="num text-orange-600 dark:text-orange-400">{statsA.totalFrp.toLocaleString()} MW</strong>
              </div>
            </div>
          </div>

          {/* Map Container A */}
          <div ref={mapARef} className="flex-1 w-full h-full min-h-[320px]" />
        </div>

        {/* Pane B */}
        <div className="flex flex-col min-h-[380px] sm:min-h-[440px]">
          {/* Controls Bar B */}
          <div className="bg-white dark:bg-[#111827] px-4 py-3 border-b border-[#e5e5e7] dark:border-[#1f2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="dual-map-year-b" className="text-xs font-bold text-[#86868b] dark:text-[#9ca3af] uppercase cursor-pointer">
                {language === 'id' ? 'Tahun B:' : 'Year B:'}
              </label>
              <select
                id="dual-map-year-b"
                name="yearB"
                aria-label={language === 'id' ? 'Pilih Tahun Komparasi B' : 'Select Comparison Year B'}
                value={yearB}
                onChange={(e) => setYearB(Number(e.target.value))}
                className="bg-[#f5f5f7] dark:bg-[#1f2937] border border-[#e5e5e7] dark:border-[#374151] rounded-lg px-3 py-1.5 text-xs font-bold text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#1d1d1f] dark:focus:border-white cursor-pointer min-h-[36px]"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-[#1f2937] text-[#1d1d1f] dark:text-white">
                    {y} {y === 2015 ? (language === 'id' ? '(El Niño Super)' : '(Super El Niño)') : y === 2019 ? (language === 'id' ? '(El Niño Moderat)' : '(Moderate El Niño)') : y === 2021 ? (language === 'id' ? '(La Niña Basah)' : '(Wet La Niña)') : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-[#86868b] dark:text-[#9ca3af]">{language === 'id' ? 'Titik: ' : 'Points: '}</span>
                <strong className="num text-[#1d1d1f] dark:text-white">{statsB.count.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[#86868b] dark:text-[#9ca3af]">FRP: </span>
                <strong className="num text-orange-600 dark:text-orange-400">{statsB.totalFrp.toLocaleString()} MW</strong>
              </div>
            </div>
          </div>

          {/* Map Container B */}
          <div ref={mapBRef} className="flex-1 w-full h-full min-h-[320px]" />
        </div>

      </div>

      {/* Comparative Analytical Summary Footer */}
      <div className="px-5 py-3.5 bg-[#fbfbfd] dark:bg-[#0f172a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-[#3a3a3c] dark:text-[#d1d5db] leading-relaxed">
          <strong className="font-semibold text-[#1d1d1f] dark:text-white">
            {language === 'id' ? 'Kesimpulan Analisis Spasial: ' : 'Spatial Synthesis: '}
          </strong>
          {statsA.count > statsB.count ? (
            <span>
              {language === 'id'
                ? `Tahun ${yearA} mengalami aktivitas pembakaran ${(statsA.count - statsB.count).toLocaleString()} titik lebih banyak dibandingkan ${yearB} (+${Math.round(((statsA.count - statsB.count) / Math.max(1, statsB.count)) * 100)}%).`
                : `Year ${yearA} recorded ${(statsA.count - statsB.count).toLocaleString()} more fire detections than ${yearB} (+${Math.round(((statsA.count - statsB.count) / Math.max(1, statsB.count)) * 100)}%).`}
            </span>
          ) : (
            <span>
              {language === 'id'
                ? `Tahun ${yearB} mengalami aktivitas pembakaran ${(statsB.count - statsA.count).toLocaleString()} titik lebih banyak dibandingkan ${yearA} (+${Math.round(((statsB.count - statsA.count) / Math.max(1, statsA.count)) * 100)}%).`
                : `Year ${yearB} recorded ${(statsB.count - statsA.count).toLocaleString()} more fire detections than ${yearA} (+${Math.round(((statsB.count - statsA.count) / Math.max(1, statsA.count)) * 100)}%).`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[#86868b] dark:text-[#9ca3af] text-[11px] shrink-0">
          <span>Grid: 5.5 km Harmonized</span>
          <span>MODIS + VIIRS Data Sync</span>
        </div>
      </div>

    </div>
  );
};
