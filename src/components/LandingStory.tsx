import React, { useState, useRef, MouseEvent } from 'react';
import { Language, translations } from '../data/translations';
import {
  Flame,
  Satellite,
  Layers,
  ShieldCheck,
  Globe,
  Database,
  Cpu,
  Activity,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  ArrowRight,
  PlayCircle,
  Award,
  Sparkles
} from 'lucide-react';
import { NavTab } from './Navbar';
import { HeroSignatureTelemetry } from './HeroSignatureTelemetry';

interface LandingStoryProps {
  language: Language;
  onSelectTab: (tab: NavTab) => void;
  onOpenTour: () => void;
}

// Obsidian Spotlight Card with Cursor-Tracking Radiant Light (Subtle Ambient)
const ObsidianSpotlightCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}> = ({ children, className = '', spotlightColor = 'rgba(2, 132, 199, 0.08)' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0B0F17] p-5 sm:p-6 transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm hover:shadow-md ${className}`}
    >
      {/* Ambient Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-200 rounded-2xl sm:rounded-3xl"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

export const LandingStory: React.FC<LandingStoryProps> = ({
  language,
  onSelectTab,
  onOpenTour,
}) => {
  const t = translations[language];
  const [paradoxMode, setParadoxMode] = useState<'raw' | 'harmonized'>('harmonized');
  const [copiedClone, setCopiedClone] = useState(false);

  const handleCopyClone = () => {
    navigator.clipboard.writeText('git clone https://github.com/Rangga11268/Wanareksa.git');
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const MARQUEE_ITEMS = [
    { label: 'NASA TERRA EOS AM-1', sub: 'Orbit 705 km' },
    { label: 'SUOMI-NPP VIIRS', sub: 'Resolusi 375 m' },
    { label: 'FUSI SPASIAL 5.5 KM', sub: 'Bebas Overcounting' },
    { label: '13.4 JUTA HA GAMBUT', sub: 'Kubah Karbon Tropis' },
    { label: 'AMBANG TMAG -40 CM', sub: 'Peringatan Dini BRGM' },
    { label: 'ARSIP 26 TAHUN', sub: 'Data 2000-2026' },
    { label: 'STANDAR RFC 7946', sub: 'Ekspor GeoJSON' },
  ];

  return (
    <div className="w-full space-y-10 sm:space-y-14 animate-in fade-in duration-200 max-w-full overflow-hidden">
      
      {/* 1. HERO SECTION (Editorial 2-Column Split Layout with Signature Telemetry Stage) */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800 bg-[#070A10] text-white p-6 sm:p-10 lg:p-12 shadow-2xl">
        
        {/* Subtle Ambient Background Mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Concise Editorial Content & Actions */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            {/* Editorial Kicker Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900/90 border border-neutral-700/80 text-[11px] font-mono tracking-wider text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>NASA SPACE APPS 2026 &bull; SENSOR HARMONIZATION</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] text-white leading-[1.08]">
              {language === 'id' ? (
                <>
                  Harmonisasi <span className="text-sky-400">26 Tahun Titik Api</span> Satelit NASA di Indonesia
                </>
              ) : (
                <>
                  Harmonizing <span className="text-sky-400">26 Years of NASA Satellite</span> Fire Records
                </>
              )}
            </h1>

            {/* Punchy, Clean Description */}
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal max-w-xl">
              {language === 'id'
                ? 'Mengoreksi bias sensorik 300% transisi MODIS ke VIIRS, merekonstruksi data iklim 2000–2026 secara homogen, dan memantau risiko kebakaran bawah tanah pada 13.4 juta hektar lahan gambut Indonesia.'
                : 'Correcting the 300% sensor transition bias between MODIS and VIIRS, reconstructing 2000–2026 fire climatology, and monitoring peatland hydrology across 13.4 million hectares.'}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onSelectTab('overview')}
                className="w-full sm:w-auto h-12 min-h-[48px] px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Activity className="w-4 h-4" />
                <span>{language === 'id' ? 'Buka Peta & Data' : 'Launch Intel & Map'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectTab('lab')}
                className="w-full sm:w-auto h-12 min-h-[48px] px-5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>{language === 'id' ? 'Lab Harmonisasi' : 'Harmonization Lab'}</span>
              </button>

              <button
                onClick={onOpenTour}
                className="w-full sm:w-auto h-12 min-h-[48px] px-4 rounded-xl text-neutral-400 hover:text-sky-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <PlayCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>{language === 'id' ? 'Tur 30 Detik' : '30-Sec Tour'}</span>
              </button>
            </div>

            {/* Compact Key Stats Pills */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-neutral-800/80 max-w-lg">
              <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Rentang Data</span>
                <strong className="text-sm sm:text-base font-bold text-white block mt-0.5">26 Tahun</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Grid Equal-Area</span>
                <strong className="text-sm sm:text-base font-bold text-sky-400 block mt-0.5">5.5 km</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Gambut BRGM</span>
                <strong className="text-sm sm:text-base font-bold text-amber-400 block mt-0.5">&lt; -40 cm</strong>
              </div>
            </div>

          </div>

          {/* Right Column: Signature Interactive Telemetry & Footprint Stage */}
          <div className="lg:col-span-5">
            <HeroSignatureTelemetry language={language} />
          </div>

        </div>

      </section>

      {/* 2. CONTINUOUS TICKER MARQUEE */}
      <div className="w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#070A10] py-2.5 shadow-inner">
        <div className="flex items-center gap-6 sm:gap-8 animate-marquee whitespace-nowrap">
          {MARQUEE_ITEMS.concat(MARQUEE_ITEMS).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span className="text-xs font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-200">
                {item.label}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                ({item.sub})
              </span>
              <span className="text-neutral-300 dark:text-neutral-700 ml-3 sm:ml-4">&bull;</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. BENTO GRID: SENSOR SHIFT PARADOX & SCIENTIFIC ARTIFACTS */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>{language === 'id' ? 'Arsitektur & Paradoks Sains' : 'Architecture & Science Dilemma'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
              {language === 'id' ? 'Membedah Paradoks Sensorik 2012' : 'Deconstructing the 2012 Sensor Shift'}
            </h2>
          </div>

          {/* Interactive Simulation Switcher (Mobile Touch-Friendly) */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs shrink-0">
            <button
              onClick={() => setParadoxMode('raw')}
              className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold flex items-center justify-center text-center ${
                paradoxMode === 'raw'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {language === 'id' ? 'Data Mentah (Bias)' : 'Raw (Artifact)'}
            </button>
            <button
              onClick={() => setParadoxMode('harmonized')}
              className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold flex items-center justify-center text-center ${
                paradoxMode === 'harmonized'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {language === 'id' ? 'Terkalibrasi 5.5 km' : 'Harmonized 5.5 km'}
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* Bento Item 1: Interactive Paradox Simulator */}
          <ObsidianSpotlightCard
            className="lg:col-span-8"
            spotlightColor={paradoxMode === 'raw' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(2, 132, 199, 0.12)'}
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    Perbandingan Resolusi Sensor
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                    {paradoxMode === 'raw'
                      ? (language === 'id' ? 'Lonjakan Semu Titik Api (VIIRS 375 m)' : 'Artificial Sensor Hotspot Surge (VIIRS 375 m)')
                      : (language === 'id' ? 'Fusi Spasial Setara Wanareksa (5.5 km)' : 'Wanareksa Equal-Area Spatial Fusion (5.5 km)')}
                  </h3>
                </div>
                <span className={`self-start sm:self-auto text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                  paradoxMode === 'raw' ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                }`}>
                  {paradoxMode === 'raw' ? 'Bias Double-Counting Aktif' : 'Harmonisasi Aktif'}
                </span>
              </div>

              {/* Visual Simulation Canvas */}
              <div className="w-full min-h-[220px] sm:min-h-[240px] rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#070A10] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                {paradoxMode === 'raw' ? (
                  <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-44 sm:w-48 h-32 sm:h-36 rounded-xl sm:rounded-2xl bg-red-500/10 border-2 border-dashed border-red-500/60 grid grid-cols-4 gap-2 p-3 place-items-center shadow-md">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div key={n} className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          {n}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-200 dark:border-red-900/50">
                      1 Garis Api Nyata = 8 Deteksi Terpecah (Bias 300%)
                    </span>
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-40 sm:w-44 h-40 sm:h-44 rounded-xl sm:rounded-2xl bg-sky-500/10 border-2 border-sky-500 flex flex-col items-center justify-center p-4 shadow-md">
                      <div className="w-20 h-20 rounded-full bg-sky-600 text-white flex flex-col items-center justify-center font-bold text-xs shadow-md">
                        <span className="text-sm">1 Klaster</span>
                        <span className="text-[9px] font-mono opacity-90">420 MW</span>
                      </div>
                      <span className="text-[10px] font-mono text-sky-700 dark:text-sky-300 mt-2 font-bold">
                        Grid 5.5 km Equal-Area
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-900/50">
                      8 Titik Terpecah Disatukan Menjadi 1 Peristiwa
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {paradoxMode === 'raw'
                  ? 'Sebelum 2012, MODIS (1 km) mendeteksi satu peristiwa kebakaran sebagai 1 titik. Sejak 2012, VIIRS (375 m) memecah garis api yang sama menjadi 7 hingga 9 titik. Jika data tidak diharmonisasi, frekuensi kebakaran tampak melonjak secara semu.'
                  : 'Algoritma Wanareksa mengelompokkan titik api ke dalam grid 5.5 km equal-area dan mengalibrasi daya radiatif api (FRP) Stefan-Boltzmann agar data deret waktu 2000-2026 tetap konsisten dan valid.'}
              </p>
            </div>
          </ObsidianSpotlightCard>

          {/* Bento Item 2: Peatland Hydrology Dial */}
          <ObsidianSpotlightCard className="lg:col-span-4" spotlightColor="rgba(245, 158, 11, 0.10)">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Hidrologi Gambut BRGM
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  {language === 'id' ? 'Tinggi Muka Air Tanah (TMAG)' : 'Peat Groundwater Table'}
                </h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold font-mono block mt-0.5">
                  TMAG &lt; -40 cm = Zona Kritis
                </span>
              </div>

              {/* Peat Stratigraphy Visualizer */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#070A10] border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-sky-600 font-semibold">0 cm (Aman)</span>
                  <span className="text-amber-500 font-bold">-40 cm (Batas Kritis)</span>
                  <span className="text-neutral-500">-100 cm</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gradient-to-r from-sky-500 via-amber-500 to-red-600 relative">
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-amber-600 absolute top-1/2 -translate-y-1/2 left-[65%] shadow-md" />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 leading-relaxed">
                  Ketika muka air tanah turun melewati -40 cm, lapisan gambut mengering dan memicu kebakaran bawah tanah (smoldering) yang menghasilkan asap pekat.
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Regulasi:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">PP No. 71/2014 &amp; Standar BRGM</span>
              </div>
            </div>
          </ObsidianSpotlightCard>

        </div>
      </section>

      {/* 4. 4 CORE SPOTLIGHT INNOVATIONS */}
      <section className="space-y-4 sm:space-y-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" />
            <span>{language === 'id' ? 'Pilar Sains & Rekayasa' : 'Scientific & Engineering Pillars'}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
            {language === 'id' ? '4 Terobosan Teknologi Wanareksa' : '4 Core Technological Breakthroughs of Wanareksa'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          
          <ObsidianSpotlightCard spotlightColor="rgba(2, 132, 199, 0.12)">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                1. Grid Spasial Equal-Area 5.5 km
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Menyatukan piksel resolusi 375 m VIIRS ke dalam footprint setara MODIS 1 km untuk mengeliminasi bias hitung ganda lintas generasi sensor.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 mt-3 block">
              Proyeksi Spasial Equal-Area
            </span>
          </ObsidianSpotlightCard>

          <ObsidianSpotlightCard spotlightColor="rgba(245, 158, 11, 0.12)">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                2. Kalibrasi Radiatif FRP
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Menstandarkan energi radiatif api lintas 4 instrumen satelit menggunakan hukum Stefan-Boltzmann pada kanal inframerah termal 3.9 µm dan 3.74 µm.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 mt-3 block">
              Model Radiasi Termal
            </span>
          </ObsidianSpotlightCard>

          <ObsidianSpotlightCard spotlightColor="rgba(220, 38, 38, 0.12)">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                3. Integrasi Batas Kritis Gambut
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Memadukan ambang tinggi muka air tanah BRGM (TMAG -40 cm) untuk mengidentifikasi kawasan gambut rentan sebelum api menjalar ke bawah permukaan.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400 mt-3 block">
              Peringatan Dini BRGM
            </span>
          </ObsidianSpotlightCard>

          <ObsidianSpotlightCard spotlightColor="rgba(2, 132, 199, 0.12)">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shadow-xs">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                4. Citra Asli NASA GIBS &amp; FIRMS
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Menyajikan citra satelit harian NASA GIBS WMTS dan live feed FIRMS 24 jam dengan opsi ekspor GeoJSON standar untuk analisis lanjutan di QGIS dan ArcGIS.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-400 mt-3 block">
              NASA GIBS WMTS Level 9
            </span>
          </ObsidianSpotlightCard>

        </div>
      </section>

      {/* 5. HISTORIC BENCHMARK CASE STUDIES */}
      <section className="rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#070A10]/70 p-5 sm:p-8 lg:p-10 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {language === 'id' ? 'Validasi Data Historis' : 'Historical Data Validation'}
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-0.5">
              {language === 'id' ? '3 Studi Kasus Kebakaran Hutan di Indonesia' : '3 Extreme Indonesian Fire Disaster Benchmarks'}
            </h2>
          </div>
          
          <button
            onClick={() => onSelectTab('overview')}
            className="w-full sm:w-auto h-11 min-h-[44px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>{language === 'id' ? 'Uji di Dashboard' : 'Test in Dashboard'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#111827] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 uppercase">
              Krisis El Niño
            </span>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              El Niño 2015 (Kalteng &amp; Sumsel)
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Pelepasan energi radiatif FRP melebihi 12.400 MW. Menguji ketahanan algoritma saat transisi awal data MODIS ke VIIRS pada kondisi kekeringan ekstrem.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#111827] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 uppercase">
              Anomali Dipole
            </span>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Indian Ocean Dipole (IOD+) 2019
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Kebakaran gambut di Kubah Gambut OKI dan Ketapang. Memvalidasi korelasi penurunan muka air tanah gambut dengan lonjakan sebaran titik api.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#111827] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 uppercase">
              Evaluasi Restorasi
            </span>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              Restorasi BRGM 2022–2026 (Riau)
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Penyekatan kanal menjaga muka air tanah (TMAG &gt; -25 cm), tercermin pada penurunan titik api sebesar 85% dibanding dekade sebelumnya.
            </p>
          </div>
        </div>
      </section>

      {/* 6. DEVELOPER TERMINAL & REPOSITORY CTA */}
      <section className="rounded-2xl sm:rounded-3xl bg-[#070A10] text-white border border-neutral-800 p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-neutral-800">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight">
              {language === 'id' ? 'Mulai Eksplorasi Data Satelit Karhutla' : 'Explore Indonesian Satellite Fire Intelligence'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              Buka peta interaktif 26 tahun, telusuri kalender musim kebakaran 52-minggu, uji simulator lab harmonisasi, atau unduh dataset terkalibrasi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('overview')}
              className="w-full sm:w-auto h-12 min-h-[48px] px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{language === 'id' ? 'Buka Dashboard Sekarang' : 'Launch Dashboard Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectTab('team')}
              className="w-full sm:w-auto h-12 min-h-[48px] px-5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{language === 'id' ? 'Profil Kreator' : 'Creator Profile'}</span>
            </button>
          </div>
        </div>

        {/* Mini Command Line Prompt */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#030508] border border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-300 min-w-0 max-w-full overflow-x-auto py-1">
            <Terminal className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-neutral-500">$</span>
            <span className="text-sky-300 truncate">git clone https://github.com/Rangga11268/Wanareksa.git</span>
          </div>

          <button
            onClick={handleCopyClone}
            className="w-full sm:w-auto min-h-[40px] sm:min-h-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer shrink-0"
          >
            {copiedClone ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
            <span>{copiedClone ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>
      </section>

    </div>
  );
};


