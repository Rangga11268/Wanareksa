import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  FileText,
  Activity,
  Radio,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  Droplets,
  Flame,
  MapPin,
  CheckCircle2,
  Thermometer,
  Wind,
  CloudRain,
  ExternalLink,
  Satellite,
  Compass,
  BarChart3,
  TrendingUp,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
  Zap,
  RotateCcw,
  Copy,
  MessageSquare
} from 'lucide-react';
import { PRESET_AOIS, AOIRegion, HarmonizedWeekData, RawHotspot } from '../engine/harmonizer';
import { Language, translations } from '../data/translations';
import { PeatlandSimulator } from './PeatlandSimulator';
import { IconBadge } from './IconBadge';
import { ExecutiveReport } from './ExecutiveReport';
import { MitigationCharts } from './MitigationCharts';
import { LiveSyncResult } from '../services/nasaFirmsApi';
import { fetchLiveWeather, LiveWeatherData } from '../services/weatherApi';
import { resolveHotspotLocation } from '../utils/locationResolver';
import { getRegionalPeatProfile, calculateFireTriage } from '../data/regionalPeatProfiles';

interface MitigationHubProps {
  language: Language;
  selectedAOI: AOIRegion;
  onSelectAOI: (aoi: AOIRegion) => void;
  calendarMatrix?: Record<string, HarmonizedWeekData>;
  totalHotspots?: number;
  isLiveSync?: boolean;
  liveResult?: LiveSyncResult | null;
  liveHotspots?: RawHotspot[];
  isLoadingLive?: boolean;
  onRefreshLive?: () => void;
}

type FilterPill = 'all' | 'extreme_frp' | 'high_frp' | 'viirs' | 'modis';
const PAGE_SIZE = 24;

