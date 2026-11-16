import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Globe2, ShieldAlert } from 'lucide-react';
import { Language } from '../data/translations';

interface CinematicIntroTourProps {
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  isOpen: boolean;
  onClose: () => void;
  onEnterApp?: (mode?: 'citizen' | 'science') => void;
}

export const CinematicIntroTour: React.FC<CinematicIntroTourProps> = ({
  language,
  onToggleLanguage,
  isOpen,
  onClose,
  onEnterApp,
}) => {
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const handleEnter = (targetMode: 'citizen' | 'science' = 'science') => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      try {
        localStorage.setItem('wanareksa_intro_seen', 'true');
      } catch (e) {}
      if (onEnterApp) onEnterApp(targetMode);
      onClose();
      setIsExiting(false);
    }, 200);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter('science');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleEnter('citizen');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExiting]);

  if (!isOpen) return null;

  const content = (
    <div
      className={`fixed inset-0 z-[100000] bg-[#070b14] text-slate-100 flex flex-col min-h-dvh sm:justify-between font-sans select-none overflow-y-auto transition-opacity duration-200 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* High-Resolution Satellite & Earth Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/terra_hero_satellite_earth.jpg"
          alt="NASA Terra Satellite Orbiting Earth"
          className="w-full h-full object-cover object-center opacity-30 scale-105 filter brightness-90"
        />
        {/* Dark Vignette & Readability Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/95 via-[#070b14]/85 to-[#070b14]/98" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#070b14_80%)] opacity-80" />
      </div>

      {/* Top Telemetry Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-10 pt-4 sm:pt-8 pb-3 sm:pb-4 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-xs">
        {/* Dual Brand Lockup: Wanareksa Emblem × NASA Insignia */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#0b1b36] border border-blue-500/40 p-1 sm:p-1.5 flex items-center justify-center shadow-lg shadow-blue-950 shrink-0">
            <img
              src="/wanareksa_logo.svg"
              alt="Wanareksa Emblem"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-slate-500 font-mono text-xs shrink-0">×</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shadow-md shadow-blue-950 shrink-0">
            <img
              src="/nasa_meatball.svg"
              alt="NASA"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="ml-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                Wanareksa
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/70 shrink-0">
                SPACE APPS 2026
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-mono hidden sm:block">
              EOS-AM1 (MODIS) & SUOMI-NPP (VIIRS) CLIMATOLOGY ENGINE
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700 text-xs font-mono font-semibold shrink-0">
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-2.5 py-1 rounded transition cursor-pointer text-xs ${
              language === 'en' ? 'bg-[#0b3d91] text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onToggleLanguage('id')}
            className={`px-2.5 py-1 rounded transition cursor-pointer text-xs ${
              language === 'id' ? 'bg-[#0b3d91] text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            ID
          </button>
        </div>
      </header>

      {/* Main Single Page Content (Editorial Mission Briefing) */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-10 py-6 sm:py-10 my-auto flex flex-col items-center text-center space-y-4 sm:space-y-6 md:space-y-7">
        
        {/* Prominent Logo Crest Badge */}
        <div className="flex flex-col items-center space-y-2 sm:space-y-3">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[#0b1b36]/90 border border-blue-400/50 p-2 sm:p-2.5 flex items-center justify-center shadow-2xl shadow-blue-950/80 backdrop-blur-md">
            <img
              src="/wanareksa_logo.svg"
              alt="Wanareksa Logo"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-blue-400 uppercase font-bold">
            {language === 'id'
              ? 'BRIEFING MISI OBSERWASI BUMI NASIONAL'
              : 'EARTH OBSERVATION MISSION BRIEFING'}
          </div>
        </div>

        {/* Solid Editorial Headline */}
        <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-snug sm:leading-tight max-w-3xl">
          {language === 'id'
            ? 'Menyelaraskan 26 Tahun Sains Satelit NASA untuk Perlindungan Gambut Indonesia'
            : 'Harmonizing 26 Years of NASA Satellite Science for Indonesian Peatlands'}
        </h1>

        {/* Problem Statement & Solution Narrative */}
        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
          {language === 'id'
            ? 'Peralihan sensor optik dari Terra MODIS (1 km) ke Suomi-NPP VIIRS (375 m) menyebabkan lonjakan data titik api semu hingga 300%. Wanareksa merekonsiliasi seluruh data historis 2000-2026 ke dalam grid sel 5.5 km dan daya radiasi termal Stefan-Boltzmann untuk deteksi kebakaran bawah tanah yang akurat.'
            : 'The optical sensor transition from Terra MODIS (1 km) to Suomi-NPP VIIRS (375 m) caused an artificial 300% surge in raw fire counts. Wanareksa reconciles the entire 2000-2026 archive into a 5.5 km equal-area grid and Stefan-Boltzmann thermal power calibration for accurate peat fire mitigation.'}
        </p>

        {/* Scientific Evidence Numbers Table */}
        <div className="w-full max-w-2xl border-y border-slate-800/90 py-3 sm:py-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-left backdrop-blur-xs bg-slate-950/40 rounded-xl px-3 sm:px-4">
          <div className="border-l-2 border-blue-500 pl-2.5 sm:pl-3">
            <div className="text-base sm:text-xl font-black text-white font-mono">2000-2026</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              {language === 'id' ? 'Arsip 26 Tahun' : '26-Year Archive'}
            </div>
          </div>

          <div className="border-l-2 border-emerald-500 pl-2.5 sm:pl-3">
            <div className="text-base sm:text-xl font-black text-white font-mono">5.5 km</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              {language === 'id' ? 'Grid Equal-Area' : 'Equal-Area Grid'}
            </div>
          </div>

          <div className="border-l-2 border-amber-500 pl-2.5 sm:pl-3">
            <div className="text-base sm:text-xl font-black text-white font-mono">14.9M Ha</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              {language === 'id' ? 'Kubah Gambut' : 'Peat Domes'}
            </div>
          </div>

          <div className="border-l-2 border-red-500 pl-2.5 sm:pl-3">
            <div className="text-base sm:text-xl font-black text-white font-mono">-40 cm</div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              {language === 'id' ? 'Ambang TMAG' : 'Critical TMAG'}
            </div>
          </div>
        </div>

        {/* Dual Mode Entry Buttons (Dewan Juri & Peneliti vs Portal Warga) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full max-w-xl">
          {/* Primary CTA: Mode Sains (Targeted at Hackathon Judges) */}
          <button
            onClick={() => handleEnter('science')}
            className="flex-1 min-h-[50px] px-5 py-3 bg-[#0b3d91] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-blue-400/40 shadow-xl shadow-blue-950 flex items-center justify-between gap-3 cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe2 className="w-5 h-5 text-sky-300 shrink-0" />
              <div className="text-left min-w-0">
                <div className="font-extrabold text-white text-xs sm:text-sm truncate">
                  {language === 'id' ? 'Mode Sains & Satgas' : 'Science & Satgas Mode'}
                </div>
                <div className="text-[10px] font-mono text-sky-200 opacity-80 truncate">
                  {language === 'id' ? 'Dewan Juri & Riset 26 Thn' : 'For Judges & 26-Yr Archive'}
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-200 shrink-0" />
          </button>

          {/* Secondary CTA: Mode Warga */}
          <button
            onClick={() => handleEnter('citizen')}
            className="flex-1 min-h-[50px] px-5 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-slate-700/80 shadow-md flex items-center justify-between gap-3 cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-left min-w-0">
                <div className="font-extrabold text-white text-xs sm:text-sm truncate">
                  {language === 'id' ? 'Portal Warga' : 'Citizen Portal'}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {language === 'id' ? 'Aksi Cepat & Siaga Asap' : 'Rapid Action & Smoke Defense'}
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 opacity-60" />
          </button>
        </div>
        <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">
          {language === 'id' ? 'Pilih mode di atas untuk memulai eksplorasi' : 'Select a mode above to begin exploration'}
        </span>

      </main>

      {/* Clean Scientific Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-10 py-3 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 border-t border-slate-800/80 text-[10px] sm:text-[11px] font-mono text-slate-400 text-center sm:text-left backdrop-blur-xs">
        <div>
          NASA GODDARD SPACE FLIGHT CENTER // EARTH SCIENCE DIVISION
        </div>
        <div>
          INDONESIA EQUATORIAL GRID // 0.7893° S, 113.9213° E
        </div>
      </footer>
    </div>
  );

  return createPortal(content, document.body);
};
