import React, { useState, useEffect } from 'react';
import { Language, translations } from '../data/translations';
import { NavTab } from './Navbar';
import { Logo } from './Logo';
import {
  Orbit,
  Clock,
  ExternalLink,
  ShieldCheck,
  Compass,
  Cpu,
  Flame,
  Database,
  Award,
  Satellite,
  Radio,
  Sparkles,
  MapPin,
  Activity,
  Layers,
  Droplets,
  Thermometer,
} from 'lucide-react';

interface FooterProps {
  language: Language;
  onSelectTab: (tab: NavTab) => void;
}

interface GroundTarget {
  id: string;
  name: string;
  nameId: string;
  coords: string;
  cx: number;
  cy: number;
  color: string;
  depth: string;
  gwl: string;
  status: string;
  statusId: string;
  sensor: string;
}

export const Footer: React.FC<FooterProps> = ({ language, onSelectTab }) => {
  const t = translations[language];

  // Live UTC Space Clock
  const [utcTime, setUtcTime] = useState<string>(() => new Date().toUTCString().slice(17, 25));
  const [selectedSat, setSelectedSat] = useState<'terra' | 'viirs'>('terra');

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toUTCString().slice(17, 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const groundTargets: GroundTarget[] = [
    {
      id: 'riau',
      name: 'Riau • Siak Peat Basin',
      nameId: 'Riau • Kubah Gambut Siak',
      coords: '0.5°N 101.8°E',
      cx: 480,
      cy: 258,
      color: '#ef4444',
      depth: '4.2 m',
      gwl: '-38 cm',
      status: 'CRITICAL (FWI 28.4)',
      statusId: 'KRITIS (FWI 28.4)',
      sensor: 'MODIS Band 21/22',
    },
    {
      id: 'kalteng',
      name: 'Central Kalimantan • Ex-PLG Block A',
      nameId: 'Kalimantan Tengah • Eks-PLG Blok A',
      coords: '-2.2°S 113.8°E',
      cx: 740,
      cy: 250,
      color: '#f97316',
      depth: '5.8 m',
      gwl: '-45 cm',
      status: 'VERY HIGH (FWI 32.1)',
      statusId: 'SANGAT TINGGI (FWI 32.1)',
      sensor: 'MODIS TIR 3.9µm',
    },
    {
      id: 'sumsel',
      name: 'South Sumatra • OKI Concession Arc',
      nameId: 'Sumatera Selatan • Konsesi OKI',
      coords: '-3.1°S 105.4°E',
      cx: 980,
      cy: 260,
      color: '#eab308',
      depth: '3.5 m',
      gwl: '-29 cm',
      status: 'MODERATE RISK (FWI 18.6)',
      statusId: 'RISIKO SEDANG (FWI 18.6)',
      sensor: 'VIIRS I4 375m',
    },
    {
      id: 'papua',
      name: 'Papua • Merauke Savanna Basin',
      nameId: 'Papua • Kubah Savana Merauke',
      coords: '-7.8°S 139.6°E',
      cx: 1220,
      cy: 275,
      color: '#10b981',
      depth: '2.1 m',
      gwl: '-14 cm',
      status: 'NOMINAL MONITORING',
      statusId: 'PEMANTAUAN NOMINAL',
      sensor: 'MODIS + VIIRS Cross-Sync',
    },
  ];

  const [activeTarget, setActiveTarget] = useState<GroundTarget>(groundTargets[1]);

  return (
    <footer className="print:hidden relative w-full bg-[#fbfbfd] dark:bg-[#060911] border-t border-[#e5e5e7] dark:border-[#1f2937] text-[#1d1d1f] dark:text-[#f3f4f6] transition-colors overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        
        {/* 1. Four-Column Clean Editorial Navigation Matrix (Top Section) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          
          {/* Col 1: Official Brand Logo & Vision */}
          <div className="space-y-3.5">
            <div>
              <Logo size="md" showNasaBadge={true} />
            </div>

            <p className="text-[#6e6e73] dark:text-[#9ca3af] leading-relaxed">
              {language === 'id'
                ? 'Harmonisasi rekam jejak titik panas satelit MODIS & VIIRS 2000–2026 untuk perlindungan kubah gambut Indonesia dan verifikasi target FOLU Net Sink 2030.'
                : 'Harmonization of MODIS & VIIRS 2000–2026 satellite fire records for Indonesian peatland preservation and FOLU Net Sink 2030 targets.'}
            </p>

            <div className="pt-1 flex items-center gap-2 text-[#515154] dark:text-[#d1d5db]">
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">{language === 'id' ? 'Lisensi Sumber Terbuka MIT' : 'Open Source MIT License'}</span>
            </div>
          </div>

          {/* Col 2: App Modules Navigation */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#1d1d1f] dark:text-white uppercase tracking-wider block border-b border-[#e5e5e7] dark:border-[#1f2937] pb-2">
              {language === 'id' ? 'Navigasi Modul' : 'System Modules'}
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectTab('overview')}
                  className="text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white transition flex items-center gap-2 min-h-[36px] py-1 cursor-pointer font-medium"
                >
                  <Compass className="w-3.5 h-3.5 text-[#1d1d1f] dark:text-white" />
                  <span>{t.navOverview}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('lab')}
                  className="text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white transition flex items-center gap-2 min-h-[36px] py-1 cursor-pointer font-medium"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#1d1d1f] dark:text-white" />
                  <span>{t.navLab}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('mitigation')}
                  className="text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white transition flex items-center gap-2 min-h-[36px] py-1 cursor-pointer font-medium"
                >
                  <Flame className="w-3.5 h-3.5 text-[#1d1d1f] dark:text-white" />
                  <span>{t.navMitigation}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('data-hub')}
                  className="text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white transition flex items-center gap-2 min-h-[36px] py-1 cursor-pointer font-medium"
                >
                  <Database className="w-3.5 h-3.5 text-[#1d1d1f] dark:text-white" />
                  <span>{t.navData}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('team')}
                  className="text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white transition flex items-center gap-2 min-h-[36px] py-1 cursor-pointer font-medium"
                >
                  <Award className="w-3.5 h-3.5 text-[#1d1d1f] dark:text-white" />
                  <span>{t.navTeam}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Sensor Platforms & Satellites */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#1d1d1f] dark:text-white uppercase tracking-wider block border-b border-[#e5e5e7] dark:border-[#1f2937] pb-2">
              {language === 'id' ? 'Konstelasi Satelit' : 'Satellite Constellations'}
            </span>
            <ul className="space-y-2 text-[#6e6e73] dark:text-[#9ca3af]">
              <li className="flex items-center justify-between">
                <span>NASA Terra (EOS AM-1)</span>
                <span className="text-[#1d1d1f] dark:text-white font-mono text-[11px] font-semibold">MODIS 1km</span>
              </li>
              <li className="flex items-center justify-between">
                <span>NASA Aqua (EOS PM-1)</span>
                <span className="text-[#1d1d1f] dark:text-white font-mono text-[11px] font-semibold">MODIS 1km</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Suomi-NPP (NASA/NOAA)</span>
                <span className="text-[#1d1d1f] dark:text-white font-mono text-[11px] font-semibold">VIIRS 375m</span>
              </li>
              <li className="flex items-center justify-between">
                <span>NOAA-20 / JPSS-1</span>
                <span className="text-[#1d1d1f] dark:text-white font-mono text-[11px] font-semibold">VIIRS 375m</span>
              </li>
              <li className="flex items-center justify-between">
                <span>NOAA-21 / JPSS-2</span>
                <span className="text-[#1d1d1f] dark:text-white font-mono text-[11px] font-semibold">VIIRS 375m</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Open Science & Repository */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#1d1d1f] dark:text-white uppercase tracking-wider block border-b border-[#e5e5e7] dark:border-[#1f2937] pb-2">
              {language === 'id' ? 'Pusat Riset Terbuka' : 'Open Science Hub'}
            </span>
            <p className="text-[#6e6e73] dark:text-[#9ca3af] leading-relaxed">
              {language === 'id'
                ? 'Data observasi bumi terbuka disediakan oleh NASA FIRMS dan Earthdata. Semua algoritma terintegrasi dalam pipeline geospasial terbuka.'
                : 'Open Earth observation data courtesy of NASA FIRMS and Earthdata. Algorithms integrated into an open-source pipeline.'}
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/Rangga11268/Wanareksa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1d1d1f] hover:bg-black dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-bold transition shadow-xs min-h-[44px] cursor-pointer"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/80" />
              </a>
            </div>
          </div>

        </div>

        {/* 2. DEDICATED CINEMATIC ORBITAL FLIGHT DECK (Fluid Aerospace Telemetry) */}
        <div className="relative w-full rounded-3xl border border-[#e5e5e7] dark:border-[#1f2937] bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-[#080d1a] dark:via-[#0c1222] dark:to-[#050811] shadow-xs overflow-hidden">
          
          {/* Header Bar inside Orbital Stage */}
          <div className="relative z-10 px-5 sm:px-8 pt-5 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5e7]/60 dark:border-[#1f2937]/60 backdrop-blur-md">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 dark:bg-[#151d2f]/90 backdrop-blur-md border border-[#e5e5e7] dark:border-[#1f2937] text-xs font-bold text-[#1d1d1f] dark:text-white shadow-2xs">
                <Orbit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" style={{ animationDuration: '24s' }} />
                <span>NASA Earth Observing System (EOS) &bull; Planetary Flight Deck</span>
              </span>

              {/* Satellite Spacecraft Mode Selector */}
              <div className="inline-flex rounded-xl bg-[#e5e5ea] dark:bg-[#1f2937] p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSelectedSat('terra')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedSat === 'terra'
                      ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                      : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  NASA Terra (MODIS 1km)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSat('viirs')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedSat === 'viirs'
                      ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-bold'
                      : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  Suomi-NPP (VIIRS 375m)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-[#6e6e73] dark:text-[#9ca3af]">
              <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                ACTIVE SCANNING
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#38bdf8]" />
                <strong className="text-[#1d1d1f] dark:text-white num">{utcTime} UTC</strong>
              </span>
            </div>
          </div>

          {/* Panoramic Orbital Sky Window */}
          <div className="relative w-full h-[260px] sm:h-[300px] overflow-hidden select-none bg-[#050b18]">
            <svg
              viewBox="0 0 1440 320"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Solar Array Sapphire Blue Gradient */}
                <linearGradient id="orbitSolarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="30%" stopColor="#2563eb" />
                  <stop offset="70%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                {/* NASA Multi-Layer Insulation (MLI) Gold Foil Gradient */}
                <linearGradient id="orbitGoldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="25%" stopColor="#f59e0b" />
                  <stop offset="65%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>

                {/* Silver / White Thermal Radiator Shield Gradient */}
                <linearGradient id="orbitSilverFoil" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>

                {/* Dynamic Multispectral Sensor Swath Beam */}
                <linearGradient id="swathBeamGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor={selectedSat === 'terra' ? '#10b981' : '#06b6d4'} stopOpacity="0.75" />
                  <stop offset="40%" stopColor={selectedSat === 'terra' ? '#059669' : '#0284c7'} stopOpacity="0.35" />
                  <stop offset="85%" stopColor={selectedSat === 'terra' ? '#10b981' : '#38bdf8'} stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>

                {/* Orbit Trajectory Arc Gradient */}
                <linearGradient id="orbitPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
                  <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.7" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="90%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                </linearGradient>

                {/* Atmosphere Limb Horizon Glow */}
                <radialGradient id="earthAtmosphereLimb" cx="50%" cy="115%" r="75%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                  <stop offset="35%" stopColor="#0ea5e9" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </radialGradient>

                {/* Curved Orbital Ground Track */}
                <path
                  id="stageFlightTrack"
                  d="M -120 75 C 340 -20, 960 145, 1560 55"
                />
              </defs>

              {/* Deep Space Background Glow */}
              <rect x="0" y="0" width="1440" height="320" fill="#040814" />

              {/* Earth Curvature Horizon Limb at bottom of sky */}
              <ellipse cx="720" cy="390" rx="980" ry="150" fill="url(#earthAtmosphereLimb)" />
              <path
                d="M -100 310 Q 720 225 1540 310"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeOpacity="0.6"
              />

              {/* Celestial Coordinate Grid Lines */}
              <g opacity="0.18" stroke="#64748b" strokeWidth="0.5" strokeDasharray="4 6">
                <line x1="0" y1="80" x2="1440" y2="80" />
                <line x1="0" y1="160" x2="1440" y2="160" />
                <line x1="280" y1="0" x2="280" y2="320" />
                <line x1="560" y1="0" x2="560" y2="320" />
                <line x1="840" y1="0" x2="840" y2="320" />
                <line x1="1120" y1="0" x2="1120" y2="320" />
              </g>

              {/* Celestial Starfield */}
              <g fill="#e2e8f0" opacity="0.75">
                <circle cx="120" cy="35" r="1.2" />
                <circle cx="280" cy="95" r="0.9" />
                <circle cx="450" cy="25" r="1.3" />
                <circle cx="620" cy="70" r="0.8" />
                <circle cx="790" cy="30" r="1.4" />
                <circle cx="950" cy="85" r="1" />
                <circle cx="1120" cy="40" r="0.9" />
                <circle cx="1310" cy="80" r="1.2" />
                <circle cx="360" cy="130" r="0.7" />
                <circle cx="890" cy="140" r="0.8" />
              </g>

              {/* Glowing Curved Orbit Ground Track */}
              <use
                href="#stageFlightTrack"
                fill="none"
                stroke="url(#orbitPathGrad)"
                strokeWidth="2.5"
                strokeDasharray="8 6"
              />

              {/* INTERACTIVE PEATLAND GROUND TARGET STATIONS ON EARTH LIMB */}
              {groundTargets.map((target) => {
                const isSelected = activeTarget.id === target.id;
                return (
                  <g
                    key={target.id}
                    className="cursor-pointer transition-all"
                    onClick={() => setActiveTarget(target)}
                  >
                    {/* Radar Pulse Beacon */}
                    <circle
                      cx={target.cx}
                      cy={target.cy}
                      r={isSelected ? 14 : 8}
                      fill={target.color}
                      fillOpacity={isSelected ? 0.3 : 0.15}
                    >
                      <animate
                        attributeName="r"
                        values={isSelected ? '8;18;8' : '5;11;5'}
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.9;0.2;0.9"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Central Target Landmark */}
                    <circle
                      cx={target.cx}
                      cy={target.cy}
                      r={isSelected ? 4.5 : 3}
                      fill={target.color}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2 : 1}
                    />

                    {/* Coordinate Tag */}
                    <text
                      x={target.cx}
                      y={target.cy + 18}
                      textAnchor="middle"
                      fill={isSelected ? '#38bdf8' : '#94a3b8'}
                      fontSize={isSelected ? '9.5' : '8.5'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="monospace"
                    >
                      {target.coords}
                    </text>
                  </g>
                );
              })}

              {/* REALISTIC HIGH-PRECISION SPACECRAFT ASSEMBLY IN ORBIT */}
              <g>
                <animateMotion
                  dur="22s"
                  repeatCount="indefinite"
                  rotate="auto"
                  calcMode="linear"
                >
                  <mpath href="#stageFlightTrack" />
                </animateMotion>

                {/* Dynamic Oscillating Swath Scan Radar Beam */}
                <polygon
                  points="0,10 -110,215 110,215"
                  fill="url(#swathBeamGrad)"
                >
                  <animate
                    attributeName="points"
                    values="0,10 -100,215 100,215; 0,10 -120,215 90,215; 0,10 -90,215 120,215; 0,10 -100,215 100,215"
                    dur="3.6s"
                    repeatCount="indefinite"
                  />
                </polygon>

                {/* Ground Swath Footprint Ellipse */}
                <ellipse
                  cx="0"
                  cy="215"
                  rx="105"
                  ry="14"
                  fill="#10b981"
                  fillOpacity="0.25"
                  stroke="#34d399"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                >
                  <animate
                    attributeName="rx"
                    values="95;115;95"
                    dur="3.6s"
                    repeatCount="indefinite"
                  />
                </ellipse>

                {/* Dynamic Cross-Track Laser Scanline */}
                <line x1="-80" y1="215" x2="80" y2="215" stroke="#ffffff" strokeWidth="1.5" opacity="0.85">
                  <animate
                    attributeName="x1"
                    values="-80;80;-80"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="x2"
                    values="-40;110;-40"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </line>

                {/* DETAILED AEROSPACE SPACECRAFT BODY */}
                <g transform="scale(1.05)">
                  
                  {/* MLI Gold Thermal Insulation Main Bus */}
                  <rect
                    x="-20"
                    y="-15"
                    width="40"
                    height="30"
                    rx="3"
                    fill={selectedSat === 'terra' ? 'url(#orbitGoldFoil)' : 'url(#orbitSilverFoil)'}
                    stroke="#92400e"
                    strokeWidth="1.2"
                    filter="drop-shadow(0 6px 12px rgba(0,0,0,0.6))"
                  />

                  {/* MLI Multi-Layer Thermal Quilting Texture */}
                  <line x1="-20" y1="-5" x2="20" y2="-5" stroke="#78350f" strokeWidth="0.6" opacity="0.7" />
                  <line x1="-20" y1="5" x2="20" y2="5" stroke="#78350f" strokeWidth="0.6" opacity="0.7" />
                  <line x1="-7" y1="-15" x2="-7" y2="15" stroke="#78350f" strokeWidth="0.6" opacity="0.7" />
                  <line x1="7" y1="-15" x2="7" y2="15" stroke="#78350f" strokeWidth="0.6" opacity="0.7" />

                  {/* Nadir Instrument Optical Deck (Pointing Downward to Earth) */}
                  <rect
                    x="-12"
                    y="13"
                    width="24"
                    height="10"
                    rx="2"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1"
                  />

                  {/* Primary Thermal IR Sensor Aperture (Pulsing Active Lenses) */}
                  <circle cx="-5" cy="18" r="3" fill="#10b981" stroke="#047857" strokeWidth="0.8">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="5" cy="18" r="2.2" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.6">
                    <animate attributeName="opacity" values="1;0.6;1" dur="1.2s" repeatCount="indefinite" />
                  </circle>

                  {/* High-Gain Tracking Parabolic Antenna (TDRSS Space Network) */}
                  <line x1="0" y1="-15" x2="0" y2="-28" stroke="#475569" strokeWidth="2" />
                  <path
                    d="M -11 -28 Q 0 -35 11 -28 Z"
                    fill="#f8fafc"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  {/* Antenna Downlink Feedhorn */}
                  <circle cx="0" cy="-31" r="1.8" fill="#22c55e">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="0.9s" repeatCount="indefinite" />
                  </circle>

                  {/* Solar Array Wing Booms */}
                  <line x1="-20" y1="0" x2="-28" y2="0" stroke="#1e293b" strokeWidth="3.5" />
                  <line x1="20" y1="0" x2="28" y2="0" stroke="#1e293b" strokeWidth="3.5" />

                  {/* PORT / LEFT SOLAR ARRAY WING (Photovoltaic Blue Cells) */}
                  <g transform="translate(-28, 0)">
                    <rect
                      x="-42"
                      y="-18"
                      width="42"
                      height="36"
                      rx="2"
                      fill="url(#orbitSolarGrad)"
                      stroke="#1e40af"
                      strokeWidth="1.2"
                    />
                    {/* Photovoltaic Grid Network */}
                    <line x1="-31" y1="-18" x2="-31" y2="18" stroke="#93c5fd" strokeWidth="0.5" opacity="0.85" />
                    <line x1="-21" y1="-18" x2="-21" y2="18" stroke="#93c5fd" strokeWidth="0.5" opacity="0.85" />
                    <line x1="-10" y1="-18" x2="-10" y2="18" stroke="#93c5fd" strokeWidth="0.5" opacity="0.85" />
                    <line x1="-42" y1="-9" x2="0" y2="-9" stroke="#93c5fd" strokeWidth="0.5" opacity="0.85" />
                    <line x1="-42" y1="0" x2="0" y2="0" stroke="#dbeafe" strokeWidth="0.8" opacity="0.95" />
                    <line x1="-42" y1="9" x2="0" y2="9" stroke="#93c5fd" strokeWidth="0.5" opacity="0.85" />
                  </g>

                  {/* STARBOARD / RIGHT SOLAR ARRAY WING */}
                  <g transform="translate(28, 0)">
                    <rect
                      x="0"
                      y="-18"
                      width="42"
                      height="36"
                      rx="2"
                      fill="url(#orbitSolarGrad)"
                      stroke="#1e40af"
                      strokeWidth="1.2"
                    />
                    {/* Photovoltaic Grid Network */}
                    <line x1="10" y1="-18" x2="10" y2="18" stroke="#93c5fd" strokeWidth="0.5" opacity="0.85" />
                    <line x1="21" y1="-18" x2="21" y2="18" stroke="#93c5fd" strokeWidth="0.5" opacity="0.85" />
                    <line x1="31" y1="-18" x2="31" y2="18" stroke="#93c5fd" strokeWidth="0.5" opacity="0.85" />
                    <line x1="0" y1="-9" x2="42" y2="-9" stroke="#93c5fd" strokeWidth="0.5" opacity="0.85" />
                    <line x1="0" y1="0" x2="42" y2="0" stroke="#dbeafe" strokeWidth="0.8" opacity="0.95" />
                    <line x1="0" y1="9" x2="42" y2="9" stroke="#93c5fd" strokeWidth="0.5" opacity="0.85" />
                  </g>

                  {/* Attitude Control Micro-Thrusters */}
                  <circle cx="-18" cy="-13" r="1.4" fill="#64748b" />
                  <circle cx="18" cy="-13" r="1.4" fill="#64748b" />
                  <circle cx="-18" cy="13" r="1.4" fill="#64748b" />
                  <circle cx="18" cy="13" r="1.4" fill="#64748b" />

                  {/* Mission Status Telemetry LED */}
                  <circle cx="0" cy="0" r="2.2" fill="#22c55e">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
                  </circle>
                </g>

              </g>
            </svg>
          </div>

          {/* Active Target Peatland Station Telemetry Bar */}
          <div className="relative z-10 px-5 sm:px-8 py-3 bg-white/80 dark:bg-[#0f172a]/80 border-t border-[#e5e5e7] dark:border-[#1f2937] backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-[#1d1d1f] dark:text-white">
                  {language === 'id' ? activeTarget.nameId : activeTarget.name}
                </span>
                <span className="text-[#6e6e73] dark:text-[#9ca3af] ml-2 font-mono text-[11px]">
                  ({activeTarget.coords})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-mono text-[11px]">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[#6e6e73] dark:text-[#9ca3af]">{language === 'id' ? 'Kedalaman Gambut:' : 'Peat Depth:'}</span>
                <strong className="text-[#1d1d1f] dark:text-white">{activeTarget.depth}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[#6e6e73] dark:text-[#9ca3af]">{language === 'id' ? 'Tinggi Air Tanah:' : 'Water Table:'}</span>
                <strong className="text-[#1d1d1f] dark:text-white">{activeTarget.gwl}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span className="text-[#6e6e73] dark:text-[#9ca3af]">{language === 'id' ? 'Status Pantauan:' : 'Status:'}</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold border border-rose-500/20">
                  {language === 'id' ? activeTarget.statusId : activeTarget.status}
                </span>
              </div>
            </div>
          </div>

          {/* Integrated Mission Telemetry Deck */}
          <div className="relative z-10 p-5 sm:p-7 border-t border-[#e5e5e7] dark:border-[#1f2937] bg-white/95 dark:bg-[#0c1324]/95 backdrop-blur-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Mission Summary */}
              <div className="lg:col-span-5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#1d1d1f] dark:text-white tracking-tight">
                    {selectedSat === 'terra' ? 'NASA Terra (EOS AM-1) Spacecraft' : 'Suomi-NPP (NASA / NOAA) Satellite'}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#6e6e73] dark:text-[#9ca3af]">
                    {selectedSat === 'terra' ? 'NORAD 25994' : 'NORAD 37849'}
                  </span>
                </div>
                <p className="text-xs text-[#515154] dark:text-[#9ca3af] leading-relaxed">
                  {selectedSat === 'terra'
                    ? (language === 'id'
                      ? 'Satelit unggulan NASA diluncurkan pada 18 Desember 1999 pada orbit Sun-Synchronous 705 km. Sensor MODIS menjadi tulang punggung pengamatan deret waktu 26 tahun Wanareksa.'
                      : 'NASA flagship Earth observation satellite launched on Dec 18, 1999 into a 705 km Sun-Synchronous orbit. Its MODIS sensor anchors Wanareksa 26-year baseline.')
                    : (language === 'id'
                      ? 'Diluncurkan pada 28 Oktober 2011 oleh NASA/NOAA pada orbit 824 km. Sensor VIIRS membawa pita resolusi tinggi 375m yang diselaraskan oleh algoritma Wanareksa.'
                      : 'Launched on Oct 28, 2011 by NASA/NOAA into an 824 km orbit. Its VIIRS sensor delivers 375m high-resolution bands harmonized by Wanareksa.')}
                </p>
              </div>

              {/* 4 Telemetry KPIs */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#fbfbfd] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937]">
                  <span className="text-[10px] text-[#86868b] dark:text-[#9ca3af] uppercase font-bold tracking-wider block">
                    {language === 'id' ? 'Ketinggian Orbit' : 'Orbit Altitude'}
                  </span>
                  <strong className="text-base font-bold text-[#1d1d1f] dark:text-white block mt-0.5 num">
                    {selectedSat === 'terra' ? '705 km' : '824 km'}
                  </strong>
                  <span className="text-[10px] text-[#6e6e73] dark:text-[#9ca3af]">Sun-Synchronous</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#fbfbfd] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937]">
                  <span className="text-[10px] text-[#86868b] dark:text-[#9ca3af] uppercase font-bold tracking-wider block">
                    {language === 'id' ? 'Kecepatan Orbit' : 'Velocity'}
                  </span>
                  <strong className="text-base font-bold text-[#1d1d1f] dark:text-white block mt-0.5 num">
                    {selectedSat === 'terra' ? '7.5 km/s' : '7.1 km/s'}
                  </strong>
                  <span className="text-[10px] text-[#6e6e73] dark:text-[#9ca3af]">
                    {selectedSat === 'terra' ? '27,000 km/h' : '25,560 km/h'}
                  </span>
                </div>
              </div>

              {/* Sensor Payload Badges */}
              <div className="lg:col-span-3 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#86868b] dark:text-[#9ca3af] tracking-wider block">
                  {language === 'id' ? 'Payload Sensor Sains' : 'Science Payload Suite'}
                </span>
                <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
                  {selectedSat === 'terra' ? (
                    <>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                        MODIS (1 km)
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#6e6e73] dark:text-[#9ca3af]">
                        ASTER (15 m)
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#6e6e73] dark:text-[#9ca3af]">
                        CERES
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#6e6e73] dark:text-[#9ca3af]">
                        MISR
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        VIIRS (375 m)
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#6e6e73] dark:text-[#9ca3af]">
                        CrIS
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#6e6e73] dark:text-[#9ca3af]">
                        ATMS
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#f5f5f7] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] text-[#6e6e73] dark:text-[#9ca3af]">
                        OMPS
                      </span>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 3. Bottom Minimal Legal Bar */}
        <div className="pt-6 border-t border-[#e5e5e7] dark:border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868b] dark:text-[#9ca3af]">
          <div className="flex items-center gap-3">
            <Logo size="sm" showSubtitle={false} showNasaBadge={true} />
            <span>&copy; 2026 Wanareksa &bull; NASA Space Apps Jakarta 2026 &bull; NASA FIRMS &amp; Earthdata</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              NASA Space Network: Nominal
            </span>
            <span>Jakarta, Indonesia 2026</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
