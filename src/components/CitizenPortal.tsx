import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AOIRegion, PRESET_AOIS, RawHotspot } from '../engine/harmonizer';
import { Language } from '../data/translations';
import { resolveHotspotLocation, getIndonesianLocalTime } from '../utils/locationResolver';
import { fetchLiveWeather, LiveWeatherData } from '../services/weatherApi';
import {
  ShieldAlert,
  Wind,
  MapPin,
  Send,
  Droplets,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Copy,
  Info,
  Layers,
  Sparkles,
  Maximize2,
  Locate,
  Activity,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Radio,
  FileText,
  Bell
} from 'lucide-react';
import { IconBadge } from './IconBadge';

interface CitizenPortalProps {
  language: Language;
  selectedAOI: AOIRegion;
  onSelectAOI: (aoi: AOIRegion) => void;
  hotspots: RawHotspot[];
  isLiveSync: boolean;
  onSwitchToScience: () => void;
  onOpenBriefing?: () => void;
  onOpenAlertModal?: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  language,
  selectedAOI,
  onSelectAOI,
  hotspots,
  isLiveSync,
  onSwitchToScience,
  onOpenBriefing,
  onOpenAlertModal,
}) => {
  const isIndo = language === 'id';
  const [reportType, setReportType] = useState<'asap' | 'bara' | 'parit_kering'>('bara');
  const [userLocationNote, setUserLocationNote] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [activeInfoTab, setActiveInfoTab] = useState<'health' | 'stewardship'>('health');

  // Filter hotspots for selected region
  const regionalHotspots = useMemo(() => {
    return hotspots.filter((h) => h.aoiId === selectedAOI.id);
  }, [hotspots, selectedAOI]);

  const activeCount = regionalHotspots.length;

  // Determine Layperson Danger Status Tier
  const threatTier = useMemo(() => {
    if (activeCount === 0) {
      return {
        level: 'safe',
        badge: isIndo ? 'AMAN' : 'SAFE',
        title: isIndo ? 'Gambut Basah, Risiko Rendah' : 'Peatlands Moist, Risk Low',
        desc: isIndo
          ? 'Kondisi kubah gambut terpantau memiliki kelembapan aman. Muka air parit terjaga dan tidak ada titik panas aktif.'
          : 'Peatland soil retains safe moisture levels. Canals are well-watered and no active fires detected.',
        advice: isIndo
          ? 'Pertahankan pintu sekat kanal tetap tertutup agar air tidak surut.'
          : 'Keep canal blocks closed to retain water levels.',
        aqi: isIndo ? '15 - 35 (Baik)' : '15 - 35 (Good)',
        maskNeeded: false,
        themeColor: '#10B981',
      };
    } else if (activeCount <= 25) {
      return {
        level: 'advisory',
        badge: isIndo ? 'WASPADA KERING' : 'DRY ADVISORY',
        title: isIndo ? 'Kemarau Terik, Parit Mulai Surut' : 'Dry Spell, Canals Receding',
        desc: isIndo
          ? `Terdeteksi ${activeCount} titik panas di kawasan gambut. Muka air parit mulai mendekati ambang batas kritis -40 cm.`
          : `${activeCount} thermal hotspots detected. Canal water levels dropping toward critical -40 cm limit.`,
        advice: isIndo
          ? 'DILARANG membakar sampah pekarangan. Basahi parit kebun jika tanah terasa hangat.'
          : 'Do not burn yard waste. Wet perimeter ditches if soil feels warm.',
        aqi: isIndo ? '55 - 85 (Sedang)' : '55 - 85 (Moderate)',
        maskNeeded: false,
        themeColor: '#F59E0B',
      };
    } else if (activeCount <= 120) {
      return {
        level: 'warning',
        badge: isIndo ? 'BAHAYA BARA & ASAP' : 'SMOKE & FIRE WARNING',
        title: isIndo ? 'Bara Gambut Bawah Tanah Aktif' : 'Active Peat Smoldering Underground',
        desc: isIndo
          ? `Terdeteksi ${activeCount} titik kebakaran gambut. Asap pekat dan bau sangit mulai menjalar terbawa angin.`
          : `${activeCount} active peat fire points. Smoke plume is drifting toward residential zones.`,
        advice: isIndo
          ? 'Tutup ventilasi rumah. Anak-anak dan lansia wajib kenakan masker N95 jika beraktivitas di luar.'
          : 'Seal windows and vents. Vulnerable groups must wear N95 respirators outdoors.',
        aqi: isIndo ? '110 - 180 (Tidak Sehat)' : '110 - 180 (Unhealthy)',
        maskNeeded: true,
        themeColor: '#F97316',
      };
    } else {
      return {
        level: 'danger',
        badge: isIndo ? 'DARURAT KABUT ASAP' : 'HAZE EMERGENCY',
        title: isIndo ? 'Krisis Asap Gambut Ekstrem' : 'Severe Peat Haze Emergency',
        desc: isIndo
          ? `Krisis kebakaran gambut (${activeCount} titik terkonfirmasi satelit NASA). Partikel PM2.5 menembus udara ruangan.`
          : `Severe fire crisis (${activeCount} NASA fire detections). Toxic PM2.5 particulates penetrating indoor air.`,
        advice: isIndo
          ? 'Wajib masker N95/KN95. Buat ruang bebas asap dengan kain basah di celah pintu dan ventilasi.'
          : 'N95 masks mandatory. Create a smoke-safe room using damp towels on door gaps and vents.',
        aqi: isIndo ? '220 - 450+ (Sangat Berbahaya)' : '220 - 450+ (Hazardous)',
        maskNeeded: true,
        themeColor: '#EF4444',
      };
    }
  }, [activeCount, isIndo]);

  // Request GPS Location for WhatsApp Dispatch
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert(isIndo ? 'Fitur GPS tidak didukung di perangkat ini' : 'Geolocation is not supported by your browser');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
        alert(isIndo ? 'Tidak dapat membaca lokasi GPS. Pastikan izin lokasi aktif di browser.' : 'Unable to retrieve GPS coordinates.');
      },
      { timeout: 10000 }
    );
  };

  // WhatsApp Pre-filled SitRep Generator
  const waReportText = useMemo(() => {
    const reportLabel =
      reportType === 'asap'
        ? (isIndo ? 'Asap Pekat / Bau Sangit Menyengat' : 'Heavy Smoke / Acrid Smoldering Smell')
        : reportType === 'bara'
        ? (isIndo ? 'Bara Gambut Bawah Tanah (Tanah Panas Berasap)' : 'Subsurface Smoldering Peat (Ground Hot & Smoking)')
        : (isIndo ? 'Parit Kering Kritis (< -40 cm PP 71/2014)' : 'Dry Canal Below Statutory Threshold (< -40 cm)');

    const locationText = coords
      ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} (Google Maps: https://maps.google.com/?q=${coords.lat.toFixed(5)},${coords.lng.toFixed(5)})`
      : userLocationNote || (isIndo ? 'Koordinat GPS menyusul / Belum terdeteksi' : 'GPS coordinates pending');

    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    if (isIndo) {
      return `*🚨 LAPORAN SITUASI DARURAT GAMBUT (WANAREKSA)*
*Waktu:* ${timestamp} WIB
*Wilayah Pantauan:* ${selectedAOI.name}
*Jenis Kejadian:* ${reportLabel}
*Lokasi / Koordinat:* ${locationText}
*Kondisi Lapangan:* ${userLocationNote || 'Membutuhkan pengecekan darurat tim Manggala Agni / BPBD setempat.'}
*Tindakan Dimohon:* Mohon verifikasi regu pemadam terdekat dan persiapkan nozzle tombak injeksi air bawah tanah.
_Dilaporkan via Portal Warga Wanareksa (NASA Space Apps 2026)_`;
    }

    return `*🚨 PEAT FIRE CITIZEN SITREP (WANAREKSA)*
*Timestamp:* ${timestamp} WIB
*Observation Zone:* ${selectedAOI.name}
*Incident Type:* ${reportLabel}
*Location / Coordinates:* ${locationText}
*Field Note:* ${userLocationNote || 'Urgent verification required by nearest local fire brigade.'}
*Action Requested:* Please dispatch nearest patrol with deep lance injection nozzle.
_Reported via Wanareksa Citizen Portal (NASA Space Apps 2026)_`;
  }, [reportType, coords, userLocationNote, selectedAOI, isIndo]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(waReportText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(waReportText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Live Weather Integration
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchLiveWeather(selectedAOI.center[0], selectedAOI.center[1], selectedAOI.id).then((data) => {
      if (isMounted) setLiveWeather(data);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedAOI]);

  // Leaflet Map Ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: selectedAOI.center,
      zoom: selectedAOI.zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High quality dark satellite canvas
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
    }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Map Center on AOI change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(selectedAOI.center, selectedAOI.zoom);
    }
  }, [selectedAOI]);

  // Render Hotspot Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Limit rendered points to prevent UI lag
    const spotsToRender = regionalHotspots.slice(0, 80);

    spotsToRender.forEach((h) => {
      const isSevere = h.frp >= 40 || h.brightness >= 335;
      const markerColor = isSevere ? '#EF4444' : '#F59E0B';

      const circle = L.circleMarker([h.lat, h.lon], {
        radius: isSevere ? 6 : 4,
        fillColor: markerColor,
        color: '#FFFFFF',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85,
      });

      const loc = resolveHotspotLocation(h.lat, h.lon, selectedAOI.id, language);
      const localTime = getIndonesianLocalTime(h.date, h.time, h.lon);

      const titlePopup = isSevere
        ? (language === 'id' ? '🔥 BARA GAMBUT KRITIS' : '🔥 CRITICAL PEAT FIRE')
        : (language === 'id' ? '⚠️ TITIK PANAS TERDETEKSI' : '⚠️ DETECTED HOTSPOT');
      const labelLocation = language === 'id' ? 'Lokasi' : 'Location';
      const labelTime = language === 'id' ? 'Waktu' : 'Time';
      const gmapsText = language === 'id' ? '📍 Buka di Google Maps &rarr;' : '📍 Open in Google Maps &rarr;';

      circle.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; color: #0F172A; min-width: 200px;">
          <div style="font-weight: 800; color: ${markerColor}; margin-bottom: 4px;">
            ${titlePopup}
          </div>
          <div><strong>FRP:</strong> ${Math.round(h.frp)} MW</div>
          <div><strong>${labelLocation}:</strong> ${loc.district || loc.regency}, ${loc.province}</div>
          <div><strong>${labelTime}:</strong> ${localTime}</div>
          <a href="${loc.googleMapsUrl}" target="_blank" style="display: inline-block; margin-top: 6px; color: #0284C7; font-weight: 700; text-decoration: none;">
            ${gmapsText}
          </a>
        </div>
      `);

      circle.addTo(layerGroup);
    });
  }, [regionalHotspots, selectedAOI, language]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* 0. LIVE PEAT EMERGENCY ALERT TICKER & QUICK DISPATCH BAR */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-500/40 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
        <div className="flex items-center gap-3">
          <IconBadge icon={AlertTriangle} variant="rose" size="lg" ping />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 uppercase">
                {isIndo ? 'Status Siaga Darurat' : 'Active Peat Alert'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {isIndo ? '3 Wilayah Kubah Gambut Siaga 1' : '3 Critical Dome Zones Monitored'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
              {isIndo
                ? 'Peringatan Dini: Penurunan Muka Air Tanah < -40 cm (PP 71/2014) di KHG Riau & Titik Panas Termal Aktif.'
                : 'Early Warning: Groundwater < -40 cm statutory deficit in Riau Peat Dome with active FIRMS thermal anomalies.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenAlertModal && (
            <button
              onClick={onOpenAlertModal}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Buka Pusat Siaga (3 Titik)' : 'View 3 Active Alerts'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. TOP CONTROL & CONTEXT DOCK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <IconBadge icon={ShieldCheck} variant="emerald" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                {isIndo ? 'MODE WARGA • AKSI CEPAT' : 'CITIZEN ACTION HUD'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isIndo ? 'Pantau Keamanan Asap & Laporkan Titik Api' : 'Smoke Safety & Peat Fire Dispatch'}
            </h1>
          </div>
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          {[
            { id: 'riau', name: 'Riau' },
            { id: 'kalteng', name: 'Kalteng' },
            { id: 'sumsel', name: 'Sumsel' },
            { id: 'indonesia', name: 'Nasional' },
          ].map((item) => {
            const isSelected = selectedAOI.id === item.id;
            const aoiObj = PRESET_AOIS.find((a) => a.id === item.id);
            return (
              <button
                key={item.id}
                onClick={() => aoiObj && onSelectAOI(aoiObj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THE MAIN ACTION & MAP DUAL HERO (ABOVE THE FOLD) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: CITIZEN REPORT & SAFETY DISPATCH (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 p-6 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 shadow-xs">
          
          {/* Status Traffic Light Banner */}
          <div
            className="p-4 rounded-xl border flex items-start gap-3.5"
            style={{
              backgroundColor: `${threatTier.themeColor}10`,
              borderColor: `${threatTier.themeColor}35`,
            }}
          >
            <IconBadge
              icon={threatTier.level === 'safe' ? ShieldCheck : threatTier.level === 'danger' ? ShieldAlert : Flame}
              variant={threatTier.level === 'danger' ? 'rose' : threatTier.level === 'safe' ? 'emerald' : 'amber'}
              size="lg"
              ping={threatTier.level === 'danger'}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono font-extrabold tracking-wider uppercase"
                  style={{ color: threatTier.themeColor }}
                >
                  {threatTier.badge}
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {selectedAOI.name}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {threatTier.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {threatTier.desc}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar (AQI & Wind) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isIndo ? 'Prediksi Kualitas Udara' : 'Air Quality Index'}
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {threatTier.aqi}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                {threatTier.maskNeeded
                  ? (isIndo ? '⚠️ Wajib Masker N95' : '⚠️ N95 Mask Required')
                  : (isIndo ? '✅ Masker tidak mendesak' : '✅ Mask optional')}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isIndo ? 'Arah & Kecepatan Angin' : 'Wind & Smoke Drift'}
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <IconBadge icon={Wind} variant="sky" size="sm" />
                <span>{liveWeather ? `${liveWeather.windSpeedKmH} km/h` : '12.4 km/h'}</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-mono">
                {liveWeather?.windDirectionDeg 
                  ? (isIndo ? `Arah ${liveWeather.windDirectionDeg}°` : `Heading ${liveWeather.windDirectionDeg}°`) 
                  : (isIndo ? 'Arah Tenggara (120°)' : 'SE Wind (120°)')}
              </div>
            </div>
          </div>

          {/* 1-Tap Geolocation Trigger */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isIndo ? '1. Posisi Anda di Lapangan' : '1. Your Field Position'}
              </span>
              <button
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Locate className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
                <span>{isGettingLocation ? (isIndo ? 'Mencari...' : 'Locating...') : (isIndo ? 'Deteksi GPS Saya' : 'Get GPS')}</span>
              </button>
            </div>

            {coords ? (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                <span>📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-bold">TERKUNCI</span>
              </div>
            ) : (
              <input
                type="text"
                placeholder={isIndo ? 'Atau ketik nama desa / patokan parit...' : 'Or enter village name / canal landmark...'}
                value={userLocationNote}
                onChange={(e) => setUserLocationNote(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            )}
          </div>

          {/* Situation Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isIndo ? '2. Jenis Kejadian yang Dilihat' : '2. Incident Type Observed'}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bara', label: isIndo ? 'Bara Gambut' : 'Smoldering', icon: Flame },
                { id: 'asap', label: isIndo ? 'Asap Pekat' : 'Dense Smoke', icon: Wind },
                { id: 'parit_kering', label: isIndo ? 'Parit Kering' : 'Dry Canal', icon: Droplets },
              ].map((item) => {
                const isSelected = reportType === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setReportType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <IconBadge
                      icon={Icon}
                      variant={item.id === 'bara' ? 'rose' : item.id === 'asap' ? 'amber' : 'sky'}
                      size="sm"
                    />
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button: WhatsApp Dispatch */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{isIndo ? 'KIRIM LAPORAN KE POSKO WHATSAPP' : 'SEND DISPATCH VIA WHATSAPP'}</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? (isIndo ? 'Teks Laporan Tersalin!' : 'Report Copied!') : (isIndo ? 'Salin Teks Laporan' : 'Copy Report Text')}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE PEAT SENTINEL MAP (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs relative">
          
          {/* Map Top Bar Overlay */}
          <div className="p-4 bg-white/90 dark:bg-[#0E1626]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isIndo ? 'Peta Pantau Satelit NASA FIRMS' : 'NASA FIRMS Satellite Observation'}
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-medium">
                {activeCount} {isIndo ? 'Titik Terpantau' : 'Points'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 font-medium">
              <span>{isIndo ? 'Resolusi: 375m VIIRS' : 'Resolution: 375m VIIRS'}</span>
            </div>
          </div>

          {/* Leaflet Map Canvas (Height 480px, Immediately Visible) */}
          <div className="relative w-full h-[480px] lg:h-full min-h-[440px]">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Overlaid Symbology HUD */}
            <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-white text-xs z-10 space-y-1.5 shadow-lg">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                {isIndo ? 'LEGENDA TITIK API' : 'HOTSPOT SYMBOLOGY'}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>{isIndo ? 'Bara Kritis (≥ 40 MW)' : 'Critical Smoldering (≥ 40 MW)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{isIndo ? 'Titik Panas Gambut' : 'Peat Hotspot'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRACTICAL VILLAGE STEWARDSHIP & HEALTH ADVISORY (CLEAN TABS) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isIndo ? 'Panduan Aksi Komunitas Desa & Perlindungan Warga' : 'Community Action & Health Guidelines'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isIndo
                ? 'Langkah nyata pencegahan kebakaran kubah gambut sesuai amanat PP 71/2014 dan perlindungan ISPA.'
                : 'Actionable steps for peatland preservation and family smoke defense.'}
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveInfoTab('health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeInfoTab === 'health'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isIndo ? 'Kesehatan Asap PM2.5' : 'Smoke Health'}
            </button>
            <button
              onClick={() => setActiveInfoTab('stewardship')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeInfoTab === 'stewardship'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isIndo ? 'Jaga Gambut Basah (PP 71)' : 'Wet Peat (PP 71)'}
            </button>
          </div>
        </div>

        {activeInfoTab === 'health' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {isIndo ? '01 • MASKER TEPAT' : '01 • RESPIRATORY DEFENSE'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isIndo ? 'Gunakan Masker N95 / KN95' : 'Wear N95 / KN95 Masks'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isIndo
                  ? 'Partikel asap gambut berukuran < 2.5 mikron tidak dapat disaring oleh masker kain atau bedah. Prioritaskan masker N95 untuk anak dan lansia.'
                  : 'Peat smoke PM2.5 particulates easily penetrate regular cloth and surgical masks. Prioritize fitted N95 respirators for children and seniors.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {isIndo ? '02 • RUANG BEBAS ASAP' : '02 • CLEAN AIR HAVEN'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isIndo ? 'Tutup Celah Rumah dengan Kain Basah' : 'Seal Doors and Windows with Damp Towels'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isIndo
                  ? 'Pasang kain basah pada ventilasi dan celah pintu saat bau sangit tercium tajam. Ember air di sudut ruangan membantu mengikat abu layang.'
                  : 'Place damp cloth towels across ventilation gaps and under doorways when acrid haze is detected to prevent fine ash ingress.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {isIndo ? '03 • JAM KRITIS PAGI HARI' : '03 • MORNING INVERSION PEAK'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isIndo ? 'Inversi Suhu Udara Pukul 06:00 - 09:00' : 'Thermal Inversion from 06:00 to 09:00'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isIndo
                  ? 'Udara dingin di pagi hari menahan partikel asap pekat dekat tanah. Hindari aktivitas olahraga atau membuka pintu lebar sebelum siang.'
                  : 'Cool ground temperatures trap concentrated smoke near the soil surface. Postpone outdoor exertion until afternoon winds circulate air.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">
                {isIndo ? 'PASAL 23 PP 71/2014' : 'ARTICLE 23 GOV REG 71/2014'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isIndo ? 'Jaga Muka Air Tanah > -40 cm' : 'Maintain Peat Groundwater Table > -40 cm'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isIndo
                  ? 'Jika air parit surut lebih dari 40 cm dari permukaan tanah, kapiler gambut mengering dan rentan terbakar seperti spons bensin.'
                  : 'When drainage ditches cause groundwater to recede beyond -40 cm, porous peat layers dry out and ignite like fuel sponges.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">
                {isIndo ? 'PINTU SEKAT KANAL' : 'CANAL SLUICE GATES'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isIndo ? 'Tutup Sekat Kanal Menjelang Kemarau' : 'Lock Canal Sluice Gates Ahead of Dry Season'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isIndo
                  ? 'Pastikan sekat kanal tidak bocor agar cadangan air kubah gambut tertahan di dalam tanah dan membasahi perakaran secara alami.'
                  : 'Ensure canal blocks remain sealed to keep hydrostatic pressure within the peat dome and naturally hydrate root zones.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">
                {isIndo ? 'INJEKSI NOZZLE TOMBAK' : 'SUB-SURFACE NOZZLE INJECTION'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isIndo ? 'Padamkan Bara Bawah Tanah, Bukan Permukaan' : 'Suppress Subsurface Smoldering, Not Surface Flame'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isIndo
                  ? 'Penyemprotan permukaan hanya memboroskan air karena menguap. Gunakan tombak pipa berlubang untuk menyuntikkan air ke kedalaman 1–1.5 meter.'
                  : 'Spraying surface ash wastes water through rapid evaporation. Insert perforated metal lance nozzles 1–1.5m deep to extinguish peat embers.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. CALL TO ACTION FOR SCIENTISTS & NASA JUDGES */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            {isIndo ? 'UNTUK PENELITI & JURI NASA SPACE APPS' : 'FOR RESEARCHERS & NASA SPACE APPS JUDGES'}
          </div>
          <div className="text-sm font-semibold text-slate-200">
            {isIndo
              ? 'Ingin melihat analisis spasial mendalam, kalibrasi MODIS/VIIRS 26 tahun, atau model FDRS?'
              : 'Explore deep geospatial analytics, 26-year MODIS/VIIRS calibration, or fire weather indices?'}
          </div>
        </div>

        <button
          onClick={onSwitchToScience}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <span>{isIndo ? 'Buka Mode Riset & Satgas' : 'Launch Science & Satgas Mode'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
