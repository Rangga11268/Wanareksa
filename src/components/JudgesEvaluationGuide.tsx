import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Flame,
  Globe,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Radio,
  Share2,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Language, translations } from '../data/translations';
import { AOIRegion, PRESET_AOIS } from '../engine/harmonizer';
import { IconBadge } from './IconBadge';

interface JudgesEvaluationGuideProps {
  language: Language;
  selectedAOI: AOIRegion;
  onSelectAOI: (aoi: AOIRegion) => void;
  rawMode: boolean;
  setRawMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  onSelectScenario: (scenarioId: string | null) => void;
  activeScenario: string | null;
  onSelectTab: (tab: 'overview' | 'lab' | 'mitigation' | 'data-hub' | 'team') => void;
  onOpenTour: () => void;
}

export const JudgesEvaluationGuide: React.FC<JudgesEvaluationGuideProps> = ({
  language,
  selectedAOI,
  onSelectAOI,
  rawMode,
  setRawMode,
  onSelectScenario,
  activeScenario,
  onSelectTab,
  onOpenTour,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      id: 'paradox',
      phase: 'PHASE 01',
      icon: Layers,
      variant: 'sky' as const,
      title: language === 'id' ? 'Paradoks Sensor (Raw vs Harmonisasi)' : 'Sensor Paradox (Raw vs Harmonized)',
      status: rawMode ? (language === 'id' ? 'MODE MENTAH' : 'RAW MODE') : (language === 'id' ? 'TERKALIBRASI' : 'HARMONIZED'),
      desc: language === 'id'
        ? 'Perhatikan lonjakan semu 300% pada data mentah pasca-2012 akibat masuknya VIIRS (375m). Aktifkan saklar kalibrasi untuk melihat data sebenarnya.'
        : 'Observe the artificial 300% surge in raw post-2012 data when VIIRS (375m) launched. Toggle the calibration switch to see equalized truth.',
      actionLabel: rawMode
        ? (language === 'id' ? 'Terapkan Kalibrasi Fisika' : 'Apply Physics Calibration')
        : (language === 'id' ? 'Lihat Data Mentah (Raw)' : 'View Uncorrected Raw'),
      onAction: () => setRawMode((prev) => !prev),
      secondaryAction: () => {
        const kalteng = PRESET_AOIS.find((a) => a.id === 'kalteng') || PRESET_AOIS[1];
        onSelectAOI(kalteng);
      },
      secondaryLabel: language === 'id' ? 'Fokus Kalteng' : 'Focus Central Kalimantan',
    },
    {
      num: 2,
      id: 'scenarios',
      phase: 'PHASE 02',
      icon: Flame,
      variant: 'amber' as const,
      title: language === 'id' ? 'Simulasi 3 Skenario Karhutla Nyata' : 'Simulate 3 Historic Fire Crises',
      status: activeScenario ? (language === 'id' ? 'KASUS AKTIF' : 'ACTIVE CASE') : (language === 'id' ? 'PILIH KASUS' : 'SELECT CASE'),
      desc: language === 'id'
        ? 'Bandingkan krisis asap El Niño 2015, anomali IOD+ 2019, dan efektivitas restorasi sekat kanal BRGM (2022–2026) secara instan.'
        : 'Instantly benchmark the 2015 El Niño smoke crisis, 2019 IOD+ anomaly, and 2022–2026 BRGM canal-blocking restoration impact.',
      actionLabel: language === 'id' ? 'Uji Kasus El Niño 2015' : 'Test 2015 El Niño Crisis',
      onAction: () => onSelectScenario('el_nino_2015'),
      secondaryAction: () => onSelectScenario('restoration_2023'),
      secondaryLabel: language === 'id' ? 'Uji Restorasi BRGM' : 'Test BRGM Restoration',
    },
    {
      num: 3,
      id: 'lab',
      phase: 'PHASE 03',
      icon: Sliders,
      variant: 'purple' as const,
      title: language === 'id' ? 'Uji Rumus Fisika & Monte Carlo' : 'Test Physics Engine & Monte Carlo',
      status: language === 'id' ? 'LAB ILMIAH' : 'SCIENCE LAB',
      desc: language === 'id'
        ? 'Jelajahi kalibrasi energi Stefan-Boltzmann, kurva Muka Air Tanah Gambut (TMAG < -40 cm), dan simulasi ketidakpastian 500 iterasi Monte Carlo.'
        : 'Explore Stefan-Boltzmann thermal energy models, BRGM Peat Water Table curves (TMAG < -40 cm), and 500-run Monte Carlo uncertainty simulations.',
      actionLabel: language === 'id' ? 'Buka Lab Harmonisasi' : 'Open Harmonization Lab',
      onAction: () => onSelectTab('lab'),
      secondaryAction: onOpenTour,
      secondaryLabel: language === 'id' ? 'Tur 30 Detik' : '30-Sec Tour',
    },
    {
      num: 4,
      id: 'mitigation',
      phase: 'PHASE 04',
      icon: ShieldCheck,
      variant: 'emerald' as const,
      title: language === 'id' ? 'Disposisi WhatsApp & Ekspor GIS' : 'WhatsApp SitRep & GIS Export',
      status: language === 'id' ? 'AKSI LAPANGAN' : 'FIELD ACTION',
      desc: language === 'id'
        ? 'Kirim format pesan tanggap darurat Manggala Agni via WhatsApp, salin koordinat GPS, dan unduh layer GeoJSON poligon 5.5 km (RFC 7946).'
        : 'Generate instant WhatsApp field sitreps for Manggala Agni brigades, copy GPS coordinates, and export RFC 7946 GeoJSON polygons for QGIS/ArcGIS.',
      actionLabel: language === 'id' ? 'Buka Pusat Mitigasi' : 'Open Field Mitigation',
      onAction: () => onSelectTab('mitigation'),
      secondaryAction: () => onSelectTab('data-hub'),
      secondaryLabel: language === 'id' ? 'Pusat Data & GeoJSON' : 'Data Hub & GeoJSON',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {language === 'id' ? 'Protokol Evaluasi & Alur Pengujian Juri' : 'Evaluation Protocol & Interactive Testing Steps'}
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {language === 'id'
                ? 'Jelajahi inovasi sains, peta satelit multi-sensor, dan sistem mitigasi karhutla Wanareksa melalui 4 fase pengujian berikut:'
                : "Explore Wanareksa's multi-sensor science, satellite intelligence, and field mitigation across 4 testing phases:"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          title={isCollapsed ? (language === 'id' ? 'Tampilkan Panduan' : 'Expand Guide') : (language === 'id' ? 'Sembunyikan Panduan' : 'Collapse Guide')}
        >
          <span className="hidden sm:inline">{isCollapsed ? (language === 'id' ? 'Buka Panduan' : 'Expand') : (language === 'id' ? 'Tutup' : 'Collapse')}</span>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Roadmap Grid */}
      {!isCollapsed && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                activeStep === step.num
                  ? 'bg-slate-50 dark:bg-slate-900/90 border-sky-500 dark:border-sky-400 shadow-sm ring-1 ring-sky-500/20'
                  : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              onClick={() => setActiveStep(step.num)}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 font-mono text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <IconBadge icon={step.icon} variant={step.variant} size="sm" />
                    <span className="font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                      {step.phase}
                    </span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {step.status}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1.5 leading-snug">
                  {step.title}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {step.desc}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    step.onAction();
                  }}
                  className="w-full py-1.5 px-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center justify-center cursor-pointer min-h-[34px]"
                >
                  <span>{step.actionLabel}</span>
                </button>

                {step.secondaryAction && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      step.secondaryAction();
                    }}
                    className="w-full py-1 px-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-[11px] font-medium transition cursor-pointer min-h-[28px] text-center"
                  >
                    {step.secondaryLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