export const MitigationHub: React.FC<MitigationHubProps> = ({
  language,
  selectedAOI,
  onSelectAOI,
  calendarMatrix = {},
  totalHotspots = 0,
  isLiveSync = false,
  liveResult = null,
  liveHotspots = [],
  isLoadingLive = false,
  onRefreshLive,
}) => {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'charts' | 'hotspots' | 'sitrep'>('simulator');
  const [selectedTeamUnit, setSelectedTeamUnit] = useState<'manggala_agni' | 'mpa' | 'bpbd'>('manggala_agni');
  const [patrolDate, setPatrolDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);

  // Streamlined Smart Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterPill, setActiveFilterPill] = useState<FilterPill>('all');
  const [sortOrder, setSortOrder] = useState<'frp_desc' | 'confidence_desc' | 'time_desc'>('frp_desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCoord = (spotId: string, lat: number, lon: number) => {
    const text = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    navigator.clipboard.writeText(text);
    setCopiedId(spotId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fetch live weather when AOI changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingWeather(true);

    fetchLiveWeather(selectedAOI.center[0], selectedAOI.center[1], selectedAOI.id)
      .then((wData) => {
        if (isMounted) {
          setLiveWeather(wData);
          setIsLoadingWeather(false);
        }
      })
      .catch((err) => {
        console.warn('Mitigation weather error:', err);
        if (isMounted) setIsLoadingWeather(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedAOI]);

  // Reset pagination on filter or AOI change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAOI, searchQuery, activeFilterPill, sortOrder]);

  // Comprehensive Region Peatland Risk & Hydrology Profile (all 13 provinces)
  const currentRegionRisk = useMemo(() => {
    return getRegionalPeatProfile(selectedAOI.id);
  }, [selectedAOI.id]);

  // Current active live hotspots in this region
  const regionLiveSpots = useMemo(() => {
    return liveHotspots.filter(h => h.aoiId === selectedAOI.id || selectedAOI.id === 'indonesia');
  }, [liveHotspots, selectedAOI]);

  const activeSpotCount = isLiveSync ? regionLiveSpots.length : totalHotspots;
  const maxLiveFrp = regionLiveSpots.reduce((max, h) => (h.frp > max ? h.frp : max), 0);
  const effectiveFwi = liveWeather ? liveWeather.fwiScore : currentRegionRisk.fwi;

  // Streamlined filtering and sorting
  const filteredHotspots = useMemo(() => {
    let list = [...regionLiveSpots];

    // Quick Pill Filter
    if (activeFilterPill === 'extreme_frp') {
      list = list.filter(h => h.frp >= 50);
    } else if (activeFilterPill === 'high_frp') {
      list = list.filter(h => h.frp >= 25);
    } else if (activeFilterPill === 'viirs') {
      list = list.filter(h => h.instrument === 'VIIRS');
    } else if (activeFilterPill === 'modis') {
      list = list.filter(h => h.instrument === 'MODIS');
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(h => {
        const coordStr = `${h.lat.toFixed(4)}, ${h.lon.toFixed(4)}`;
        return (
          coordStr.includes(q) ||
          (h.satellite || '').toLowerCase().includes(q) ||
          (h.instrument || '').toLowerCase().includes(q) ||
          (h.time || '').includes(q)
        );
      });
    }

    // Sort Order
    if (sortOrder === 'frp_desc') {
      list.sort((a, b) => b.frp - a.frp);
    } else if (sortOrder === 'confidence_desc') {
      list.sort((a, b) => b.confidence - a.confidence);
    } else if (sortOrder === 'time_desc') {
      list.sort((a, b) => (b.time || '').localeCompare(a.time || ''));
    }

    return list;
  }, [regionLiveSpots, activeFilterPill, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredHotspots.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(totalPages, Math.max(1, currentPage));

  // Current page chunk
  const paginatedHotspots = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredHotspots.slice(start, start + PAGE_SIZE);
  }, [filteredHotspots, safeCurrentPage]);

  const hasActiveFilters = activeFilterPill !== 'all' || searchQuery.trim().length > 0 || sortOrder !== 'frp_desc';

  const handleResetFilters = () => {
    setActiveFilterPill('all');
    setSearchQuery('');
    setSortOrder('frp_desc');
  };

  const handleExportCSV = () => {
    const headers = 'ID,Latitude,Longitude,FRP_MW,Brightness_K,Instrument,Satellite,Confidence_Pct,Date,Time_UTC\n';
    const rows = filteredHotspots.map(h => 
      `${h.id},${h.lat},${h.lon},${h.frp},${h.brightness},${h.instrument},${h.satellite},${h.confidence},${h.date},${h.time}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NASA_Hotspots_${selectedAOI.id}_${filteredHotspots.length}_pts.csv`;
    link.click();
  };

  const handleDownloadDispatch = () => {
    const sortedSpots = [...regionLiveSpots].sort((a, b) => b.frp - a.frp);
    const topHotspots = sortedSpots.slice(0, 5).map((h, i) => {
      const loc = resolveHotspotLocation(h.lat, h.lon, selectedAOI.id, language);
      return `  ${i + 1}. [${h.instrument} ${h.satellite}] ${loc.regency}, ${loc.district || 'Sektor Gambut'} | Lat/Lon: ${h.lat.toFixed(4)}, ${h.lon.toFixed(4)} | FRP: ${h.frp} MW | Waktu: ${loc.localTimeFormatted}`;
    }).join('\n');

    const triage = calculateFireTriage(maxLiveFrp, currentRegionRisk.tmag, currentRegionRisk.isDeepPeat);
    const estimatedWaterLiters = Math.max(1, sortedSpots.length) * 45000;

    const directivesFormatted = currentRegionRisk.tacticalDirectives.map((d, idx) => `${idx + 1}. ${d}`).join('\n');

    const memo = `===============================================================
${language === 'id' ? 'MEMORANDUM PENUGASAN PATROLI LAPANGAN - WANAREKSA EARTH INTELLIGENCE' : 'FIELD PATROL DISPATCH MEMORANDUM - WANAREKSA EARTH INTELLIGENCE'}
NASA Space Apps Jakarta 2026 - ${language === 'id' ? 'Sistem Peringatan Dini Kebakaran Kubah Gambut' : 'Peatland Wildfire Early Warning & Mitigation System'}
===============================================================
${language === 'id' ? 'Tanggal Operasi' : 'Operation Date'}  : ${patrolDate}
${language === 'id' ? 'Wilayah Target' : 'Target Region'}   : ${selectedAOI.name} (${selectedAOI.country})
${language === 'id' ? 'Kesatuan Gambut' : 'Peat Landscape'}  : ${currentRegionRisk.khgName}
${language === 'id' ? 'Kedalaman Gambut' : 'Peat Depth'}     : ${currentRegionRisk.peatDepth}
${language === 'id' ? 'Koordinat Acuan' : 'Reference Coords'}: ${selectedAOI.center[0].toFixed(4)}° N, ${selectedAOI.center[1].toFixed(4)}° E
${language === 'id' ? 'Kondisi Cuaca' : 'Live Weather'}    : ${liveWeather ? `${liveWeather.temperature}°C, RH ${liveWeather.relativeHumidity}%, Angin ${liveWeather.windSpeedKmH} km/h` : 'Tersinkronisasi'}
${language === 'id' ? 'Status Triage' : 'Triage Status'}    : ${language === 'id' ? triage.labelId : triage.labelEn}
${language === 'id' ? 'Tinggi Air Tanah' : 'Groundwater Table'}: ${currentRegionRisk.tmag} cm (${language === 'id' ? 'Batas Kritis PP 57/2016' : 'National Limit'}: -40 cm)
${language === 'id' ? 'Kadar Air Gambut' : 'Peat Moisture'}  : ${currentRegionRisk.kag}% (${currentRegionRisk.kag < 100 ? 'KRITIS: Titik Sulut Api Gambut' : 'Waspada Dehidrasi'})
${language === 'id' ? 'Sekat Kanal Aktif' : 'Canal Blockings'}: ${currentRegionRisk.canalBlocks} ${language === 'id' ? 'Unit Terpasang' : 'Units Installed'}
${language === 'id' ? 'Sumber Air Terdekat' : 'Water Supply'} : ${currentRegionRisk.nearestWaterSource}
${language === 'id' ? 'Estimasi Kebutuhan Air' : 'Water Demand'} : ± ${estimatedWaterLiters.toLocaleString('id-ID')} Liter (Metode Suntik Gambut)
${language === 'id' ? 'Titik Api Terdeteksi' : 'Active Hotspots'}: ${activeSpotCount} ${language === 'id' ? 'titik terdeteksi satelit NASA' : 'detections (NASA satellite feed)'}
${maxLiveFrp > 0 ? `${language === 'id' ? 'Daya Termal Tertinggi' : 'Max Radiative Power'}: ${maxLiveFrp} MW\n` : ''}
${topHotspots ? `\n${language === 'id' ? 'KOORDINAT ANOMALI PANAS PRIORITAS TINGGI' : 'HIGH-PRIORITY HOTSPOT TARGETS'}:\n${topHotspots}\n` : ''}
${language === 'id' ? 'SATUAN KERJA DITUGASKAN' : 'ASSIGNED PATROL TASKFORCE'}:
- ${language === 'id' ? 'Unit Komando' : 'Command Unit'} : ${selectedTeamUnit === 'manggala_agni' ? (language === 'id' ? 'Brigade Manggala Agni Daops KLHK' : 'Manggala Agni Brigade (KLHK)') : selectedTeamUnit === 'mpa' ? (language === 'id' ? 'Masyarakat Peduli Api (MPA) Tingkat Desa' : 'Community Fire Patrol (MPA)') : (language === 'id' ? 'Satgas Karhutla BPBD / Damkar Daerah' : 'Disaster Management Agency (BPBD)')}
- ${language === 'id' ? 'Rekomendasi Regu' : 'Squad Advice'} : ${currentRegionRisk.recommendationSquad}

${language === 'id' ? 'INSTRUKSI TAKTIS LAPANGAN KHUSUS WILAYAH' : 'TACTICAL FIELD INSTRUCTIONS'}:
${directivesFormatted}

${language === 'id' ? 'Sumber Data: NASA FIRMS (MODIS 1km / VIIRS 375m) & Open-Meteo Telemetry Engine' : 'Data Sources: NASA FIRMS (MODIS 1km / VIIRS 375m) & Open-Meteo Telemetry Engine'}
===============================================================`;

    const blob = new Blob([memo], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dispatch_Briefing_${selectedAOI.id}_${patrolDate}.txt`;
    link.click();
  };

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Top Header & Live Situational Strip (Hidden in Print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#e5e5e7] dark:border-[#1f2937]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#9ca3af]">
              {language === 'id' ? 'Operasi & Mitigasi Lapangan' : 'Field Operations & Mitigation'}
            </span>
            {isLiveSync ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>NASA FIRMS 24H + OPEN-METEO LIVE</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold">
                <span>HISTORICAL 26-YR CLIMATOLOGY</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
            {t.mitigationHubTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#6e6e73] dark:text-[#9ca3af] max-w-2xl leading-relaxed">
            {language === 'id'
              ? 'Sistem aksi mitigasi taktis berbasis data satelit NASA & meteorologi real-time: simulasi hidrologi kubah gambut, grafik analitik cuaca 14 hari, pemantauan sekat kanal, dan pembuatan dokumen intelijen resmi.'
              : 'Actionable satellite & meteorological intelligence: peatland hydrology rewetting simulations, 14-day weather analytics, canal blocking management, and official intelligence dossiers.'}
          </p>
        </div>

        {/* Sub-view switcher - 2x2 on Mobile, 4x1 on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#e5e5ea] dark:bg-[#1f2937] rounded-xl p-1 gap-1 w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              activeSubTab === 'simulator'
                ? 'bg-white dark:bg-[#111827] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.subTabSimulator}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('charts')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              activeSubTab === 'charts'
                ? 'bg-white dark:bg-[#111827] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">{language === 'id' ? 'Grafik Prognosis' : 'Prognosis Charts'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hotspots')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              activeSubTab === 'hotspots'
                ? 'bg-white dark:bg-[#111827] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">{language === 'id' ? 'Titik Api' : 'Hotspots'}</span>
            {regionLiveSpots.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                {regionLiveSpots.length.toLocaleString()}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('sitrep')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              activeSubTab === 'sitrep'
                ? 'bg-white dark:bg-[#111827] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{language === 'id' ? 'Dokumen SitRep' : 'SitRep Dossier'}</span>
          </button>
        </div>
      </div>

      {/* 2. Region Quick Selector & Live Telemetry KPI Bar (Hidden in Print) */}
      <div className="print:hidden bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Space-Saving Sector Dropdown Selector */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#86868b] dark:text-[#9ca3af] uppercase shrink-0">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'id' ? 'Sektor Target:' : 'Target Sector:'}</span>
            </div>
            <div className="relative flex-1">
              <select
                id="mitigation-sector-select"
                name="mitigationSector"
                aria-label={language === 'id' ? 'Sektor Target' : 'Target Sector'}
                value={selectedAOI.id}
                onChange={(e) => {
                  const targetAOI = PRESET_AOIS.find((a) => a.id === e.target.value);
                  if (targetAOI) onSelectAOI(targetAOI);
                }}
                className="w-full appearance-none bg-[#f5f5f7] dark:bg-[#1a2333] border border-[#e5e5e7] dark:border-[#2d3748] rounded-xl px-3.5 py-2 pr-9 text-xs font-semibold text-[#1d1d1f] dark:text-white cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition shadow-2xs"
              >
                {PRESET_AOIS.map((aoi) => {
                  const aoiProfile = getRegionalPeatProfile(aoi.id);
                  const label = language === 'id' ? aoiProfile.shortLabelId : aoiProfile.shortLabelEn;
                  return (
                    <option key={aoi.id} value={aoi.id}>
                      {label} — {aoiProfile.khgName}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-[#86868b] dark:text-[#9ca3af] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Live Sync Trigger / Refresh */}
          {onRefreshLive && (
            <button
              onClick={onRefreshLive}
              disabled={isLoadingLive}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0 min-h-[38px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin' : ''}`} />
              <span>{isLoadingLive ? (language === 'id' ? 'Menyinkronkan...' : 'Syncing...') : (language === 'id' ? 'Sinkronkan Data Live' : 'Sync Live')}</span>
            </button>
          )}

        </div>

        {/* Live Weather & Hydrological Strip */}
        <div className="mt-4 pt-4 border-t border-[#e5e5e7] dark:border-[#1f2937] grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          
          <div className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#86868b] dark:text-[#9ca3af] uppercase font-bold tracking-wider block">
                {language === 'id' ? 'Titik Panas' : 'Hotspots'}
              </span>
              <IconBadge icon={Flame} variant="rose" size="sm" ping={activeSpotCount > 0} />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <strong className="text-lg font-bold text-[#1d1d1f] dark:text-white num">
                {activeSpotCount.toLocaleString()}
              </strong>
              <span className="text-[10px] text-[#6e6e73] dark:text-[#9ca3af]">
                {isLiveSync ? (language === 'id' ? '24 Jam Live' : '24h Live') : (language === 'id' ? 'Rerata' : 'Avg')}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#86868b] dark:text-[#9ca3af] uppercase font-bold tracking-wider block">
                {language === 'id' ? 'TMA Gambut' : 'Peat Table'}
              </span>
              <IconBadge icon={Droplets} variant={currentRegionRisk.tmag <= -40 ? 'rose' : 'emerald'} size="sm" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <strong className={`text-lg font-bold num ${currentRegionRisk.tmag <= -40 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {currentRegionRisk.tmag} cm
              </strong>
              <span className="text-[10px] text-[#86868b] dark:text-[#9ca3af]">
                (Limit: -40 cm)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#86868b] dark:text-[#9ca3af] uppercase font-bold tracking-wider block">
                {language === 'id' ? 'Suhu & Cuaca' : 'Temperature'}
              </span>
              <IconBadge icon={Wind} variant="sky" size="sm" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <strong className="text-lg font-bold text-[#1d1d1f] dark:text-white num">
                {isLoadingWeather ? '...' : `${liveWeather?.temperature ?? 32}°C`}
              </strong>
              <span className="text-[10px] text-[#6e6e73] dark:text-[#9ca3af]">
                RH {liveWeather?.relativeHumidity ?? 62}%
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#86868b] dark:text-[#9ca3af] uppercase font-bold tracking-wider block">
                {language === 'id' ? 'Indeks FWI' : 'FWI Risk'}
              </span>
              <IconBadge icon={AlertTriangle} variant="amber" size="sm" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <strong className="text-lg font-bold text-amber-600 dark:text-amber-400 num">
                {effectiveFwi}
              </strong>
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
                {currentRegionRisk.risk}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#86868b] dark:text-[#9ca3af] uppercase font-bold tracking-wider block">
                {language === 'id' ? 'Sekat Kanal' : 'Canal Dams'}
              </span>
              <IconBadge icon={CheckCircle2} variant="emerald" size="sm" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <strong className="text-lg font-bold text-[#1d1d1f] dark:text-white num">
                {currentRegionRisk.canalBlocks}
              </strong>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                {language === 'id' ? 'Unit' : 'Units'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Sub-View 1: Simulator & Patrol Planner */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Peatland Simulator Component with Live Weather Feed */}
          <PeatlandSimulator language={language} selectedAOI={selectedAOI} liveWeather={liveWeather} />

          {/* Quick Dispatch Order Generator Card */}
          <div className="bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e5e7] dark:border-[#1f2937]">
              <div>
                <h3 className="font-bold text-base text-[#1d1d1f] dark:text-white">
                  {language === 'id' ? 'Generator Surat Perintah Tugas Patroli (SPTP)' : 'Field Patrol Taskforce Dispatch Generator'}
                </h3>
                <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af] mt-0.5">
                  {language === 'id'
                    ? 'Buat instruksi penugasan resmi untuk Manggala Agni Daops, MPA Desa, atau BPBD sesuai koordinat titik panas satelit terkini.'
                    : 'Generate official dispatch orders for Manggala Agni brigades and community fire patrols based on real-time satellite coordinates.'}
                </p>
              </div>

              <button
                onClick={handleDownloadDispatch}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1d1d1f] hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer min-h-[40px] shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'id' ? 'Unduh Memorandum (.txt)' : 'Download Dispatch (.txt)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label htmlFor="mitigation-taskforce-select" className="font-semibold text-[#1d1d1f] dark:text-white block mb-1 cursor-pointer">
                  {language === 'id' ? 'Satuan Kerja Penerima Tugas:' : 'Assigned Taskforce Unit:'}
                </label>
                <select
                  id="mitigation-taskforce-select"
                  name="mitigationTaskforce"
                  aria-label={language === 'id' ? 'Satuan Kerja Penerima Tugas' : 'Assigned Taskforce Unit'}
                  value={selectedTeamUnit}
                  onChange={(e) => setSelectedTeamUnit(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                >
                  <option value="manggala_agni">
                    {language === 'id' ? 'Brigade Manggala Agni (KLHK)' : 'Manggala Agni Fire Brigade (KLHK)'}
                  </option>
                  <option value="mpa">
                    {language === 'id' ? 'Masyarakat Peduli Api (MPA Desa)' : 'Community Fire Care (MPA Village)'}
                  </option>
                  <option value="bpbd">
                    {language === 'id' ? 'Satgas Gabungan BPBD & Damkar' : 'Joint Disaster Agency (BPBD & Fire Dept)'}
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#1d1d1f] dark:text-white block mb-1">
                  {language === 'id' ? 'Tanggal Efektif Patroli:' : 'Effective Patrol Date:'}
                </label>
                <input
                  type="date"
                  value={patrolDate}
                  onChange={(e) => setPatrolDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1d1d1f] dark:text-white block mb-1">
                  {language === 'id' ? 'Wilayah Operasi:' : 'Operational Sector:'}
                </label>
                <div className="px-3 py-2 rounded-xl bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white font-bold flex items-center justify-between">
                  <span>{selectedAOI.name}</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">READY</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Sub-View 2: Charts & Visual Analytics Suite */}
      {activeSubTab === 'charts' && (
        <div className="animate-in fade-in duration-150">
          <MitigationCharts
            language={language}
            selectedAOI={selectedAOI}
            liveWeather={liveWeather}
            liveHotspots={regionLiveSpots}
            currentTmat={currentRegionRisk.tmag}
            effectiveTmat={Math.min(0, currentRegionRisk.tmag + 12)}
          />
        </div>
      )}

      {/* Sub-View 3: Streamlined & Unified Hotspot Explorer */}
      {activeSubTab === 'hotspots' && (
        <div className="bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          
          {/* Header & Quick Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e5e7] dark:border-[#1f2937]">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-white">
                {language === 'id' ? 'Daftar Titik Panas Satelit' : 'Active Satellite Hotspots'}
              </h3>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#f5f5f7] dark:bg-[#151d2f] text-[#1d1d1f] dark:text-white border border-[#e5e5e7] dark:border-[#1f2937]">
                {filteredHotspots.length.toLocaleString()} {language === 'id' ? 'titik' : 'pts'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 border border-rose-200 dark:border-rose-900 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{language === 'id' ? 'Reset Filter' : 'Reset'}</span>
                </button>
              )}

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl bg-[#f5f5f7] dark:bg-[#151d2f] hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] text-[#1d1d1f] dark:text-white text-xs font-semibold flex items-center gap-1.5 border border-[#e5e5e7] dark:border-[#1f2937] transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Unified Clean Filter Bar (Search + Quick Chips + Sort) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 text-xs">
            
            {/* Quick Filter Pill Chips */}
            <div className="flex flex-wrap items-center gap-1.5 scrollbar-none">
              {[
                { id: 'all', label: language === 'id' ? 'Semua' : 'All' },
                { id: 'extreme_frp', label: language === 'id' ? 'FRP Ekstrem (≥50MW)' : 'Extreme (≥50MW)' },
                { id: 'high_frp', label: language === 'id' ? 'FRP Tinggi (≥25MW)' : 'High (≥25MW)' },
                { id: 'viirs', label: 'VIIRS 375m' },
                { id: 'modis', label: 'MODIS 1km' },
              ].map((chip) => {
                const isActive = activeFilterPill === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setActiveFilterPill(chip.id as FilterPill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[32px] ${
                      isActive
                        ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#111827] shadow-xs'
                        : 'bg-[#f5f5f7] dark:bg-[#151d2f] text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white border border-[#e5e5e7] dark:border-[#1f2937]'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Right: Search Box + Sort Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search Box with Clear Button */}
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 text-[#86868b] dark:text-[#9ca3af] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari koordinat, satelit...' : 'Search coordinates...'}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white placeholder-[#86868b] dark:placeholder-[#9ca3af] text-xs focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sort Order Button Toggle */}
              <button
                onClick={() => {
                  if (sortOrder === 'frp_desc') setSortOrder('time_desc');
                  else if (sortOrder === 'time_desc') setSortOrder('confidence_desc');
                  else setSortOrder('frp_desc');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#f5f5f7] dark:bg-[#151d2f] hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer min-h-[32px] shrink-0"
                title="Ganti Urutan Sort"
              >
                <ArrowUpDown className="w-3 h-3 text-[#86868b]" />
                <span>
                  {sortOrder === 'frp_desc' ? 'FRP ↓' : sortOrder === 'time_desc' ? (language === 'id' ? 'Waktu ↓' : 'Time ↓') : 'Keyakinan ↓'}
                </span>
              </button>
            </div>

          </div>

          {/* Hotspots Grid Rendering (24 items per page) */}
          {filteredHotspots.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#86868b] dark:text-[#9ca3af]">
              {language === 'id'
                ? 'Tidak ada anomali titik panas yang cocok dengan filter saat ini.'
                : 'No active thermal anomalies matched the current filters.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {paginatedHotspots.map((spot) => {
                const loc = resolveHotspotLocation(spot.lat, spot.lon, selectedAOI.id, language);
                const isHighFRP = spot.frp >= 25;

                return (
                  <div
                    key={spot.id}
                    className="p-3.5 rounded-xl border border-[#e5e5e7] dark:border-[#1f2937] bg-[#fbfbfd] dark:bg-[#151d2f] hover:border-[#0071e3] transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isHighFRP ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                          <h4 className="font-bold text-xs text-[#1d1d1f] dark:text-white">
                            {loc.regency}{loc.district ? `, ${loc.district}` : ''}
                          </h4>
                        </div>
                        <span className="text-[10px] text-[#86868b] dark:text-[#9ca3af] block mt-0.5 line-clamp-1">
                          {loc.landscape}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white shrink-0">
                        {spot.instrument} ({spot.satellite})
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[11px] pt-1.5 border-t border-[#e5e5e7] dark:border-[#1f2937]">
                      <div>
                        <span className="text-[9px] text-[#86868b] block">{language === 'id' ? 'Radiasi Termal' : 'FRP'}</span>
                        <strong className={`font-mono ${isHighFRP ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-[#1d1d1f] dark:text-white'}`}>
                          {spot.frp} MW
                        </strong>
                      </div>

                      <div>
                        <span className="text-[9px] text-[#86868b] block">{language === 'id' ? 'Keyakinan' : 'Confidence'}</span>
                        <strong className="font-mono text-[#1d1d1f] dark:text-white">
                          {spot.confidence}%
                        </strong>
                      </div>

                      <div>
                        <span className="text-[9px] text-[#86868b] block">{language === 'id' ? 'Waktu Deteksi' : 'Acquired'}</span>
                        <strong className="font-mono text-[#1d1d1f] dark:text-white text-[10px]">
                          {loc.localTimeFormatted}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-1 text-[10px] border-t border-[#e5e5e7] dark:border-[#1f2937]">
                      <button
                        onClick={() => handleCopyCoord(spot.id, spot.lat, spot.lon)}
                        className={`inline-flex items-center gap-1 font-mono px-2 py-1 rounded-md border transition cursor-pointer ${
                          copiedId === spot.id
                            ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                            : 'bg-white dark:bg-[#111827] text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white border-[#e5e5e7] dark:border-[#1f2937]'
                        }`}
                        title="Salin Koordinat GPS"
                      >
                        {copiedId === spot.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-white" />
                            <span>{t.copiedTooltip}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{spot.lat.toFixed(4)}°, {spot.lon.toFixed(4)}°</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        {/* WhatsApp Dispatch Button */}
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            language === 'id'
                              ? `🚨 *DISPOSISI DARURAT TITIK PANAS WANAREKSA*\n` +
                                `Wilayah: ${selectedAOI.name} (${loc.regency}${loc.district ? `, ${loc.district}` : ''})\n` +
                                `Koordinat: ${spot.lat.toFixed(5)}, ${spot.lon.toFixed(5)}\n` +
                                `FRP: ${spot.frp} MW | Sensor: ${spot.instrument} (${spot.satellite})\n` +
                                `Keyakinan: ${spot.confidence}% | Waktu: ${loc.localTimeFormatted}\n` +
                                `Google Maps: ${loc.googleMapsUrl}\n` +
                                `Instruksi: Segera kerahkan tim pemadaman darat Manggala Agni / MPA ke lokasi.`
                              : `🚨 *WANAREKSA RAPID WILDFIRE DISPATCH*\n` +
                                `Region: ${selectedAOI.name} (${loc.regency}${loc.district ? `, ${loc.district}` : ''})\n` +
                                `Coordinates: ${spot.lat.toFixed(5)}, ${spot.lon.toFixed(5)}\n` +
                                `FRP: ${spot.frp} MW | Sensor: ${spot.instrument} (${spot.satellite})\n` +
                                `Confidence: ${spot.confidence}% | Time: ${loc.localTimeFormatted}\n` +
                                `Google Maps: ${loc.googleMapsUrl}\n` +
                                `Instruction: Urgent field deployment required for ground suppression.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 font-semibold transition cursor-pointer"
                          title={language === 'id' ? 'Kirim Disposisi WhatsApp' : 'Dispatch via WhatsApp'}
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WA</span>
                        </a>

                        {/* Google Maps Link */}
                        <a
                          href={loc.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0071e3]/10 dark:bg-[#38bdf8]/10 text-[#0071e3] dark:text-[#38bdf8] hover:bg-[#0071e3]/20 border border-[#0071e3]/20 font-semibold transition"
                          title={language === 'id' ? 'Buka Navigasi Google Maps' : 'Open in Google Maps'}
                        >
                          <span>Maps</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Navigation Controls */}
          {filteredHotspots.length > 0 && (
            <div className="pt-4 border-t border-[#e5e5e7] dark:border-[#1f2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[#86868b] dark:text-[#9ca3af]">
                {language === 'id'
                  ? `Menampilkan ${(safeCurrentPage - 1) * PAGE_SIZE + 1} – ${Math.min(filteredHotspots.length, safeCurrentPage * PAGE_SIZE)} dari ${filteredHotspots.length.toLocaleString()} titik`
                  : `Showing ${(safeCurrentPage - 1) * PAGE_SIZE + 1} – ${Math.min(filteredHotspots.length, safeCurrentPage * PAGE_SIZE)} of ${filteredHotspots.length.toLocaleString()} hotspots`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="px-3 py-1.5 rounded-xl bg-[#f5f5f7] dark:bg-[#151d2f] hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] text-[#1d1d1f] dark:text-white border border-[#e5e5e7] dark:border-[#1f2937] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{language === 'id' ? 'Sebelumnya' : 'Previous'}</span>
                </button>

                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] font-mono font-bold text-[#1d1d1f] dark:text-white">
                  {safeCurrentPage} / {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="px-3 py-1.5 rounded-xl bg-[#f5f5f7] dark:bg-[#151d2f] hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] text-[#1d1d1f] dark:text-white border border-[#e5e5e7] dark:border-[#1f2937] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition cursor-pointer"
                >
                  <span>{language === 'id' ? 'Berikutnya' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Sub-View 4: Executive Situation Report Dossier (A4 Print Ready) */}
      {activeSubTab === 'sitrep' && (
        <div className="animate-in fade-in duration-150">
          <ExecutiveReport
            language={language}
            selectedAOI={selectedAOI}
            onSelectAOI={onSelectAOI}
            calendarMatrix={calendarMatrix}
            totalHotspots={activeSpotCount}
            liveWeather={liveWeather}
            liveHotspots={regionLiveSpots}
          />
        </div>
      )}

    </div>
  );
};
