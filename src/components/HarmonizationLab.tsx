import React, { useState } from 'react';
import { Info, ShieldCheck, Zap, Layers, Cpu, Compass, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { Language } from '../data/translations';

interface HarmonizationLabProps {
  language: Language;
}

export const HarmonizationLab: React.FC<HarmonizationLabProps> = ({ language }) => {
  // Interactive Simulation State
  const [simFireRadius, setSimFireRadius] = useState<number>(1.8); // km
  const [simFireIntensity, setSimFireIntensity] = useState<number>(65); // MW/km2
  const [simScanAngle, setSimScanAngle] = useState<number>(24); // degrees off nadir
  const [activeTab, setActiveTab] = useState<'visualizer' | 'physics' | 'matrix' | 'simulator'>('visualizer');

  // Policy Simulator State (2027-2030)
  const [simTargetTmag, setSimTargetTmag] = useState<number>(-25); // cm (target water table)
  const [simCanalCompliance, setSimCanalCompliance] = useState<number>(85); // % compliance
  const [simClimateScenario, setSimClimateScenario] = useState<'neutral' | 'elnino'>('neutral');

  // Physics calculation
  const modisPixelArea = Math.round(1.0 * (1 + 0.025 * simScanAngle) * 10) / 10;
  const viirsPixelArea = Math.round(0.14 * (1 + 0.012 * simScanAngle) * 100) / 100;

  const fireGroundArea = Math.PI * Math.pow(simFireRadius, 2);
  const estimatedTotalMW = Math.round(fireGroundArea * simFireIntensity);

  const simulatedModisRawCount = Math.max(1, Math.round(fireGroundArea / (modisPixelArea * 0.9)));
  const simulatedViirsRawCount = Math.max(1, Math.round(fireGroundArea / (viirsPixelArea * 1.8)));
  const rawRatio = (simulatedViirsRawCount / simulatedModisRawCount).toFixed(1);

  const harmonizedBinCount = Math.max(1, Math.ceil(fireGroundArea / 6.2));
  const calibratedEnergyOutput = estimatedTotalMW;

  // Policy Simulator Projection Calculations
  // Baseline: Unmanaged peat with TMAG -60 cm and 0% canal blocking has 100% baseline risk
  const drynessFactor = Math.max(0, (-simTargetTmag - 20) / 40); // 0 at -20cm, 1 at -60cm
  const complianceFactor = 1 - (simCanalCompliance / 100) * 0.7; // reduces risk up to 70%
  const climateMultiplier = simClimateScenario === 'elnino' ? 1.85 : 1.0;
  const projectedHotspotIndex = Math.min(100, Math.max(8, Math.round(drynessFactor * complianceFactor * climateMultiplier * 100)));
  const fireReductionPct = Math.max(0, 100 - projectedHotspotIndex);
  const co2PreventedMt = ((fireReductionPct / 100) * 58.4).toFixed(1);

  return (
    <div className="w-full space-y-6">
      
      {/* Editorial Header */}
      <div className="space-y-2 pt-2 pb-4 border-b border-[#e5e5e7] dark:border-[#1f2937]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#9ca3af]">
            {language === 'id' ? 'Metodologi & Fisika Satelit' : 'Methodology & Sensor Physics'}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold">
            NASA EOS / JPSS
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
          {language === 'id'
            ? 'Mengapa Pergantian Sensor Membuat Titik Api Tampak Naik 3x Lipat?'
            : 'Why Satellite Sensor Shifts Artificially Inflate Fire Counts'}
        </h1>
        <p className="text-sm text-[#6e6e73] dark:text-[#9ca3af] max-w-3xl leading-relaxed">
          {language === 'id'
            ? 'Pada 2012, NASA mengoperasikan sensor VIIRS (resolusi 375m) berdampingan dengan MODIS (1km). Karena ukuran piksel VIIRS 7 kali lebih kecil, satu kebakaran hutan yang sama terdeteksi sebagai banyak titik terpisah. Algoritma Wanareksa menyatukan deteksi ke dalam grid 5.5 km untuk mengembalikan perbandingan historis 2000-2026 yang valid.'
            : 'In 2012, NASA deployed the VIIRS sensor (375m resolution) alongside MODIS (1km). With 7x smaller pixel footprints, a single fire front registers as multiple adjacent detections. Wanareksa resolves this via 5.5 km spatial binning to preserve scientific continuity across 2000-2026.'}
        </p>
      </div>

      {/* Mode Sub-Tabs - Equal Width Grid on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#e5e5ea] dark:bg-[#1f2937] rounded-xl p-1 gap-1 w-full text-xs">
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
            activeTab === 'visualizer'
              ? 'bg-white dark:bg-[#111827] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
              : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="truncate">{language === 'id' ? 'Simulator Footprint' : 'Footprint Lab'}</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
            activeTab === 'simulator'
              ? 'bg-white dark:bg-[#111827] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
              : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="truncate">{language === 'id' ? 'Simulator 2027–2030' : '2027–2030 Policy'}</span>
        </button>

        <button
          onClick={() => setActiveTab('physics')}
          className={`px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
            activeTab === 'physics'
              ? 'bg-white dark:bg-[#111827] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
              : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate">{language === 'id' ? 'Alur Algoritma' : 'Pipeline'}</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
            activeTab === 'matrix'
              ? 'bg-white dark:bg-[#111827] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
              : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate">{language === 'id' ? 'Matriks Sensor' : 'Spec Matrix'}</span>
        </button>
      </div>

      {/* TAB 1: Visual Footprint Simulator */}
      {activeTab === 'visualizer' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: Parameter Controls (No Range Sliders) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5e5e7] dark:border-[#1f2937]">
                <h2 className="font-bold text-xs sm:text-sm text-[#1d1d1f] dark:text-white">
                  {language === 'id' ? 'Parameter Front Kebakaran' : 'Fire Front Parameters'}
                </h2>
                <span className="text-[11px] font-mono text-[#86868b] dark:text-[#9ca3af]">
                  {fireGroundArea.toFixed(1)} km² Ground Area
                </span>
              </div>

              {/* Parameter 1: Fire Front Radius */}
              <div className="space-y-2 bg-[#f8fafc] dark:bg-[#151d2f] p-3 rounded-xl border border-[#e5e5e7] dark:border-[#1f2937]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#e5e5e7]">
                    {language === 'id' ? 'Radius Front Api' : 'Fire Front Radius'}
                  </span>
                  <span className="font-bold text-sm text-[#1d1d1f] dark:text-white num">
                    {simFireRadius} km
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="grid grid-cols-4 gap-1 flex-1">
                    {[
                      { val: 0.8, label: '0.8 km' },
                      { val: 1.8, label: '1.8 km' },
                      { val: 3.2, label: '3.2 km' },
                      { val: 5.0, label: '5.0 km' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setSimFireRadius(preset.val)}
                        className={`py-1 px-1.5 rounded-lg text-[10.5px] font-medium transition-all text-center cursor-pointer ${
                          simFireRadius === preset.val
                            ? 'bg-[#1d1d1f] text-white dark:bg-emerald-600 dark:text-white font-bold shadow-xs'
                            : 'bg-white dark:bg-[#111827] text-[#6e6e73] dark:text-[#9ca3af] hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] border border-[#e5e5e7] dark:border-[#1f2937]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSimFireRadius(Math.max(0.5, Math.round((simFireRadius - 0.2) * 10) / 10))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                      title="-0.2 km"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimFireRadius(Math.min(6.0, Math.round((simFireRadius + 0.2) * 10) / 10))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                      title="+0.2 km"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Parameter 2: Heat Intensity (FRP) */}
              <div className="space-y-2 bg-[#f8fafc] dark:bg-[#151d2f] p-3 rounded-xl border border-[#e5e5e7] dark:border-[#1f2937]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#e5e5e7]">
                    {language === 'id' ? 'Intensitas Radiasi (FRP)' : 'FRP Heat Intensity'}
                  </span>
                  <span className="font-bold text-sm text-[#1d1d1f] dark:text-white num">
                    {simFireIntensity} MW/km²
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="grid grid-cols-4 gap-1 flex-1">
                    {[
                      { val: 30, label: '30 MW' },
                      { val: 65, label: '65 MW' },
                      { val: 100, label: '100 MW' },
                      { val: 150, label: '150 MW' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setSimFireIntensity(preset.val)}
                        className={`py-1 px-1.5 rounded-lg text-[10.5px] font-medium transition-all text-center cursor-pointer ${
                          simFireIntensity === preset.val
                            ? 'bg-[#1d1d1f] text-white dark:bg-emerald-600 dark:text-white font-bold shadow-xs'
                            : 'bg-white dark:bg-[#111827] text-[#6e6e73] dark:text-[#9ca3af] hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] border border-[#e5e5e7] dark:border-[#1f2937]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSimFireIntensity(Math.max(10, simFireIntensity - 5))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimFireIntensity(Math.min(200, simFireIntensity + 5))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>

              {/* Parameter 3: Sensor Scan Angle (Bowtie Effect) */}
              <div className="space-y-2 bg-[#f8fafc] dark:bg-[#151d2f] p-3 rounded-xl border border-[#e5e5e7] dark:border-[#1f2937]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#e5e5e7]">
                    {language === 'id' ? 'Sudut Pengamatan (Off-Nadir)' : 'Scan Angle (Off-Nadir)'}
                  </span>
                  <span className="font-bold text-sm text-[#1d1d1f] dark:text-white num">
                    {simScanAngle}°
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="grid grid-cols-4 gap-1 flex-1">
                    {[
                      { val: 0, label: '0° Nadir' },
                      { val: 24, label: '24° Mid' },
                      { val: 45, label: '45° Edge' },
                      { val: 55, label: '55° Max' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setSimScanAngle(preset.val)}
                        className={`py-1 px-1.5 rounded-lg text-[10.5px] font-medium transition-all text-center cursor-pointer ${
                          simScanAngle === preset.val
                            ? 'bg-[#1d1d1f] text-white dark:bg-emerald-600 dark:text-white font-bold shadow-xs'
                            : 'bg-white dark:bg-[#111827] text-[#6e6e73] dark:text-[#9ca3af] hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] border border-[#e5e5e7] dark:border-[#1f2937]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSimScanAngle(Math.max(0, simScanAngle - 5))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -5°
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimScanAngle(Math.min(55, simScanAngle + 5))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-white hover:bg-[#e5e5ea] dark:hover:bg-[#1f2937] text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +5°
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time Footprint Area Info */}
              <div className="p-3 bg-[#f5f5f7] dark:bg-[#151d2f] rounded-xl border border-[#e5e5e7] dark:border-[#1f2937] text-xs space-y-2">
                <div className="font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#6e6e73] dark:text-[#9ca3af]" />
                  <span>{language === 'id' ? 'Luas Piksel Sensor Real-Time' : 'Instantaneous Field of View'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937]">
                    <span className="text-[#86868b] dark:text-[#9ca3af] block">MODIS (1 km):</span>
                    <strong className="text-[#1d1d1f] dark:text-white text-xs num">{modisPixelArea} km²/px</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937]">
                    <span className="text-[#86868b] dark:text-[#9ca3af] block">VIIRS (375 m):</span>
                    <strong className="text-[#1d1d1f] dark:text-white text-xs num">{viirsPixelArea} km²/px</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Spatial Footprint Demonstrator */}
            <div className="lg:col-span-7 bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e7] dark:border-[#1f2937]">
                <div>
                  <h3 className="font-bold text-sm text-[#1d1d1f] dark:text-white">
                    {language === 'id' ? 'Visualisasi Fragmentasi Piksel Satelit' : 'Pixel Sampling Visualizer'}
                  </h3>
                  <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af]">
                    {language === 'id' ? 'Simulasi 1 kebakaran yang sama dipindai oleh 2 sensor berbeda' : 'Simulating one physical wildfire observed by two different sensor resolutions'}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold">
                  Bias: {rawRatio}x
                </div>
              </div>

              {/* Interactive SVG Visual Canvas */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-[#0f172a] border border-[#1e293b] overflow-hidden flex items-center justify-center p-4">
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  <defs>
                    <radialGradient id="fireFlare" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                      <stop offset="40%" stopColor="#f97316" stopOpacity="0.6" />
                      <stop offset="80%" stopColor="#eab308" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </radialGradient>
                    <pattern id="modisGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                      <rect width="60" height="60" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.5" />
                    </pattern>
                    <pattern id="viirsGrid" width="22" height="22" patternUnits="userSpaceOnUse">
                      <rect width="22" height="22" fill="none" stroke="#34d399" strokeWidth="0.75" strokeOpacity="0.4" />
                    </pattern>
                  </defs>

                  {/* 5.5km Equal-Area Bin Box (Wanareksa) */}
                  <rect x="50" y="20" width="300" height="260" rx="16" fill="#1e293b" fillOpacity="0.5" stroke="#10b981" strokeWidth="2" strokeDasharray="6,4" />
                  <text x="60" y="42" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    WANAREKSA: 1 Equal-Area Cluster (5.5 km)
                  </text>

                  {/* MODIS Grid Overlay (Left Side) */}
                  <rect x="70" y="55" width="120" height="180" fill="url(#modisGrid)" />
                  <text x="75" y="70" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                    MODIS (1km): {simulatedModisRawCount} px
                  </text>

                  {/* VIIRS Grid Overlay (Right Side) */}
                  <rect x="210" y="55" width="120" height="180" fill="url(#viirsGrid)" />
                  <text x="215" y="70" fill="#34d399" fontSize="9" fontFamily="monospace">
                    VIIRS (375m): {simulatedViirsRawCount} px
                  </text>

                  {/* Central Physical Fire Polygon */}
                  <circle
                    cx="200"
                    cy="150"
                    r={Math.min(75, Math.max(20, simFireRadius * 18))}
                    fill="url(#fireFlare)"
                    className="animate-pulse"
                  />
                  <circle
                    cx="200"
                    cy="150"
                    r={Math.max(4, simFireRadius * 5)}
                    fill="#ffffff"
                    fillOpacity="0.85"
                  />
                  <text x="200" y="154" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {estimatedTotalMW} MW
                  </text>
                </svg>

                {/* Legend Overlay at Bottom */}
                <div className="absolute bottom-2 left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>{language === 'id' ? `Front Api Riil (${fireGroundArea.toFixed(1)} km²)` : `True Fire Extent (${fireGroundArea.toFixed(1)} km²)`}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded border border-sky-400" />
                    <span>MODIS: {simulatedModisRawCount} {language === 'id' ? 'titik mentah' : 'raw points'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded border border-emerald-400" />
                    <span>VIIRS: {simulatedViirsRawCount} {language === 'id' ? 'titik mentah' : 'raw points'}</span>
                  </div>
                </div>
              </div>

              {/* Comparison Output Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Raw Disparity Card */}
                <div className="p-3.5 rounded-xl bg-[#fbfbfd] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] space-y-1.5">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {language === 'id' ? 'Deteksi Sensor Mentah (Uncorrected)' : 'Uncorrected Raw Hotspots'}
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-[#86868b] dark:text-[#9ca3af]">MODIS Raw:</span>
                    <strong className="text-sm font-bold text-[#1d1d1f] dark:text-white num">{simulatedModisRawCount} {language === 'id' ? 'titik' : 'points'}</strong>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#86868b] dark:text-[#9ca3af]">VIIRS Raw:</span>
                    <strong className="text-sm font-bold text-rose-600 dark:text-rose-400 num">{simulatedViirsRawCount} {language === 'id' ? 'titik' : 'points'}</strong>
                  </div>
                  <p className="text-[10.5px] text-[#86868b] dark:text-[#9ca3af] pt-1.5 border-t border-[#e5e5e7] dark:border-[#1f2937]">
                    {language === 'id'
                      ? 'VIIRS mendeteksi ' + rawRatio + 'x lebih banyak titik murni karena resolusi kamera satelit yang lebih rapat, bukan karena ada ' + rawRatio + 'x lebih banyak kebakaran di lapangan.'
                      : 'VIIRS produces ' + rawRatio + 'x more raw detections solely due to camera sub-pixel granularity, not an increase in actual fire incidents.'}
                  </p>
                </div>

                {/* Harmonized Card */}
                <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{language === 'id' ? 'Wanareksa (Terkalibrasi)' : 'Harmonized 5.5 km Grid'}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-[#6e6e73] dark:text-[#9ca3af]">{language === 'id' ? 'Klaster Terverifikasi:' : 'Verified Clusters:'}</span>
                    <strong className="text-sm font-bold text-emerald-700 dark:text-emerald-300 num">{harmonizedBinCount} {language === 'id' ? 'klaster' : 'clusters'}</strong>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#6e6e73] dark:text-[#9ca3af]">{language === 'id' ? 'Energi Radiasi Kalibrasi:' : 'Calibrated Radiative Energy:'}</span>
                    <strong className="text-sm font-bold text-[#1d1d1f] dark:text-white num">{calibratedEnergyOutput.toLocaleString()} MW</strong>
                  </div>
                  <p className="text-[10.5px] text-emerald-800/80 dark:text-emerald-300/80 pt-1.5 border-t border-emerald-200 dark:border-emerald-900">
                    {language === 'id'
                      ? 'Seluruh fragmentasi disatukan ke kisi 5.5 km. Mengembalikan kesinambungan data deret waktu yang adil antara 2000 dan 2026.'
                      : 'All sub-pixel fragments are unified into 5.5 km equal-area bins, restoring true historical comparability from 2000 to 2026.'}
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 2: Algorithmic Pipeline & Mathematical Model */}
      {activeTab === 'physics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
          
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-[#1d1d1f] dark:text-white">
              {language === 'id' ? 'Spatial Binning (5.5 km)' : '5.5 km Spatial Binning'}
            </h3>
            <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af] leading-relaxed">
              {language === 'id'
                ? 'Mengelompokkan seluruh deteksi piksel mentah MODIS (1km) dan VIIRS (375m) ke dalam grid spasial equal-area 5.5 km x 5.5 km untuk mengeliminasi multi-counting pada area kebakaran yang sama.'
                : 'Aggregates all raw pixel detections from MODIS (1km) and VIIRS (375m) into equal-area 5.5 km x 5.5 km cells to eliminate multiple detections of contiguous fire fronts.'}
            </p>
            <div className="p-2.5 rounded-lg bg-[#f5f5f7] dark:bg-[#151d2f] font-mono text-[11px] text-[#1d1d1f] dark:text-white">
              Cell_ID = floor(lat / 0.05) + "_" + floor(lon / 0.05)
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-[#1d1d1f] dark:text-white">
              {language === 'id' ? 'FRP Cross-Sensor Calibration' : 'FRP Cross-Calibration'}
            </h3>
            <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af] leading-relaxed">
              {language === 'id'
                ? 'Menerapkan faktor koreksi empiris pada Fire Radiative Power (MW) untuk menyelaraskan respon sensor Terra/Aqua MODIS dengan Suomi-NPP/NOAA-20 VIIRS.'
                : 'Applies empirical calibration weights to Fire Radiative Power (MW) to align radiometric responses between MODIS and VIIRS sensors.'}
            </p>
            <div className="p-2.5 rounded-lg bg-[#f5f5f7] dark:bg-[#151d2f] font-mono text-[11px] text-[#1d1d1f] dark:text-white">
              FRP_cal = (FRP_MODIS * 1.04) + (FRP_VIIRS * 0.88)
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-[#1d1d1f] dark:text-white">
              {language === 'id' ? 'Burning Activity Index (BAI)' : 'Burning Activity Index (BAI)'}
            </h3>
            <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af] leading-relaxed">
              {language === 'id'
                ? 'Menghitung indeks aktivitas pembakaran terpadu (skala 0-100) dan Z-score anomali historis terhadap baseline 26 tahun di tiap ekosistem gambut.'
                : 'Calculates the composite burning activity index (0-100 scale) and historical Z-score anomaly against a 26-year baseline.'}
            </p>
            <div className="p-2.5 rounded-lg bg-[#f5f5f7] dark:bg-[#151d2f] font-mono text-[11px] text-[#1d1d1f] dark:text-white">
              BAI = min(100, (N_cluster * 1.85) + (FRP_cal / 1500) * 45)
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: NASA Satellite Specification Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-[#1d1d1f] dark:text-white">
              {language === 'id' ? 'Spesifikasi Teknis Sensor NASA EOS & JPSS' : 'NASA EOS & JPSS Sensor Specifications'}
            </h2>
            <span className="text-xs text-[#86868b] dark:text-[#9ca3af]">FIRMS Archive Verification</span>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#e5e5e7] dark:border-[#1f2937] text-[#86868b] dark:text-[#9ca3af] font-medium uppercase text-[10px]">
                  <th className="py-2.5 pr-4">{language === 'id' ? 'Parameter' : 'Parameter'}</th>
                  <th className="py-2.5 px-4">MODIS (Terra / Aqua)</th>
                  <th className="py-2.5 px-4">VIIRS (Suomi-NPP / NOAA)</th>
                  <th className="py-2.5 pl-4">Wanareksa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e7] dark:divide-[#1f2937] text-[#1d1d1f] dark:text-[#f3f4f6]">
                <tr>
                  <td className="py-3 pr-4 font-medium text-[#6e6e73] dark:text-[#9ca3af]">
                    {language === 'id' ? 'Masa Operasional' : 'Operational Period'}
                  </td>
                  <td className="py-3 px-4 num">2000 - {language === 'id' ? 'Sekarang' : 'Present'}</td>
                  <td className="py-3 px-4 num">2012 - {language === 'id' ? 'Sekarang' : 'Present'}</td>
                  <td className="py-3 pl-4 font-semibold num text-emerald-600 dark:text-emerald-400">2000 - 2026 (26 {language === 'id' ? 'Tahun' : 'Years'})</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-[#6e6e73] dark:text-[#9ca3af]">
                    {language === 'id' ? 'Resolusi Spasial (Nadir)' : 'Spatial Resolution (Nadir)'}
                  </td>
                  <td className="py-3 px-4 num">1.0 km x 1.0 km</td>
                  <td className="py-3 px-4 num">375 m x 375 m</td>
                  <td className="py-3 pl-4 font-semibold num text-emerald-600 dark:text-emerald-400">5.5 km Equal-Area Grid</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-[#6e6e73] dark:text-[#9ca3af]">
                    {language === 'id' ? 'Kanal Deteksi Termal' : 'Thermal Detection Bands'}
                  </td>
                  <td className="py-3 px-4">3.9 μm, 11 μm</td>
                  <td className="py-3 px-4">3.74 μm (I4), 11.45 μm (I5)</td>
                  <td className="py-3 pl-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    {language === 'id' ? 'Harmonisasi Lintas-Sensor' : 'Cross-Sensor Calibrated'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-[#6e6e73] dark:text-[#9ca3af]">
                    {language === 'id' ? 'Waktu Lintas Khatulistiwa' : 'Equatorial Crossing Time'}
                  </td>
                  <td className="py-3 px-4 num">10:30 & 13:30 LT</td>
                  <td className="py-3 px-4 num">13:30 LT</td>
                  <td className="py-3 pl-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    {language === 'id' ? 'Komposit Mingguan Terpadu' : 'Unified Weekly Composite'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-[#6e6e73] dark:text-[#9ca3af]">
                    {language === 'id' ? 'Sensitivitas Api Gambut Bawah Tanah' : 'Smoldering Peat Sensitivity'}
                  </td>
                  <td className="py-3 px-4 text-[#86868b] dark:text-[#9ca3af]">
                    {language === 'id' ? 'Sedang (>100 MW)' : 'Moderate (>100 MW)'}
                  </td>
                  <td className="py-3 px-4 text-[#86868b] dark:text-[#9ca3af]">
                    {language === 'id' ? 'Tinggi (>25 MW)' : 'High (>25 MW)'}
                  </td>
                  <td className="py-3 pl-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    {language === 'id' ? 'Tervalidasi TMA & FWI' : 'Validated against TMA & FWI'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: 2027-2030 Peatland Policy Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: Policy Parameter Knobs */}
            <div className="lg:col-span-6 bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'id' ? 'Kontrol Parameter Intervensi BRGM' : 'BRGM Policy Intervention Controls'}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300">
                  PP 71/2014 & 57/2016
                </span>
              </div>

              {/* Target Water Table (TMAG) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {language === 'id' ? 'Target Kedalaman Muka Air Tanah (TMAG)' : 'Target Groundwater Table Depth (TMAG)'}
                  </span>
                  <span className="font-bold font-mono text-sky-600 dark:text-sky-400">
                    {simTargetTmag} cm
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: -20, label: language === 'id' ? 'Optimal (-20cm)' : 'Optimal (-20cm)', desc: 'Full Rewetted' },
                    { val: -35, label: language === 'id' ? 'Standar (-35cm)' : 'Standard (-35cm)', desc: 'PP 57 Compliance' },
                    { val: -60, label: language === 'id' ? 'Kering (-60cm)' : 'Drained (-60cm)', desc: 'High Hazard' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => setSimTargetTmag(preset.val)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs ${
                        simTargetTmag === preset.val
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-600 text-slate-900 dark:text-white font-bold'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold">{preset.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Canal Blocking Compliance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {language === 'id' ? 'Tingkat Kepatuhan Sekat Kanal (Dam)' : 'Canal Blocking Compliance Rate'}
                  </span>
                  <span className="font-bold font-mono text-sky-600 dark:text-sky-400">
                    {simCanalCompliance}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 85, 100].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSimCanalCompliance(rate)}
                      className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer text-xs ${
                        simCanalCompliance === rate
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-600 text-slate-900 dark:text-white font-bold'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Climate Scenario */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {language === 'id' ? 'Skenario Iklim Global (2027–2030)' : 'Global Climate Driver Scenario'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSimClimateScenario('neutral')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer text-xs ${
                      simClimateScenario === 'neutral'
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-600 text-slate-900 dark:text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">Neutral ENSO / Baseline</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Regular tropical monsoon cycles</div>
                  </button>

                  <button
                    onClick={() => setSimClimateScenario('elnino')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer text-xs ${
                      simClimateScenario === 'elnino'
                        ? 'bg-red-50 dark:bg-red-950/60 border-red-600 text-slate-900 dark:text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-red-600 dark:text-red-400">Developing El Niño (+2.0°C)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Extended dry drought season</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Projected Impact Card */}
            <div className="lg:col-span-6 bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'id' ? 'Proyeksi Dampak Penurunan Titik Api' : 'Projected Fire Reduction Outcome'}
                  </h2>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    fireReductionPct >= 70
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : fireReductionPct >= 40
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {fireReductionPct >= 70 ? 'OPTIMAL POLICY' : fireReductionPct >= 40 ? 'MODERATE RISK' : 'HIGH CRITICAL HAZARD'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Projected Fire Drop</span>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                      -{fireReductionPct}%
                    </div>
                    <span className="text-[11px] text-slate-500">vs Unmanaged Peat</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <span className="text-[10px] uppercase font-bold text-slate-500">CO₂e Prevented</span>
                    <div className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-1 font-mono">
                      {co2PreventedMt} Mt
                    </div>
                    <span className="text-[11px] text-slate-500">Per Year (Sumatra & Kal)</span>
                  </div>
                </div>

                {/* Visual Projection Bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Baseline Hazard (100)</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">Policy Level: {projectedHotspotIndex} / 100</span>
                  </div>
                  <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${fireReductionPct}%` }}
                    />
                    <div
                      className="h-full bg-red-500 transition-all duration-500"
                      style={{ width: `${projectedHotspotIndex}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'id'
                  ? 'Kombinasi target TMAG > -25 cm dan kepatuhan sekat kanal > 80% membuktikan mitigasi efektif menahan kebakaran gambut bahkan saat anomali El Niño terjadi.'
                  : 'Maintaining water table depth TMAG > -25 cm and canal blocking > 80% provides robust mitigation buffering peat ecosystems even during major El Niño events.'}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

