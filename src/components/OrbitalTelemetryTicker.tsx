import React, { useState, useEffect } from 'react';
import { Satellite, Radio, Clock, Cpu, ShieldCheck, Flame, Zap } from 'lucide-react';
import { Language } from '../data/translations';

interface OrbitalTelemetryTickerProps {
  language: Language;
  isLiveSync?: boolean;
}

export const OrbitalTelemetryTicker: React.FC<OrbitalTelemetryTickerProps> = ({
  language,
  isLiveSync = false,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const TELEMETRY_FEED = [
    {
      id: 'terra',
      icon: Satellite,
      name: 'TERRA (EOS AM-1)',
      sensor: 'MODIS 1km',
      spec: 'Orbit 705 km · 10:30 LT',
      status: language === 'id' ? 'AKTIF' : 'ACTIVE',
    },
    {
      id: 'aqua',
      icon: Satellite,
      name: 'AQUA (EOS PM-1)',
      sensor: 'MODIS 1km',
      spec: 'Orbit 705 km · 13:30 LT',
      status: language === 'id' ? 'AKTIF' : 'ACTIVE',
    },
    {
      id: 'snpp',
      icon: Satellite,
      name: 'SUOMI-NPP',
      sensor: 'VIIRS 375m',
      spec: 'Orbit 824 km · 13:30 LT',
      status: language === 'id' ? 'TERKALIBRASI' : 'CALIBRATED',
    },
    {
      id: 'noaa20',
      icon: Satellite,
      name: 'NOAA-20 (JPSS-1)',
      sensor: 'VIIRS 375m',
      spec: 'I-Bands 3.9 μm · 01:30 LT',
      status: language === 'id' ? 'TERFUSI' : 'IN SYNC',
    },
    {
      id: 'firms',
      icon: Radio,
      name: 'NASA FIRMS FEED',
      sensor: 'NRT Data Stream',
      spec: language === 'id' ? 'Latensi ~3,2 Jam' : 'Latency ~3.2 hrs',
      status: language === 'id' ? 'TERVERIFIKASI' : 'VERIFIED',
    },
    {
      id: 'fusion',
      icon: Cpu,
      name: language === 'id' ? 'FUSI SPASIAL WANAREKSA' : 'WANAREKSA SPATIAL FUSION',
      sensor: language === 'id' ? 'Grid Luas-Sama' : 'Equal-Area Grid',
      spec: language === 'id' ? 'Resolusi 5,5 km' : '5.5 km Resolution',
      status: language === 'id' ? 'BIAS TERATASI' : 'BIAS FIXED',
    },
    {
      id: 'peatland',
      icon: Flame,
      name: language === 'id' ? 'AMBANG TMAG BRGM' : 'BRGM PEAT WATER TABLE',
      sensor: 'PP 71/2014 & PP 57/2016',
      spec: language === 'id' ? 'Batas Muka Air -40 cm' : '-40 cm Water Table Limit',
      status: language === 'id' ? 'PEMANTAUAN' : 'MONITORING',
    },
  ];

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'BIAS FIXED':
      case 'BIAS TERATASI':
      case 'IN SYNC':
      case 'TERFUSI':
        return 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/70';
      case 'AKTIF':
      case 'ACTIVE':
      case 'VERIFIED':
      case 'TERVERIFIKASI':
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70';
      case 'CALIBRATED':
      case 'TERKALIBRASI':
        return 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70';
      case 'MONITORING':
      case 'PEMANTAUAN':
      default:
        return 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/70';
    }
  };

  return (
    <div className="w-full bg-slate-100/90 dark:bg-[#070b14] border-b border-slate-200 dark:border-slate-800/90 text-slate-700 dark:text-slate-300 select-none overflow-hidden flex items-center h-10 transition-colors duration-200">
      
      {/* Pinned Left Mission Indicator */}
      <div className="h-full px-3 sm:px-4 bg-white/95 dark:bg-[#050811]/95 border-r border-slate-200 dark:border-slate-800/90 flex items-center gap-2.5 shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-1.5">
          <Satellite className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-900 dark:text-slate-100 font-sans uppercase hidden sm:inline">
            {isLiveSync
              ? 'NASA FIRMS LIVE'
              : (language === 'id' ? 'TELEMETRI MISI' : 'MISSION TELEMETRY')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-2.5">
          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="text-slate-700 dark:text-slate-200 font-semibold">{utcTime || '00:00:00 UTC'}</span>
        </div>
      </div>

      {/* Infinite Scrolling Marquee Track with Adaptive Edge Fade */}
      <div
        className="relative flex-1 min-w-0 overflow-hidden h-full flex items-center"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
        }}
      >
        <div className="animate-marquee flex items-center whitespace-nowrap pl-4 cursor-default">
          {TELEMETRY_FEED.concat(TELEMETRY_FEED).map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-[11px] font-mono shrink-0 mr-8">
                <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">{item.name}</span>
                <span className="text-slate-300 dark:text-slate-700 font-light">//</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{item.sensor}</span>
                <span className="text-slate-400 dark:text-slate-500 hidden md:inline text-[10px]">({item.spec})</span>
                <span className="text-slate-300 dark:text-slate-700 font-light">//</span>
                <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border tracking-wider uppercase font-mono ${getStatusBadgeStyle(item.status)}`}>
                  {item.status}
                </span>
                <span className="text-slate-300 dark:text-slate-800 ml-4 select-none">&bull;</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
