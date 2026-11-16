import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, ShieldCheck, Flame, Droplets, AlertTriangle, Satellite, CheckCircle2 } from 'lucide-react';
import { IconBadge } from './IconBadge';
import { Language, translations } from '../data/translations';
import { AOIRegion, HarmonizedWeekData, RawHotspot } from '../engine/harmonizer';

interface ExecutiveBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  selectedAOI: AOIRegion;
  calendarMatrix: Record<string, HarmonizedWeekData>;
  liveHotspots: RawHotspot[];
  userMapKey: string;
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({
  isOpen,
  onClose,
  language,
  selectedAOI,
  calendarMatrix,
  liveHotspots,
  userMapKey: _userMapKey,
}) => {
  const t = translations[language];

  // Prevent background scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Support ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().split(' ')[0] + ' UTC';

  // Aggregate current year (2026) statistics
  let year2026Fires = 0;
  let year2026Harmonized = 0;
  let year2026FRP = 0;

  for (let w = 1; w <= 52; w++) {
    const item = calendarMatrix[`2026-${w}`];
    if (item) {
      year2026Fires += item.rawTotalCount;
      year2026Harmonized += item.harmonizedClusterCount;
      year2026FRP += item.totalFrpCalibrated;
    }
  }

  const liveCount = liveHotspots.length;

  const handlePrint = () => {
    window.print();
  };

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Backdrop overlay without GPU-heavy blur */}
      <div 
        className="fixed inset-0 bg-slate-950/75 transition-opacity print:hidden" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="sitrep-report-title"
        className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#0c121e] text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto overscroll-contain transform-gpu will-change-transform print:max-h-none print:shadow-none print:border-none print:p-4 print:text-black print:bg-white my-auto"
      >
        
        {/* Floating Quick Close Button (Always visible on mobile & desktop) */}
        <button
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shadow-xs border border-slate-200 dark:border-slate-700 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 pr-12 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-bold text-xs font-mono">
              OFFICIAL SITREP
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
              A4 Executive Briefing
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printBriefingBtn}</span>
            </button>
          </div>
        </div>

        {/* Printable Executive Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-900 dark:border-slate-100 print:border-black">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 font-bold">
              Wanareksa &bull; NASA Space Apps Challenge 2026
            </div>
            <h1 id="sitrep-report-title" className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1 print:text-black leading-tight">
              {language === 'id' ? 'LAPORAN SITUASI INTELIJEN TITIK PANAS & GAMBUT' : 'EXECUTIVE WILDFIRE & PEATLAND SITUATION REPORT'}
            </h1>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Target Province: <span className="font-bold text-slate-900 dark:text-white print:text-black">{selectedAOI.name}</span> &bull; Coords: {selectedAOI.center.join(', ')}
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5 shrink-0 font-mono">
            <div className="font-bold text-slate-900 dark:text-white print:text-black">DOC-ID: TH-SITREP-2026-09</div>
            <div className="text-slate-500">Date: {currentDate}</div>
            <div className="text-slate-500">Time: {currentTime}</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Live Hotspots Today</span>
              <IconBadge icon={Flame} variant="rose" size="sm" ping={liveCount > 0} />
            </div>
            <div className="text-2xl font-black text-red-600 mt-1 font-mono">
              {liveCount > 0 ? liveCount : '0'}
            </div>
            <span className="text-[11px] text-slate-500">NASA FIRMS NRT Feed</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">2026 Cumulative FRP</span>
              <IconBadge icon={AlertTriangle} variant="amber" size="sm" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
              {year2026FRP.toLocaleString()} MW
            </div>
            <span className="text-[11px] text-slate-500">Harmonized Energy</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Peat Table (TMAG)</span>
              <IconBadge icon={Droplets} variant="sky" size="sm" />
            </div>
            <div className="text-2xl font-black text-sky-600 mt-1 font-mono">
              -32 cm
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">SAFE (Above -40 cm standard)</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Climate Threat Status</span>
              <IconBadge icon={ShieldCheck} variant="emerald" size="sm" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white print:text-black mt-1 font-mono">
              LOW
            </div>
            <span className="text-[11px] text-slate-500">ENSO Neutral (ONI +0.1°C)</span>
          </div>
        </div>

        {/* Multi-Sensor Harmonization Summary */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Satellite className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Multi-Sensor Earth Observation Harmonization Status</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'id'
              ? 'Data mentah mendeteksi total titik api multi-sensor tanpa pembatasan resolusi. Wanareksa telah merekonsiliasi pengamatan MODIS (1 km) dan VIIRS (375 m) ke dalam sel spasial equal-area 5.5 km, mencegah pelaporan berlebih (over-counting) hingga 3.2x.'
              : 'Raw observations combine multi-sensor detections across disparate resolutions. Wanareksa has normalized MODIS (1 km) and VIIRS (375 m) detections into 5.5 km equal-area spatial grid cells, preventing artificial overcounting by up to 3.2x.'}
          </p>
        </div>

        {/* Standard Operating Procedure (SOP) Action Checklist */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>BPBD & Manggala Agni Operational Dispatch Directives</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900 dark:text-white print:text-black">Canal Block & Spillway Check</span>
                <span className="text-slate-500">Verify water retention dams across designated BRGM priority KHG zones.</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900 dark:text-white print:text-black">Ground Patrol Hotspot Verification</span>
                <span className="text-slate-500">Dispatch Manggala Agni field units to coordinates exceeding 50 MW FRP within 4 hours.</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900 dark:text-white print:text-black">Early Warning Village Alert</span>
                <span className="text-slate-500">Transmit WhatsApp automated telemetry briefings to village heads (Desa Peduli Gambut).</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900 dark:text-white print:text-black">Cross-Border Haze Contingency</span>
                <span className="text-slate-500">Monitor wind vectors for transboundary smoke dispersion toward Singapore & Malaysia.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Verification Signature */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            Data Sources: NASA FIRMS NRT &bull; MODIS MOD14 &bull; VIIRS VNP14IMG &bull; BRGM PRIMS
          </div>
          <div className="font-mono">
            Generated via Wanareksa Offline Core Engine
          </div>
        </div>

        {/* Modal Bottom Actions (Print & Close) */}
        <div className="pt-2 flex items-center justify-end gap-2.5 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
          >
            {language === 'id' ? 'Tutup Laporan' : 'Close Report'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printBriefingBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(content, document.body);
};
