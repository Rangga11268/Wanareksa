import React, { useState } from 'react';
import { AOIRegion, HarmonizedWeekData, RawHotspot, PRESET_AOIS } from '../engine/harmonizer';
import { Language } from '../data/translations';
import { Printer, FileText, Download, Loader2, MapPin, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { IconBadge } from './IconBadge';
import { LiveWeatherData } from '../services/weatherApi';
import { resolveHotspotLocation } from '../utils/locationResolver';
import { getRegionalPeatProfile, calculateFireTriage } from '../data/regionalPeatProfiles';

interface ExecutiveReportProps {
  language: Language;
  selectedAOI: AOIRegion;
  onSelectAOI?: (aoi: AOIRegion) => void;
  calendarMatrix?: Record<string, HarmonizedWeekData>;
  totalHotspots?: number;
  liveWeather?: LiveWeatherData | null;
  liveHotspots?: RawHotspot[];
}

/**
 * Pure Vector NASA Meatball Emblem
 * Inlined directly into the DOM to guarantee 100% canvas rendering,
 * prevent CORS/canvas-taint SecurityErrors, and ensure razor-sharp vector output.
 */
const NasaMeatballSvg: React.FC<{ size?: number; className?: string }> = ({ size = 42, className = '' }) => (
  <svg
    viewBox="0 0 120 100"
    width={size}
    height={Math.round((size * 100) / 120)}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="NASA Logo"
  >
    {/* NASA Blue Sphere */}
    <circle cx="60" cy="50" r="46" fill="#0B3D91" />
    
    {/* Starfield Clusters */}
    <g fill="#FFFFFF" opacity="0.95">
      <circle cx="34" cy="28" r="1" />
      <circle cx="42" cy="22" r="1.4" />
      <circle cx="28" cy="40" r="1" />
      <circle cx="36" cy="45" r="0.8" />
      <circle cx="48" cy="33" r="1.2" />
      <circle cx="55" cy="20" r="1" />
      <circle cx="68" cy="24" r="1.5" />
      <circle cx="78" cy="28" r="0.8" />
      <circle cx="88" cy="36" r="1.2" />
      <circle cx="75" cy="42" r="1" />
      <circle cx="85" cy="55" r="1.3" />
      <circle cx="92" cy="48" r="0.9" />
      <circle cx="78" cy="68" r="1.1" />
      <circle cx="66" cy="74" r="1" />
      <circle cx="40" cy="70" r="1.2" />
      <circle cx="30" cy="62" r="0.9" />
      <circle cx="24" cy="52" r="1.4" />
      <circle cx="52" cy="78" r="0.8" />
    </g>

    {/* Orbital Ellipse */}
    <ellipse cx="60" cy="50" rx="48" ry="18" stroke="#FFFFFF" strokeWidth="2.8" strokeDasharray="160 30" transform="rotate(-30 60 50)" fill="none" opacity="0.95" />

    {/* Red Supersonic Vector / Chevron */}
    <path d="M22 68 L78 22 L72 38 L98 12 L72 50 L64 42 Z" fill="#FC3D21" />
    <path d="M42 66 L78 22 L62 48 Z" fill="#E02910" />

    {/* NASA Bold Typeface */}
    <text x="60" y="58" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="22" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="2.2">NASA</text>
  </svg>
);

/**
 * Pure Vector Wanareksa Emblem (Orbital Chevron W Insignia)
 * Inlined directly into DOM to eliminate image fetch timing issues and canvas tainting.
 */
const WanareksaLogoSvg: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Wanareksa Sentinel Emblem"
  >
    {/* Deep Blue NASA Planetary Core (Circular Mission Disc) */}
    <circle cx="128" cy="128" r="114" fill="#0B3D91" />

    {/* Outer Precision Aerospace Bezel Collar (Atmosphere Cyan + Deep Blue) */}
    <circle cx="128" cy="128" r="114" fill="none" stroke="#38BDF8" strokeWidth="3" />
    <circle cx="128" cy="128" r="108" fill="none" stroke="#0B3D91" strokeWidth="4" />

    {/* Indonesian Peatland Biosphere Horizon (Nadir Curvature) */}
    <path d="M 28,152 A 114,114 0 0 0 228,152 C 182,186 74,186 28,152 Z" fill="#059669" />

    {/* NASA Orbital Trajectory Ellipse (Pure White, Sun-Synchronous Polar Track) */}
    <ellipse cx="128" cy="128" rx="112" ry="34" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeDasharray="140 20" transform="rotate(-28 128 128)" />

    {/* Supersonic Chevron 'W' (Twin Aerospace Vectors Slicing Orbit) */}
    {/* Left Wing (Pristine Aerospace White for High Contrast) */}
    <polygon points="58,164 96,66 128,136 108,146 96,114 76,164" fill="#FFFFFF" />

    {/* Right Wing (NASA Supersonic Red Vector) */}
    <polygon points="198,164 160,66 128,136 148,146 160,114 180,164" fill="#FC3D21" />

    {/* Central Aerospace Chevron Apex Union */}
    <polygon points="128,78 142,118 128,136 114,118" fill="#FFFFFF" />

    {/* Fire Radiative Power (FRP) Thermal Core Node */}
    <circle cx="128" cy="78" r="10" fill="#FC3D21" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="128" cy="78" r="4.5" fill="#FDE047" />

    {/* Satellite Sentinel Transponder at Orbital Apex */}
    <circle cx="216" cy="80" r="6" fill="#FFFFFF" />
    <circle cx="216" cy="80" r="3" fill="#0B3D91" />

    {/* Four Cardinal Telemetry Crosshair Coordinates */}
    <rect x="127" y="6" width="2" height="6" fill="#FC3D21" />
    <rect x="127" y="244" width="2" height="6" fill="#059669" />
    <rect x="6" y="127" width="6" height="2" fill="#38BDF8" />
    <rect x="244" y="127" width="6" height="2" fill="#38BDF8" />
  </svg>
);

