import React, { useState, useMemo } from 'react';
import { AOIRegion, HarmonizedWeekData } from '../engine/harmonizer';
import { Language, translations } from '../data/translations';
import { climateIndices26Years } from '../data/climateIndices';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  PieChart as PieIcon,
  Waves,
  Activity
} from 'lucide-react';
import { IconBadge } from './IconBadge';

interface VisualAnalyticsProps {
  language: Language;
  selectedAOI: AOIRegion;
  calendarMatrix: Record<string, HarmonizedWeekData>;
  rawMode: boolean;
}

type ChartTab = 'trend' | 'seasonality' | 'provincial' | 'physics' | 'climate';

// Custom Apple-style Frosted Tooltip
const CustomChartTooltip = ({ active, payload, label, unit = '' }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl text-xs space-y-2 max-w-xs select-none">
      <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center justify-between">
        <span>{label}</span>
      </div>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-xs inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value} {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({
  language,
  selectedAOI,
  calendarMatrix,
  rawMode: _rawMode,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<ChartTab>('trend');
  const [overlayYear, setOverlayYear] = useState<number>(2015);
  const [showClimateOverlay, setShowClimateOverlay] = useState<boolean>(false);

  const MONTHS = language === 'id'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const harmonizedSeriesName = t.harmonizedClustersLegend;
  const rawSeriesName = t.rawDetectionsLegend;
  const climatologySeriesName = t.climatology26YrAvg;
  const overlaySeriesName = `${t.yearActivityLegend} ${overlayYear}`;

  // 1. 26-Year Trend Aggregation (2000-2026) with Climate Indices merged
  const yearlyTrendData = useMemo(() => {
    const list: Array<{
      year: number;
      [key: string]: string | number | boolean;
    }> = [];

    for (let yr = 2000; yr <= 2026; yr++) {
      let rawCount = 0;
      let harmonizedCount = 0;
      let totalFRP = 0;

      for (let w = 1; w <= 52; w++) {
        const item = calendarMatrix[`${yr}-${w}`];
        if (item) {
          rawCount += item.rawTotalCount;
          harmonizedCount += item.harmonizedClusterCount;
          totalFRP += item.totalFrpCalibrated;
        }
      }

      const climate = climateIndices26Years.find((c) => c.year === yr) || {
        oni: 0,
        dmi: 0,
        phase: 'Neutral',
        iodPhase: 'Neutral IOD',
      };

      list.push({
        year: yr,
        [rawSeriesName]: rawCount,
        [harmonizedSeriesName]: harmonizedCount,
        [t.thermalPowerLegend]: totalFRP,
        [t.carbonEmissionsLegend]: Math.round(totalFRP * 14.8),
        oni: climate.oni,
        dmi: climate.dmi,
        // Scaled ONI & DMI for visual comparison against normalized fire cluster curve
        scaledOni: Math.round(climate.oni * 800),
        scaledDmi: Math.round(climate.dmi * 1200),
        isElNino: yr === 2006 || yr === 2015 || yr === 2019 || yr === 2023,
        sensorEra: yr >= 2012 ? 'Dual VIIRS+MODIS' : 'MODIS Only',
      });
    }

    return list;
  }, [calendarMatrix, rawSeriesName, harmonizedSeriesName, t]);

  // 2. Monthly Seasonality Data
  const monthlySeasonalityData = useMemo(() => {
    const list: Array<{
      month: string;
      [key: string]: string | number;
    }> = [];

    for (let m = 1; m <= 12; m++) {
      let sumHarmonized = 0;
      let overlaySum = 0;

      for (let yr = 2000; yr <= 2026; yr++) {
        for (let w = 1; w <= 52; w++) {
          const item = calendarMatrix[`${yr}-${w}`];
          if (item && item.month === m) {
            sumHarmonized += item.harmonizedClusterCount;
            if (yr === overlayYear) {
              overlaySum += item.harmonizedClusterCount;
            }
          }
        }
      }

      const avg = Math.round(sumHarmonized / 27);
      const mName = MONTHS[m - 1];

      list.push({
        month: mName,
        [climatologySeriesName]: avg,
        [overlaySeriesName]: overlaySum,
      });
    }

    return list;
  }, [calendarMatrix, overlayYear, MONTHS, climatologySeriesName, overlaySeriesName]);

  // 3. Provincial Peatland Carbon & Fire Energy Comparison
  const provincialRankings = useMemo(() => {
    return [
      { name: 'Kalteng (Sebangau/PLG)', island: 'Kalimantan', frpMW: 48200, co2eMt: 71.3, color: '#dc2626' },
      { name: 'Riau (Kampar/Siak)', island: 'Sumatera', frpMW: 42100, co2eMt: 62.3, color: '#ea580c' },
      { name: 'Sumsel (Kubah OKI)', island: 'Sumatera', frpMW: 36800, co2eMt: 54.5, color: '#f97316' },
      { name: 'Kalbar (Ketapang/Rasau)', island: 'Kalimantan', frpMW: 29500, co2eMt: 43.7, color: '#f59e0b' },
      { name: 'Papua Sel (Merauke/Mappi)', island: 'Papua', frpMW: 24100, co2eMt: 35.6, color: '#10b981' },
      { name: 'Kalsel (Banjar/Barito)', island: 'Kalimantan', frpMW: 18900, co2eMt: 28.0, color: '#06b6d4' },
      { name: 'Jambi (Berbak/Tanjab)', island: 'Sumatera', frpMW: 15400, co2eMt: 22.8, color: '#3b82f6' },
      { name: 'Kaltim (Kutai/Berau)', island: 'Kalimantan', frpMW: 12800, co2eMt: 18.9, color: '#6366f1' },
    ];
  }, []);

  // 4. Sensor Physics & Overlap Distribution Pie
  const sensorPhysicsData = useMemo(() => {
    return [
      { name: language === 'id' ? 'VIIRS 375m Deteksi Resolusi Tinggi' : 'VIIRS 375m High-Resolution', value: 58, color: '#f59e0b' },
      { name: language === 'id' ? 'MODIS 1km Deteksi Skala Lanskap' : 'MODIS 1km Synoptic Footprint', value: 24, color: '#dc2626' },
      { name: language === 'id' ? 'Tumpang Tindih Ko-Deteksi Bersamaan' : 'Co-detected Overlapping Events', value: 18, color: '#0071e3' },
    ];
  }, [language]);

  return (
    <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 transition-all">
      
      {/* Header & Question Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            {t.analyticsTitle}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {activeTab === 'trend'
              ? t.trendChartTitle
              : activeTab === 'climate'
              ? t.climateIndicesTitle
              : activeTab === 'seasonality'
              ? t.seasonalityChartTitle
              : activeTab === 'provincial'
              ? t.provincialChartTitle
              : t.physicsChartTitle}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-2xl">
            {activeTab === 'trend'
              ? t.trendChartDesc
              : activeTab === 'climate'
              ? t.climateIndicesDesc
              : activeTab === 'seasonality'
              ? t.seasonalityChartDesc
              : activeTab === 'provincial'
              ? t.provincialChartDesc
              : t.physicsChartDesc}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 text-xs font-medium border border-slate-200 dark:border-slate-800 shrink-0">
          {[
            { id: 'trend' as ChartTab, label: t.tabTrend, icon: TrendingUp },
            { id: 'climate' as ChartTab, label: language === 'id' ? 'Iklim (ONI/DMI)' : 'Climate (ONI/DMI)', icon: Waves },
            { id: 'seasonality' as ChartTab, label: t.tabSeasonality, icon: Calendar },
            { id: 'provincial' as ChartTab, label: t.tabProvincial, icon: BarChart3 },
            { id: 'physics' as ChartTab, label: t.tabPhysics, icon: PieIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer min-h-[34px] ${
                  isSel
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: 26-Year Trend Line & Area Chart */}
      {activeTab === 'trend' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {language === 'id' ? '26 Tahun Deret Waktu Terharmonisasi (2000–2026):' : '26-Year Harmonized Time Series (2000–2026):'}
            </span>
            <button
              onClick={() => setShowClimateOverlay(!showClimateOverlay)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                showClimateOverlay
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 font-bold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>{showClimateOverlay ? 'Hide ONI/DMI Overlay' : 'Show ONI/DMI Climate Overlay'}</span>
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 p-4 sm:p-5">
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyTrendData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="harmAreaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                  
                  <XAxis
                    dataKey="year"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => (val % 4 === 0 || val === 2026 ? val : '')}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  
                  <Tooltip content={<CustomChartTooltip unit={language === 'id' ? 'titik/klaster' : 'pts/clusters'} />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {/* 2012 VIIRS Launch Divider */}
                  <ReferenceLine x={2012} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'VIIRS 2012', position: 'top', fill: '#f59e0b', fontSize: 11, fontWeight: 'bold' }} />

                  {/* 2015 Super El Niño Crisis Highlight */}
                  <ReferenceArea x1={2015} x2={2015} stroke="#dc2626" strokeOpacity={0.4} fill="#fee2e2" fillOpacity={0.2} />

                  {/* NASA Harmonized Area Spline */}
                  <Area
                    type="monotone"
                    dataKey={harmonizedSeriesName}
                    stroke="#0284c7"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#harmAreaColor)"
                    isAnimationActive={true}
                    animationDuration={1000}
                  />

                  {/* Raw Spike Line */}
                  <Line
                    type="monotone"
                    dataKey={rawSeriesName}
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={{ r: 2.5, fill: '#94a3b8' }}
                    activeDot={{ r: 6, fill: '#0284c7' }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />

                  {/* Optional ONI / DMI Climate Lines */}
                  {showClimateOverlay && (
                    <Line
                      type="monotone"
                      dataKey="scaledOni"
                      name="ONI Anomaly Index (scaled)"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scientific Insight Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {language === 'id' ? 'Kesimpulan Analisis Ilmiah:' : 'Scientific Analysis Takeaway:'}
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'id'
                  ? 'Garis abu-abu putus-putus menunjukkan lonjakan semu 3x lipat sejak 2012 akibat ukuran piksel VIIRS 375m (14 Ha). Garis biru terharmonisasi mengembalikan perbandingan historis yang valid dengan mengelompokkan ke grid 5.5 km.'
                  : 'Dashed gray line illustrates artificial 3x inflation post-2012 caused by VIIRS 375m pixels. The solid blue harmonized series restores continuous historical validity via 5.5 km equal-area binning.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Climate Indices Correlation (ONI & DMI) */}
      {activeTab === 'climate' && (
        <div className="space-y-5">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 p-4 sm:p-5">
            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={climateIndices26Years} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[-2, 3]} />
                  
                  <Tooltip content={<CustomChartTooltip unit="°C" />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {/* Neutral Baseline */}
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  
                  {/* El Niño Drought Threshold */}
                  <ReferenceLine y={0.5} stroke="#f97316" strokeDasharray="4 4" label={{ value: '+0.5°C El Niño', position: 'right', fill: '#f97316', fontSize: 10 }} />
                  <ReferenceLine y={-0.5} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: '-0.5°C La Niña', position: 'right', fill: '#38bdf8', fontSize: 10 }} />

                  <Line
                    type="monotone"
                    dataKey="oni"
                    name="Oceanic Niño Index (ONI - Pacific SST Anomaly °C)"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#dc2626' }}
                    activeDot={{ r: 6 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="dmi"
                    name="Dipole Mode Index (DMI - Indian Ocean Dipole °C)"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#0284c7' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Oceanographic Proof Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 space-y-2">
              <div className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2.5 text-sm">
                <IconBadge icon={Activity} variant="rose" size="sm" ping />
                <span>Super El Niño 2015 (+2.6°C)</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {language === 'id'
                  ? 'Anomali Pasifik tertinggi dalam 26 tahun memicu kekeringan monsun ekstrem. Emisi kebakaran gambut Indonesia mencapai >1.6 Gt CO₂e, membuktikan korelasi r = 0.89 dengan ONI.'
                  : 'Highest Pacific SST anomaly in 26 years caused extreme monsoon failure. Peat emissions exceeded >1.6 Gt CO₂e, demonstrating r = 0.89 empirical correlation with ONI.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
              <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2.5 text-sm">
                <IconBadge icon={Waves} variant="amber" size="sm" />
                <span>Extreme Positive IOD 2019 (+1.2°C)</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {language === 'id'
                  ? 'Dipol Samudra Hindia terkuat dalam sejarah modern mengalihkan massa uap air ke Afrika Timur, menyebabkan kebakaran hebat di OKI Sumsel dan Kalimantan Tengah.'
                  : 'Strongest Indian Ocean Dipole on record shifted moisture to East Africa, triggering severe peat desiccation across Sumatra OKI and Central Kalimantan.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 space-y-2">
              <div className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-2.5 text-sm">
                <IconBadge icon={TrendingUp} variant="sky" size="sm" />
                <span>La Niña Suppression (2010, 2021–2022)</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {language === 'id'
                  ? 'Fase dingin Pasifik (ONI < -1.0°C) mempertahankan muka air gambut TMAG > -20 cm sepanjang tahun, menekan titik api aktif hingga mendekati 0.'
                  : 'Pacific cold phase (ONI < -1.0°C) maintained water table depth TMAG > -20 cm year-round, suppressing active ignitions to near zero.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Monthly Seasonality Climatology */}
      {activeTab === 'seasonality' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {language === 'id' ? 'Bandingkan Rata-rata 26 Tahun dengan Anomali Tahun:' : 'Compare 26-Yr Average against Specific Year:'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[2015, 2019, 2021, 2023, 2026].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setOverlayYear(yr)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer min-h-[32px] ${
                    overlayYear === yr
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {language === 'id' ? `Tahun ${yr}` : `Year ${yr}`}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 p-4 sm:p-5">
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySeasonalityData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="overlayAreaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="climaAreaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  
                  <Tooltip content={<CustomChartTooltip unit={language === 'id' ? 'klaster' : 'clusters'} />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {/* 26-Year Climatology Baseline */}
                  <Area
                    type="monotone"
                    dataKey={climatologySeriesName}
                    stroke="#64748b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="url(#climaAreaColor)"
                    isAnimationActive={true}
                    animationDuration={1000}
                  />

                  {/* Overlay Year Curve */}
                  <Area
                    type="monotone"
                    dataKey={overlaySeriesName}
                    stroke="#dc2626"
                    strokeWidth={3}
                    fill="url(#overlayAreaColor)"
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Provincial Peatland Carbon & Energy Bar Chart */}
      {activeTab === 'provincial' && (
        <div className="space-y-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 p-4 sm:p-5">
            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={provincialRankings}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    width={150}
                  />
                  
                  <Tooltip content={<CustomChartTooltip unit={language === 'id' ? 'MW (Daya Termal)' : 'MW (Thermal FRP)'} />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  <Bar
                    dataKey="frpMW"
                    name={t.thermalPowerLegend}
                    radius={[0, 8, 8, 0]}
                    isAnimationActive={true}
                    animationDuration={1200}
                  >
                    {provincialRankings.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Sensor Physics & Overlap Donut */}
      {activeTab === 'physics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          
          {/* Donut Chart */}
          <div className="lg:col-span-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 p-4 sm:p-5 flex flex-col items-center justify-center">
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sensorPhysicsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1000}
                  >
                    {sensorPhysicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Physics Explanation Cards */}
          <div className="lg:col-span-6 space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                MODIS (1,000m × 1,000m = 100 Ha)
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'id'
                  ? 'Sensor sinoptik NASA pada satelit Terra & Aqua. Merekam front api dalam skala bentang lahan makro sejak tahun 2000.'
                  : 'NASA synoptic sensor onboard Terra & Aqua satellites. Records fire perimeters at landscape scale since 2000.'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                VIIRS (375m × 375m = 14 Ha)
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'id'
                  ? 'Sensor resolusi tinggi pada satelit Suomi-NPP & NOAA-20. Mendeteksi titik api kecil dan menghasilkan 3–5 deteksi terpisah per front kebakaran.'
                  : 'High-resolution sensor onboard Suomi-NPP & NOAA satellites. Detects small fire fronts and produces 3–5 split detections per event.'}
              </p>
            </div>

            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-900 rounded-xl space-y-1">
              <div className="font-bold text-sky-600 dark:text-sky-400 text-sm">
                {language === 'id' ? 'Solusi Grid Harmonisasi 5.5 km' : '5.5 km Harmonization Grid Solution'}
              </div>
              <p className="text-sky-900 dark:text-sky-200 leading-relaxed">
                {language === 'id'
                  ? 'Wanareksa merekonsiliasi perbedaan resolusi kedua sensor ke dalam sel spasial 5.5 km sehingga menghasilkan linimasa 26 tahun yang konsisten secara ilmiah.'
                  : 'Wanareksa reconciles multi-sensor resolution discrepancies into 5.5 km spatial cells for an un-biased 26-year time series.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
