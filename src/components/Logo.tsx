import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
  showNasaBadge?: boolean;
}

/**
 * The Wanareksa Sentinel Mark
 * High-precision mathematical vector representing:
 * 1. Tri-layered Peat Stratigraphy (Surface, -40cm Critical Water Table, Deep Carbon Substrate)
 * 2. Supersonic Nadir Optical Sensor Ray slicing down from Polar Orbit
 * 3. Radiant Infrared Fire Radiative Power (FRP) Thermal Core
 * 4. Geometric 'W' Aerospace Vector Wings
 */
export const WanareksaEmblem: React.FC<{ className?: string; darkTheme?: boolean }> = ({
  className = 'w-full h-full',
}) => (
  <svg
    viewBox="0 0 256 256"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Wanareksa Sentinel Mark"
  >
    <title>Wanareksa Sentinel Mark</title>

    {/* Precision Telemetry Disc Base */}
    <circle cx="128" cy="128" r="118" className="fill-slate-900/90 dark:fill-[#090D16]" stroke="currentColor" strokeWidth="2" strokeOpacity="0.15" />
    <circle cx="128" cy="128" r="108" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" strokeOpacity="0.25" />

    {/* Cardinal Instrument Reticles */}
    <line x1="128" y1="4" x2="128" y2="16" stroke="#FF453A" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="128" y1="240" x2="128" y2="252" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="4" y1="128" x2="16" y2="128" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
    <line x1="240" y1="128" x2="252" y2="128" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />

    {/* Stratigraphic Peat Depth Horizons */}
    {/* Strata 01: Ground Surface Layer (0 cm) */}
    <line x1="44" y1="116" x2="212" y2="116" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.35" strokeLinecap="round" />
    {/* Strata 02: Critical Hydrological Threshold (-40 cm Water Table) */}
    <line x1="62" y1="148" x2="194" y2="148" stroke="#00E5FF" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
    {/* Strata 03: Deep Carbon Storage Substrate (-100 cm) */}
    <line x1="84" y1="180" x2="172" y2="180" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />

    {/* Dynamic 'W' Aerospace Sentinel Chevron Wings */}
    {/* Left Sensor Array Wing */}
    <polyline
      points="56,76 96,164 128,104"
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-100 dark:text-white"
    />

    {/* Right Supersonic Optical Vector Wing */}
    <polyline
      points="200,76 160,164 128,104"
      fill="none"
      stroke="#FF453A"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Nadir Sensing Beam (Orbital Zenith to Ground Nexus) */}
    <line
      x1="128"
      y1="34"
      x2="128"
      y2="148"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="4 3"
      strokeOpacity="0.5"
    />

    {/* Thermal Hotspot Infrared Focal Node (FRP Thermal Anomaly) */}
    <circle cx="128" cy="148" r="10" fill="#FF453A" fillOpacity="0.25" />
    <circle cx="128" cy="148" r="6.5" fill="#FF453A" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="128" cy="148" r="2.5" fill="#FFFFFF" />

    {/* Satellite Nadir Sensor Vertex (Orbital Apex) */}
    <polygon points="128,32 134,42 128,52 122,42" fill="#00E5FF" />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showSubtitle = true,
  showNasaBadge = true,
}) => {
  const sizeMap = {
    sm: {
      emblem: 'w-7 h-7 min-w-[28px] max-w-[28px]',
      nasa: 'w-5.5 h-5.5 min-w-[22px] max-w-[22px]',
      title: 'text-xs sm:text-sm font-semibold tracking-wider font-mono',
      sub: 'text-[8.5px]',
    },
    md: {
      emblem: 'w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] max-w-[36px]',
      nasa: 'w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 min-w-[26px] max-w-[30px]',
      title: 'text-sm sm:text-base font-semibold tracking-wider font-mono',
      sub: 'text-[9.5px]',
    },
    lg: {
      emblem: 'w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] max-w-[44px]',
      nasa: 'w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] max-w-[36px]',
      title: 'text-base sm:text-lg font-bold tracking-wider font-mono',
      sub: 'text-[11px]',
    },
  };

  const { emblem, nasa, title, sub } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none shrink-0 max-w-full overflow-hidden ${className}`}>
      {/* Dual Logo Lockup: Wanareksa Sentinel Mark × NASA Insignia */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Wanareksa Sentinel Mark */}
        <div className={`flex items-center justify-center shrink-0 ${emblem} text-slate-900 dark:text-white transition-transform duration-150 hover:scale-105 active:scale-95`}>
          <WanareksaEmblem className="w-full h-full object-contain" />
        </div>

        {showNasaBadge && (
          <>
            {/* Architectural Telemetry Hairline Divider */}
            <span className="w-px h-5 sm:h-6 bg-slate-300/80 dark:bg-white/15 select-none shrink-0" />

            {/* Official NASA Insignia */}
            <div className={`flex items-center justify-center shrink-0 ${nasa} rounded-full overflow-hidden opacity-90 hover:opacity-100 transition-opacity`}>
              <img
                src="/nasa_meatball.svg"
                alt="NASA Insignia"
                className="w-full h-full max-w-full max-h-full object-contain shrink-0"
                loading="eager"
              />
            </div>
          </>
        )}
      </div>

      {/* Brand Typography (Scientific Editorial Grotesque) */}
      <div className="flex flex-col justify-center min-w-0 leading-tight shrink truncate">
        <div className={`text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 truncate ${title}`}>
          <span className="truncate">WANAREKSA</span>
        </div>
        {showSubtitle && (
          <span className={`text-slate-500 dark:text-zinc-400 font-mono tracking-widest uppercase truncate ${sub}`}>
            EARTH OBS // NASA SPACE APPS
          </span>
        )}
      </div>
    </div>
  );
};
export default Logo;