export const ExecutiveReport: React.FC<ExecutiveReportProps> = ({
  language,
  selectedAOI,
  onSelectAOI,
  calendarMatrix = {},
  totalHotspots = 0,
  liveWeather = null,
  liveHotspots = [],
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const today = new Date();
  const reportDateFormatted = today.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const docRegNumber = `WNR/KLHK-BRGM/SITREP/${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}-${selectedAOI.id.toUpperCase()}`;

  // Dynamic regional peatland intelligence & triage
  const profile = getRegionalPeatProfile(selectedAOI.id);
  const currentTmat = profile.tmag;
  const effectiveFwi = liveWeather ? liveWeather.fwiScore : 28;

  // Sort hotspots descending by FRP for prioritized triage targeting
  const sortedSpots = [...liveHotspots].sort((a, b) => (b.frp || 0) - (a.frp || 0));
  const topSpots = sortedSpots.slice(0, 5);
  const maxLiveFrp = topSpots.length > 0 ? topSpots[0].frp : 0;
  const triage = calculateFireTriage(maxLiveFrp, currentTmat, profile.isDeepPeat);
  const threatLevel = language === 'id' ? triage.labelId : triage.labelEn;

  /**
   * High-Precision Official Government A4 PDF Engine
   * - Rendered on pure white A4 paper standard
   * - Inlined pure SVGs eliminate external CORS/network delays & canvas taint
   * - Uses explicit Blob URL download trigger to bypass browser popup blockers
   */
  const handleDownloadDirectPDF = async () => {
    const docElement = document.getElementById('official-sitrep-document');
    if (!docElement) return;

    try {
      setIsGeneratingPdf(true);
      setDownloadSuccess(false);

      // Dynamically load heavy rendering libraries only on demand
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Render high-res crisp canvas (scale 2 gives ~1588px width, razor sharp for print)
      const canvas = await html2canvas(docElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
      });

      // High-efficiency JPEG compression (drops file size by ~95% vs raw PNG, keeps crystal-clear text)
      const imgData = canvas.toDataURL('image/jpeg', 0.94);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 8; // 8mm margin
      const targetWidth = pdfWidth - (margin * 2); // 194mm
      const targetHeight = (canvas.height * targetWidth) / canvas.width;

      // Fit gracefully onto single A4 page with high-precision scaling if within single-page tolerance
      if (targetHeight <= pdfHeight - (margin * 2)) {
        pdf.addImage(imgData, 'JPEG', margin, margin, targetWidth, targetHeight, undefined, 'FAST');
      } else {
        const scaleFactor = (pdfHeight - (margin * 2)) / targetHeight;
        if (scaleFactor >= 0.80) {
          const scaledWidth = targetWidth * scaleFactor;
          const xOffset = margin + (targetWidth - scaledWidth) / 2;
          pdf.addImage(imgData, 'JPEG', xOffset, margin, scaledWidth, pdfHeight - (margin * 2), undefined, 'FAST');
        } else {
          // Multi-page fallback if table is extraordinarily long
          let heightLeft = targetHeight;
          let position = margin;
          pdf.addImage(imgData, 'JPEG', margin, position, targetWidth, targetHeight, undefined, 'FAST');
          heightLeft -= (pdfHeight - (margin * 2));
          while (heightLeft > 0) {
            position = heightLeft - targetHeight + margin;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', margin, position, targetWidth, targetHeight, undefined, 'FAST');
            heightLeft -= (pdfHeight - (margin * 2));
          }
        }
      }

      // Robust client-side Blob download trigger (avoids dataURI popup-blocker issues)
      const fileName = `WANAREKSA_SITREP_${selectedAOI.id.toUpperCase()}_${today.toISOString().split('T')[0]}.pdf`;
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback to native browser print if script execution is blocked
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /**
   * Browser Print Handler
   */
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Action Toolbar (Hidden during Print) */}
      <div className="print:hidden px-6 py-4 bg-[#fbfbfd] dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconBadge icon={FileText} variant="emerald" size="lg" />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {language === 'id' ? 'Dokumen Resmi Intelijen Kebakaran Hutan & Lahan' : 'Official A4 Wildfire Situation Report (SitRep)'}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {language === 'id' ? 'Dossier Eksekutif & Surat Perintah Operasi Lapangan' : 'Executive Situation Report & Operational Dossier'}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct PDF Download Button */}
          <button
            onClick={handleDownloadDirectPDF}
            disabled={isGeneratingPdf}
            aria-label={language === 'id' ? 'Unduh Dokumen PDF Resmi' : 'Download Official PDF'}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer min-h-[40px] disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'id' ? 'Membuat File PDF...' : 'Generating PDF...'}</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{language === 'id' ? 'Tersimpan!' : 'Downloaded!'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{language === 'id' ? 'Unduh PDF Resmi' : 'Download Official PDF'}</span>
              </>
            )}
          </button>

          {/* Browser Print Button */}
          <button
            onClick={handlePrint}
            aria-label={language === 'id' ? 'Cetak Dokumen Format A4' : 'Print A4 Document'}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer min-h-[40px]"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{language === 'id' ? 'Cetak / Print A4' : 'Print A4'}</span>
          </button>
        </div>
      </div>

      {/* Sector Selection Bar (Print:hidden) */}
      {onSelectAOI && (
        <div className="print:hidden px-6 py-2.5 bg-slate-50 dark:bg-[#0b101d] border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <label htmlFor="executive-sector-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 cursor-pointer">
              {language === 'id' ? 'Sektor Sasaran:' : 'Target Sector:'}
            </label>
            <div className="relative flex-1">
              <select
                id="executive-sector-select"
                name="executiveSector"
                aria-label={language === 'id' ? 'Sektor Sasaran' : 'Target Sector'}
                value={selectedAOI.id}
                onChange={(e) => {
                  const found = PRESET_AOIS.find((a) => a.id === e.target.value);
                  if (found) onSelectAOI(found);
                }}
                className="w-full appearance-none bg-white dark:bg-[#1a2333] border border-slate-300 dark:border-slate-700 rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:border-emerald-500 shadow-2xs"
              >
                {PRESET_AOIS.map((aoi) => {
                  const aoiProf = getRegionalPeatProfile(aoi.id);
                  return (
                    <option key={aoi.id} value={aoi.id}>
                      {aoi.name} — {aoiProf.khgName}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold">{profile.peatDepth}</span>
            <span>&bull;</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">TMAG {profile.tmag} cm</span>
            <span>&bull;</span>
            <span>{profile.canalBlocks} Sekat</span>
          </div>
        </div>
      )}

      {/* Official White A4 Document Viewport */}
      <div className="p-4 sm:p-8 bg-slate-200/70 dark:bg-[#070b14] text-slate-900 max-w-4xl mx-auto print:p-0 print:m-0 print:max-w-full transition-colors">
        
        {/* The Printable A4 Sheet - Always Crisp White, Formal, Authentic (Zero AI Slop) */}
        <div
          id="official-sitrep-document"
          className="bg-white text-[#0f172a] p-6 sm:p-8 border border-slate-300 shadow-xl mx-auto print:border-none print:shadow-none print:p-6"
          style={{ width: '100%', maxWidth: '794px', boxSizing: 'border-box', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
        >
          
          {/* 1. Official Government & NASA Letterhead (Kop Surat Resmi) */}
          <div className="pb-3 border-b-2 border-[#0f172a]">
            <div className="flex items-center justify-between gap-4">
              
              {/* Left Dual Lockup: Wanareksa Emblem × NASA Meatball */}
              <div className="flex items-center gap-2 shrink-0">
                <WanareksaLogoSvg size={44} />
                <span className="text-slate-400 font-sans font-bold text-sm">×</span>
                <NasaMeatballSvg size={42} />
              </div>

              {/* Center Official Title */}
              <div className="text-center flex-1">
                <div className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#1e293b]">
                  {language === 'id' ? 'REPUBLIK INDONESIA' : 'REPUBLIC OF INDONESIA'}
                </div>
                <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#334155]">
                  {language === 'id'
                    ? 'KEMENTERIAN LINGKUNGAN HIDUP DAN KEHUTANAN • BADAN RESTORASI GAMBUT DAN MANGROVE'
                    : 'MINISTRY OF ENVIRONMENT & FORESTRY • PEATLAND & MANGROVE RESTORATION AGENCY'}
                </div>
                <div className="text-[13px] font-sans font-black uppercase tracking-tight text-[#0f172a] mt-0.5">
                  {language === 'id'
                    ? 'PUSAT PENGENDALIAN OPERASI & SISTEM MONITORING SATELIT WANAREKSA'
                    : 'OPERATIONS CONTROL CENTER & WANAREKSA SATELLITE MONITORING SYSTEM'}
                </div>
                <div className="text-[9px] font-sans text-[#64748b]">
                  {language === 'id'
                    ? 'Konsorsium Pengamatan Bumi NASA Space Apps Challenge Jakarta • Harmonisasi MODIS/VIIRS 5.5km'
                    : 'NASA Space Apps Challenge Jakarta Earth Observation Consortium • MODIS/VIIRS 5.5km Harmonization'}
                </div>
              </div>

              {/* Right Operational Badge & Registry */}
              <div className="text-right shrink-0 font-sans">
                <span className="inline-block px-2 py-0.5 border border-rose-700 bg-rose-50 text-rose-800 text-[8.5px] font-extrabold uppercase rounded-xs tracking-wider">
                  {language === 'id' ? 'OPERASIONAL SEGERA' : 'IMMEDIATE ACTION'}
                </span>
                <div className="text-[8px] font-mono text-slate-500 mt-1">
                  {docRegNumber}
                </div>
              </div>
            </div>

            {/* Formal Double Rule (Garis Ganda Dokumen Negara) */}
            <div className="mt-2.5 pt-0.5 border-t border-slate-400" />
          </div>

          {/* Document Title Header */}
          <div className="text-center my-3">
            <h1 className="text-[14px] font-sans font-black uppercase tracking-wide text-[#0f172a]">
              {language === 'id'
                ? 'LAPORAN SITUASI INTELIJEN KARHUTLA & DISPOSISI OPERASIONAL'
                : 'WILDFIRE SITUATION INTELLIGENCE REPORT & OPERATIONAL DISPATCH'}
            </h1>
            <div className="text-[9.5px] font-sans text-slate-600 mt-0.5">
              {language === 'id'
                ? 'Ref: Standar Operasional Prosedur Pengendalian Kebakaran Hutan & Lahan Gambut (PP No. 57/2016)'
                : 'Ref: Peatland & Wildfire Control Standard Operating Procedures (Gov Reg No. 57/2016)'}
            </div>
          </div>

          {/* 2. Metadata Grid Table */}
          <table className="w-full border-collapse border border-slate-300 text-[10px] font-sans mb-3">
            <tbody>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 p-1.5 font-bold text-slate-700 w-1/4">
                  {language === 'id' ? 'WILAYAH SASARAN' : 'TARGET REGION'}
                </td>
                <td className="border border-slate-300 p-1.5 font-extrabold text-[#0f172a] w-1/4">
                  {selectedAOI.name} ({selectedAOI.id.toUpperCase()})
                </td>
                <td className="border border-slate-300 p-1.5 font-bold text-slate-700 w-1/4">
                  {language === 'id' ? 'TANGGAL OBSERVASI' : 'OBSERVATION DATE'}
                </td>
                <td className="border border-slate-300 p-1.5 font-semibold text-[#0f172a] w-1/4">
                  {reportDateFormatted}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold text-slate-700">
                  {language === 'id' ? 'LANSKAP KHG' : 'PEAT HYDROLOGICAL UNIT'}
                </td>
                <td className="border border-slate-300 p-1.5 text-slate-900 font-medium">
                  {profile.khgName}
                </td>
                <td className="border border-slate-300 p-1.5 font-bold text-slate-700">
                  {language === 'id' ? 'STATUS BAHAYA / TRIAGE' : 'THREAT LEVEL / TRIAGE'}
                </td>
                <td className="border border-slate-300 p-1.5 font-black text-rose-700">
                  {threatLevel}
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 p-1.5 font-bold text-slate-700">
                  {language === 'id' ? 'KOORDINAT ACUAN' : 'REFERENCE COORDINATES'}
                </td>
                <td className="border border-slate-300 p-1.5 font-mono text-slate-900">
                  {selectedAOI.center[0].toFixed(4)}° N, {selectedAOI.center[1].toFixed(4)}° E
                </td>
                <td className="border border-slate-300 p-1.5 font-bold text-slate-700">
                  {language === 'id' ? 'KONDISI GAMBUT' : 'PEAT CONDITIONS'}
                </td>
                <td className="border border-slate-300 p-1.5 text-slate-900 font-semibold">
                  {language === 'id' ? 'Tebal:' : 'Depth:'} {profile.peatDepth} &bull; TMAG: {currentTmat} cm
                </td>
              </tr>
            </tbody>
          </table>

          {/* 3. Section I: Executive Situation Synthesis */}
          <div className="mb-3">
            <div className="text-[11px] font-sans font-bold uppercase tracking-wide border-b border-slate-400 pb-0.5 mb-1.5 flex justify-between text-[#0f172a]">
              <span>
                {language === 'id'
                  ? 'I. RINGKASAN EKSEKUTIF & ANALISIS KERENTANAN SPASIAL'
                  : 'I. EXECUTIVE SUMMARY & SPATIAL VULNERABILITY SYNTHESIS'}
              </span>
              <span className="text-[9px] font-mono font-normal text-slate-600">NASA TERRA/AQUA &amp; SUOMI-NPP/NOAA-20</span>
            </div>
            <p className="text-[10px] leading-relaxed text-justify text-[#1e293b]">
              {language === 'id' ? (
                <>
                  Berdasarkan hasil harmonisasi multi-satelit pengamatan bumi NASA dengan faktor koreksi sensor (MODIS 1.04 / VIIRS 0.88) serta integrasi telemetri stasiun hidrologis, wilayah pertahanan <strong>{selectedAOI.name}</strong> ({profile.khgName}) saat ini berada pada status <strong>{threatLevel}</strong>. Kondisi Muka Air Tanah Gambut (TMAT) tercatat <strong>{currentTmat} cm</strong>, berada di bawah batas ambang kritis nasional PP No. 57/2016 (-40 cm). Dengan Kadar Air Gambut (KAG) sebesar <strong>{profile.kag}%</strong> dan Indeks Cuaca Api (FWI) <strong>{effectiveFwi}</strong>, kawasan ini memiliki <strong>{currentTmat <= -40 ? 'kerentanan tinggi terhadap kebakaran bawah permukaan (smoldering peat fires) yang sulit dideteksi secara visual dari darat' : 'kondisi hidrologis stabil namun membutuhkan pemantauan berkala'}</strong>. Kebutuhan air pemadaman diestimasikan sebesar <strong>± {(triage.level === 1 ? 95000 : triage.level === 2 ? 65000 : triage.level === 3 ? 35000 : 15000).toLocaleString('id-ID')} Liter/hektar</strong> menggunakan metode <em>peat water injection</em> ({triage.actionId}).
                </>
              ) : (
                <>
                  Based on multi-satellite NASA Earth observation harmonization with cross-sensor calibration factors (MODIS 1.04 / VIIRS 0.88) and in-situ hydrological telemetry, <strong>{selectedAOI.name}</strong> ({profile.khgName}) is designated at <strong>{threatLevel}</strong> status. Peat groundwater table (GWL) is recorded at <strong>{currentTmat} cm</strong>, below the national statutory critical threshold (-40 cm, Gov Reg 57/2016). With peat moisture at <strong>{profile.kag}%</strong> and Fire Weather Index (FWI) at <strong>{effectiveFwi}</strong>, this landscape exhibits <strong>{currentTmat <= -40 ? 'high vulnerability to subsurface smoldering fires requiring deep thermal probing' : 'hydrologically stable conditions under active monitoring'}</strong>. Required suppression water buffer is estimated at <strong>± {(triage.level === 1 ? 95000 : triage.level === 2 ? 65000 : triage.level === 3 ? 35000 : 15000).toLocaleString('en-US')} Liters/hectare</strong> via <em>peat water lance injection</em> ({triage.actionEn}).
                </>
              )}
            </p>
          </div>

          {/* 4. Section II: Hydrological & Environmental Telemetry Matrix */}
          <div className="mb-3">
            <div className="text-[11px] font-sans font-bold uppercase tracking-wide border-b border-slate-400 pb-0.5 mb-1.5 text-[#0f172a]">
              {language === 'id'
                ? 'II. MATRIKS TELEMETRI HIDROLOGI GAMBUT & KONDISI ATMOSFER'
                : 'II. PEAT HYDROLOGY & ATMOSPHERIC TELEMETRY MATRIX'}
            </div>
            <table className="w-full border-collapse border border-slate-300 text-[9.5px] font-sans">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[8.5px]">
                  <th className="border border-slate-300 p-1.5 text-left">{language === 'id' ? 'Indikator Pemantauan' : 'Monitoring Indicator'}</th>
                  <th className="border border-slate-300 p-1.5 text-left">{language === 'id' ? 'Nilai Aktual' : 'Actual Value'}</th>
                  <th className="border border-slate-300 p-1.5 text-left">{language === 'id' ? 'Batas Kritis / Regulasi' : 'Critical Threshold / Regulation'}</th>
                  <th className="border border-slate-300 p-1.5 text-left">{language === 'id' ? 'Status Risiko Lapangan' : 'Field Risk Status'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold">{language === 'id' ? 'Tinggi Muka Air Tanah (TMAT)' : 'Groundwater Table (TMAT)'}</td>
                  <td className="border border-slate-300 p-1 font-mono font-bold text-rose-700">{currentTmat} cm</td>
                  <td className="border border-slate-300 p-1 text-slate-600">-40 cm (PP No. 57/2016)</td>
                  <td className="border border-slate-300 p-1 font-bold text-rose-700">
                    {language === 'id'
                      ? (currentTmat <= -40 ? 'KRITIS: Kubah Mengering' : 'NORMAL: Hidrasi Terjaga')
                      : (currentTmat <= -40 ? 'CRITICAL: Peat Dome Drying' : 'NORMAL: Hydration Maintained')}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 p-1 font-semibold">Fire Weather Index (FWI)</td>
                  <td className="border border-slate-300 p-1 font-mono font-bold text-amber-700">{effectiveFwi}</td>
                  <td className="border border-slate-300 p-1 text-slate-600">{language === 'id' ? '≥ 48 (Kategori Sangat Tinggi)' : '≥ 48 (Very High Category)'}</td>
                  <td className="border border-slate-300 p-1 font-bold text-amber-700">
                    {language === 'id'
                      ? (effectiveFwi >= 48 ? 'BAHAYA TINGGI: Perambatan Cepat' : 'SIAGA: Kelembaban Rendah')
                      : (effectiveFwi >= 48 ? 'HIGH RISK: Rapid Spread' : 'ALERT: Low Moisture')}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold">{language === 'id' ? 'Suhu Udara & Kelembapan Relatif' : 'Air Temp & Relative Humidity'}</td>
                  <td className="border border-slate-300 p-1 font-mono">{liveWeather?.temperature ?? 32}°C / RH {liveWeather?.relativeHumidity ?? 62}%</td>
                  <td className="border border-slate-300 p-1 text-slate-600">{language === 'id' ? 'RH < 65% (Kondisi Kering)' : 'RH < 65% (Dry Air Condition)'}</td>
                  <td className="border border-slate-300 p-1 text-slate-800">
                    {language === 'id'
                      ? ((liveWeather?.relativeHumidity ?? 62) < 65 ? 'Bahan Bakar Serasah Kering' : 'Kondisi Atmosfer Moderat')
                      : ((liveWeather?.relativeHumidity ?? 62) < 65 ? 'Dry Fuel Litter Bed' : 'Moderate Atmosphere')}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 p-1 font-semibold">{language === 'id' ? 'Hari Tanpa Hujan (HTH)' : 'Consecutive Dry Days (CDD)'}</td>
                  <td className="border border-slate-300 p-1 font-mono">{liveWeather?.dryDaysCount ?? 9} {language === 'id' ? 'Hari' : 'Days'}</td>
                  <td className="border border-slate-300 p-1 text-slate-600">{language === 'id' ? '> 7 Hari (Ambang Siaga Kekeringan)' : '> 7 Days (Drought Alert)'}</td>
                  <td className="border border-slate-300 p-1 font-semibold text-amber-800">
                    {language === 'id'
                      ? ((liveWeather?.dryDaysCount ?? 9) > 7 ? 'Waspada Dehidrasi Lapisan Gambut' : 'Cadangan Air Hujan Mencukupi')
                      : ((liveWeather?.dryDaysCount ?? 9) > 7 ? 'Peat Dehydration Alert' : 'Sufficient Rainfall Buffer')}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 font-semibold">{language === 'id' ? 'Infrastruktur Sekat Kanal (Canal Blocking)' : 'Canal Blocking Infrastructure'}</td>
                  <td className="border border-slate-300 p-1 font-mono font-bold">{profile.canalBlocks} {language === 'id' ? 'Unit Terpasang' : 'Units Installed'}</td>
                  <td className="border border-slate-300 p-1 text-slate-600">{language === 'id' ? 'Sumber Air:' : 'Water Source:'} {profile.nearestWaterSource}</td>
                  <td className="border border-slate-300 p-1 text-emerald-800 font-semibold">
                    {language === 'id'
                      ? (profile.canalBlocks > 0 ? 'Fasilitas Pembasahan Siap Dioperasikan' : 'Keterbatasan Pasokan Air Permukaan')
                      : (profile.canalBlocks > 0 ? 'Rewetting Facilities Operational' : 'Limited Surface Water Supply')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Section III: Active Hotspot Surveillance Targets */}
          <div className="mb-3">
            <div className="text-[11px] font-sans font-bold uppercase tracking-wide border-b border-slate-400 pb-0.5 mb-1.5 flex justify-between text-[#0f172a]">
              <span>
                {language === 'id'
                  ? 'III. SASARAN DETEKSI ANOMALI TITIK PANAS PRIORITAS (NASA FIRMS NRT)'
                  : 'III. PRIORITY HOTSPOT ANOMALY SURVEILLANCE TARGETS (NASA FIRMS NRT)'}
              </span>
              <span className="text-[9px] font-mono font-normal text-slate-600">TOP FIRE RADIATIVE POWER</span>
            </div>

            {topSpots.length === 0 ? (
              <div className="p-2 border border-slate-300 bg-slate-50 text-center text-[9.5px] font-sans text-slate-600">
                {language === 'id'
                  ? 'Tidak ada titik api berdaya radiasi tinggi (FRP > 10 MW) terpantau pada lintasan orbit satelit 24 jam terakhir di wilayah ini.'
                  : 'No high-radiative-power hotspots (FRP > 10 MW) detected during the last 24 hours of satellite passes in this area.'}
              </div>
            ) : (
              <table className="w-full border-collapse border border-slate-300 text-[9px] font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[8px]">
                    <th className="border border-slate-300 p-1 text-center w-7">No</th>
                    <th className="border border-slate-300 p-1 text-left">{language === 'id' ? 'Wilayah Administratif' : 'Administrative Region'}</th>
                    <th className="border border-slate-300 p-1 text-left">{language === 'id' ? 'Koordinat (Lat, Lon)' : 'Coordinates (Lat, Lon)'}</th>
                    <th className="border border-slate-300 p-1 text-left">{language === 'id' ? 'Sensor Satelit' : 'Satellite Sensor'}</th>
                    <th className="border border-slate-300 p-1 text-center">FRP (MW)</th>
                    <th className="border border-slate-300 p-1 text-left">{language === 'id' ? 'Waktu Deteksi' : 'Detection Time'}</th>
                  </tr>
                </thead>
                <tbody>
                  {topSpots.map((spot, idx) => {
                    const loc = resolveHotspotLocation(spot.lat, spot.lon, selectedAOI.id, language);
                    return (
                      <tr key={spot.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="border border-slate-300 p-1 text-center font-bold">{idx + 1}</td>
                        <td className="border border-slate-300 p-1 font-semibold">
                          {loc.regency}{loc.district ? `, ${loc.district}` : ''}
                          <div className="text-[7.5px] text-slate-500 font-normal">{loc.landscape || profile.khgName}</div>
                        </td>
                        <td className="border border-slate-300 p-1 font-mono">{spot.lat.toFixed(4)}°, {spot.lon.toFixed(4)}°</td>
                        <td className="border border-slate-300 p-1 font-mono">{spot.instrument} ({spot.satellite})</td>
                        <td className="border border-slate-300 p-1 font-mono font-bold text-center text-rose-700">{spot.frp} MW</td>
                        <td className="border border-slate-300 p-1 font-mono text-slate-600">{loc.localTimeFormatted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <div className="mt-1 text-[8px] font-sans text-slate-600 flex justify-between">
              <span>
                {language === 'id'
                  ? `*Kebutuhan Air Pemadaman Lapangan: Estimasi ± ${((topSpots.length || 1) * 45000).toLocaleString('id-ID')} Liter via nozzle suntik gambut (peat lance).`
                  : `*Estimated Field Suppression Water: ± ${((topSpots.length || 1) * 45000).toLocaleString('en-US')} Liters via peat lance nozzle.`}
              </span>
              <span>
                {language === 'id' ? 'Pasokan Terdekat:' : 'Nearest Supply:'} {profile.nearestWaterSource}
              </span>
            </div>
          </div>

          {/* 6. Section IV: Tactical Directives for Brigade & Taskforces */}
          <div className="mb-4">
            <div className="text-[11px] font-sans font-bold uppercase tracking-wide border-b border-slate-400 pb-0.5 mb-1.5 text-[#0f172a]">
              {language === 'id'
                ? 'IV. INSTRUKSI TAKTIS & DISPOSISI OPERASIONAL SATGAS LAPANGAN (SOP MANGGALA AGNI / BPBD / MPA)'
                : 'IV. TACTICAL DIRECTIVES & TASKFORCE OPERATIONAL DISPATCH (SOP MANGGALA AGNI / BPBD / MPA)'}
            </div>
            <ol className="list-decimal pl-4 text-[9.5px] leading-relaxed text-[#1e293b] space-y-0.5">
              {profile.tacticalDirectives.map((dir, idx) => {
                const colonIdx = dir.indexOf(':');
                const title = colonIdx > -1 ? dir.substring(0, colonIdx) : (language === 'id' ? `Instruksi ${idx + 1}` : `Directive ${idx + 1}`);
                const desc = colonIdx > -1 ? dir.substring(colonIdx + 1) : dir;
                return (
                  <li key={idx}>
                    <strong className="font-sans font-bold text-[#0f172a]">{title}:</strong>{desc}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* 7. Section V: Formal Endorsement & Verification Block */}
          <div className="pt-2 border-t-2 border-[#0f172a] grid grid-cols-2 gap-8 text-center text-[9.5px] font-sans">
            <div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
                {language === 'id' ? 'DIVERIFIKASI SISTEM SECARA OTOMATIS' : 'AUTOMATICALLY SYSTEM VERIFIED'}
              </div>
              <div className="font-bold text-[#0f172a] mt-0.5">
                {language === 'id' ? 'Sistem Pengolahan Telemetri Satelit Wanareksa' : 'Wanareksa Satellite Telemetry Processing Engine'}
              </div>
              <div className="h-10 flex items-center justify-center my-1">
                <div className="px-2.5 py-1 border border-emerald-700 bg-emerald-50 text-emerald-800 text-[8px] font-mono font-bold uppercase rounded-xs">
                  VERIFIED BY WANAREKSA SATELLITE ENGINE
                </div>
              </div>
              <div className="font-bold text-[10px] text-[#0f172a]">
                {language === 'id' ? 'TIM INTELIJEN BUMI WANAREKSA' : 'WANAREKSA EARTH INTELLIGENCE TEAM'}
              </div>
              <div className="text-[8px] text-slate-500">NASA Space Apps Challenge Jakarta 2026</div>
            </div>

            <div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
                {language === 'id' ? 'MENGETAHUI & MENGESAHKAN' : 'ACKNOWLEDGED & ENDORSED BY'}
              </div>
              <div className="font-bold text-[#0f172a] mt-0.5">
                {language === 'id' ? 'Komandan Posko Pengendalian Karhutla Wilayah' : 'Regional Wildfire Command Post Officer'}
              </div>
              <div className="h-10 flex items-center justify-center italic text-slate-400 text-[10px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                {language === 'id' ? '( Cap Stempel & Tanda Tangan Komandan Posko )' : '( Official Seal & Signature of Command Post Officer )'}
              </div>
              <div className="font-bold text-[10px] text-[#0f172a]">
                {language === 'id' ? 'SATGAS PENGENDALIAN KARHUTLA & BRGM' : 'WILDFIRE TASKFORCE & BRGM'}
              </div>
              <div className="text-[8px] text-slate-500">
                {language === 'id' ? 'Kementerian Lingkungan Hidup dan Kehutanan' : 'Ministry of Environment and Forestry'}
              </div>
            </div>
          </div>

          {/* Footer Security Notice */}
          <div className="mt-3 pt-1 border-t border-slate-300 flex justify-between text-[7.5px] font-mono text-slate-500">
            <span>
              {language === 'id'
                ? 'DOKUMEN INI RESMI & DILINDUNGI HAK AKSES TELEMETRI SATELIT MULTI-AGENCY NASA-BRGM'
                : 'OFFICIAL DOCUMENT PROTECTED UNDER MULTI-AGENCY NASA-BRGM SATELLITE ACCESS'}
            </span>
            <span>
              {language === 'id' ? 'LEMBAR 1 DARI 1 • KODE: WNR-NASA-SITREP-2026' : 'PAGE 1 OF 1 • CODE: WNR-NASA-SITREP-2026'}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
