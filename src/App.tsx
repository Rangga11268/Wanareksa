import React, { useState, useMemo, useEffect, useCallback, Suspense, lazy } from 'react';
import { Navbar, NavTab, ThemeMode, AppMode } from './components/Navbar';
import { CitizenPortal } from './components/CitizenPortal';
import { DashboardControlBar, OverviewViewMode } from './components/DashboardControlBar';
import { BurningCalendar } from './components/BurningCalendar';
import { MapViewer } from './components/MapViewer';
import { ComparisonMetrics } from './components/ComparisonMetrics';
import { VisualAnalytics } from './components/VisualAnalytics';
import { CriticalAlerts } from './components/CriticalAlerts';
import { RiskForecast } from './components/RiskForecast';
import { JudgesEvaluationGuide } from './components/JudgesEvaluationGuide';
import { Footer } from './components/Footer';
import { NasaApiKeyModal } from './components/NasaApiKeyModal';
import { CinematicIntroTour } from './components/CinematicIntroTour';
import { ExecutiveBriefingModal } from './components/ExecutiveBriefingModal';
import { EarlyWarningAlertModal } from './components/EarlyWarningAlertModal';
import { PRESET_AOIS, AOIRegion, RawHotspot, HarmonizedWeekData, harmonizeHotspots } from './engine/harmonizer';
import { generateHistoricalFireData } from './data/generator';
import { fetchLiveNASAHotspots, LiveSyncResult } from './services/nasaFirmsApi';
import { Language, translations } from './data/translations';
import { RefreshCw, Loader2, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { OrbitalTelemetryTicker } from './components/OrbitalTelemetryTicker';

// Helper to retry dynamic imports if browser cache misses or server reconnected
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
  interval = 800
): React.LazyExoticComponent<T> {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (remaining: number) => {
        factory()
          .then(resolve)
          .catch((error) => {
            if (remaining > 0) {
              setTimeout(() => attempt(remaining - 1), interval);
            } else {
              // Attempt a clean page refresh once if chunk signature mismatch happens
              const key = 'wanareksa_chunk_retry_ts';
              const lastRetry = sessionStorage.getItem(key);
              const now = Date.now();
              if (!lastRetry || now - parseInt(lastRetry, 10) > 10000) {
                sessionStorage.setItem(key, now.toString());
                window.location.reload();
                return;
              }
              reject(error);
            }
          });
      };
      attempt(retries);
    })
  );
}

// Lazy-loaded heavy modules with automatic retry
const LandingStory = lazyWithRetry(() => import('./components/LandingStory').then(m => ({ default: m.LandingStory })));
const HarmonizationLab = lazyWithRetry(() => import('./components/HarmonizationLab').then(m => ({ default: m.HarmonizationLab })));
const MitigationHub = lazyWithRetry(() => import('./components/MitigationHub').then(m => ({ default: m.MitigationHub })));
const DataHub = lazyWithRetry(() => import('./components/DataHub').then(m => ({ default: m.DataHub })));
const TeamPage = lazyWithRetry(() => import('./components/TeamPage').then(m => ({ default: m.TeamPage })));
const DualMapComparison = lazyWithRetry(() => import('./components/DualMapComparison').then(m => ({ default: m.DualMapComparison })));
const PolygonInspector = lazyWithRetry(() => import('./components/PolygonInspector').then(m => ({ default: m.PolygonInspector })));

// Sleek minimal fallback skeleton
const TabLoadingFallback: React.FC<{ label?: string }> = ({ label = 'Loading Module...' }) => (
  <div className="w-full min-h-[420px] flex flex-col items-center justify-center gap-3 py-16 text-[#6e6e73] dark:text-[#9ca3af]">
    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937] shadow-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
    <span className="text-xs font-medium tracking-tight animate-pulse">{label}</span>
  </div>
);

// Tab Error Boundary to prevent white screen crashes on module load failures
interface TabErrorBoundaryProps {
  children: React.ReactNode;
  fallbackLabel?: string;
}

interface TabErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class TabErrorBoundary extends React.Component<TabErrorBoundaryProps, TabErrorBoundaryState> {
  constructor(props: TabErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TabErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Wanareksa] Component failed to render:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[380px] flex flex-col items-center justify-center gap-4 py-16 px-4 text-center rounded-3xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] my-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1d1d1f] dark:text-white">
              {this.props.fallbackLabel || 'Koneksi Modul Sedang Disinkronkan'}
            </h3>
            <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af] max-w-md">
              Server atau modul baru saja diperbarui. Klik tombol di bawah untuk menyegarkan tampilan.
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-xl bg-[#0b3d91] hover:bg-[#093276] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan Tampilan</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [language, setLanguage] = useState<Language>('en');
  
  // Theme state: initialized from localStorage or browser media query
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('wanareksa_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    } catch (e) {}
    return 'light';
  });

  // Track if user explicitly chose a theme
  const [hasUserOverride, setHasUserOverride] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('wanareksa_theme');
      return saved === 'dark' || saved === 'light';
    } catch (e) {
      return false;
    }
  });

  // Live listener for OS / browser prefers-color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Auto-update if the user hasn't explicitly set a preference
      if (!hasUserOverride) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [hasUserOverride]);

  // Synchronize 'dark' class and data-theme on <html> and <body>
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      if (body) body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      if (body) body.classList.remove('dark');
    }
  }, [theme]);

  // 1-Click Direct Toggle between Light & Dark
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('wanareksa_theme', next);
      } catch (e) {}
      setHasUserOverride(true);
      return next;
    });
  };

  // App Mode: 'citizen' (Mode Warga) or 'science' (Mode Riset / Satgas)
  const [appMode, setAppMode] = useState<AppMode>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const modeParam = params.get('mode') as AppMode;
        if (modeParam === 'citizen' || modeParam === 'science') return modeParam;
        const saved = localStorage.getItem('wanareksa_app_mode') as AppMode;
        if (saved === 'citizen' || saved === 'science') return saved;
      }
    } catch (e) {}
    return 'citizen';
  });

  const handleToggleAppMode = (newMode: AppMode) => {
    setAppMode(newMode);
    try {
      localStorage.setItem('wanareksa_app_mode', newMode);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', newMode);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e) {}
  };

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as NavTab;
        if (tabParam && ['story', 'overview', 'lab', 'mitigation', 'data-hub', 'team'].includes(tabParam)) {
          return tabParam;
        }
      }
    } catch (e) {}
    return 'overview';
  });
  const [overviewView, setOverviewView] = useState<OverviewViewMode>('main');
  const [selectedAOI, setSelectedAOI] = useState<AOIRegion>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const aoiParam = params.get('aoi');
        if (aoiParam) {
          const found = PRESET_AOIS.find((a) => a.id === aoiParam);
          if (found) return found;
        }
      }
    } catch (e) {}
    return PRESET_AOIS[0];
  });

  // Synchronize URL query params with active tab & selected AOI & appMode without reload
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', appMode);
        url.searchParams.set('tab', activeTab);
        url.searchParams.set('aoi', selectedAOI.id);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e) {}
  }, [appMode, activeTab, selectedAOI.id]);

  const [rawMode, setRawMode] = useState<boolean>(false);
  const [selectedKey, setSelectedKey] = useState<string | null>('2015-38');
  const [selectedWeekData, setSelectedWeekData] = useState<HarmonizedWeekData | null>(null);
  const [isNasaModalOpen, setIsNasaModalOpen] = useState<boolean>(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const seen = localStorage.getItem('wanareksa_intro_seen');
        if (!seen) return true; // Auto-open for first-time visitors!
      }
    } catch (e) {}
    return false;
  });
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);

  const [isLiveSync, setIsLiveSync] = useState<boolean>(false);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [liveResult, setLiveResult] = useState<LiveSyncResult | null>(null);
  const [userMapKey, setUserMapKey] = useState<string>(() =>
    localStorage.getItem('wanareksa_map_key') || 'c5570b98a3bfc36460c13bfce01742f3'
  );

  const t = translations[language];

  // 1-Click Historic Disaster Benchmark Case Studies
  const handleSelectScenario = useCallback((scenarioId: string | null) => {
    setActiveScenario(scenarioId);
    if (!scenarioId) return;

    if (scenarioId === 'el_nino_2015') {
      const kalteng = PRESET_AOIS.find((a) => a.id === 'kalteng') || PRESET_AOIS[1];
      setSelectedAOI(kalteng);
      setSelectedKey('2015-38');
      setRawMode(false);
      setActiveTab('overview');
    } else if (scenarioId === 'iod_2019') {
      const sumsel = PRESET_AOIS.find((a) => a.id === 'sumsel') || PRESET_AOIS[2];
      setSelectedAOI(sumsel);
      setSelectedKey('2019-37');
      setRawMode(false);
      setActiveTab('overview');
    } else if (scenarioId === 'restoration_2023') {
      const riau = PRESET_AOIS.find((a) => a.id === 'riau') || PRESET_AOIS[0];
      setSelectedAOI(riau);
      setSelectedKey('2023-30');
      setRawMode(false);
      setActiveTab('overview');
    }
  }, []);

  // Stateful Shareable Analysis Permalink Generator
  const handleShareLink = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('aoi', selectedAOI.id);
    url.searchParams.set('tab', activeTab);
    url.searchParams.set('mode', rawMode ? 'raw' : 'harmonized');
    if (selectedKey) url.searchParams.set('key', selectedKey);
    if (activeScenario) url.searchParams.set('scenario', activeScenario);

    navigator.clipboard.writeText(url.toString());
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2200);
  }, [selectedAOI, activeTab, rawMode, selectedKey, activeScenario]);

  // Sync state to URL search params without page reload
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('aoi', selectedAOI.id);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }, [selectedAOI, activeTab]);

  const fullDataset = useMemo(() => generateHistoricalFireData(), []);
  const aoiHotspots = useMemo(() => fullDataset[selectedAOI.id] || [], [fullDataset, selectedAOI]);

  const loadLiveFeed = useCallback(async (aoi: AOIRegion, mapKey?: string) => {
    setIsLoadingLive(true);
    try {
      const result = await fetchLiveNASAHotspots(aoi, mapKey);
      setLiveResult(result);
    } catch (err) {
      console.error('Failed to load NASA FIRMS live feed:', err);
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  const handleToggleLiveSync = useCallback(() => {
    setIsLiveSync((prev) => {
      const next = !prev;
      if (next) loadLiveFeed(selectedAOI, userMapKey);
      return next;
    });
  }, [loadLiveFeed, selectedAOI, userMapKey]);

  const handleSaveMapKey = (key: string) => {
    setUserMapKey(key);
    localStorage.setItem('wanareksa_map_key', key);
    if (isLiveSync) loadLiveFeed(selectedAOI, key);
  };

  useEffect(() => {
    if (isLiveSync) loadLiveFeed(selectedAOI, userMapKey);
  }, [selectedAOI, isLiveSync, loadLiveFeed, userMapKey]);

  // Global power-user keyboard shortcuts for live pitch presentation (1-5, L, T, ?)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '0' || e.key === 's' || e.key === 'S') {
        setActiveTab('story');
      } else if (e.key === '1') {
        setActiveTab('overview');
      } else if (e.key === '2') {
        setActiveTab('lab');
      } else if (e.key === '3') {
        setActiveTab('mitigation');
      } else if (e.key === '4') {
        setActiveTab('data-hub');
      } else if (e.key === '5') {
        setActiveTab('team');
      } else if (e.key === 'w' || e.key === 'W') {
        handleToggleAppMode(appMode === 'citizen' ? 'science' : 'citizen');
      } else if (e.key === 'l' || e.key === 'L') {
        handleToggleLiveSync();
      } else if (e.key === 't' || e.key === 'T') {
        toggleTheme();
      } else if (e.key === 'b' || e.key === 'B') {
        setIsBriefingModalOpen((prev) => !prev);
      } else if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        setIsTourModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleToggleLiveSync, toggleTheme, appMode]);

  const displayedHotspots = useMemo(() => {
    if (isLiveSync && liveResult?.hotspots && liveResult.hotspots.length > 0) return liveResult.hotspots;
    return aoiHotspots;
  }, [isLiveSync, liveResult, aoiHotspots]);

  const { calendarMatrix, yearlyAverages, weeklyBaselines } = useMemo(
    () => harmonizeHotspots(aoiHotspots),
    [aoiHotspots]
  );

  useMemo(() => {
    if (selectedKey && calendarMatrix[selectedKey]) {
      setSelectedWeekData(calendarMatrix[selectedKey]);
    }
  }, [selectedKey, calendarMatrix]);

  const handleSelectCell = (key: string, data: HarmonizedWeekData) => {
    setSelectedKey(key);
    setSelectedWeekData(data);
  };

  const totalEvents = displayedHotspots.length;
  const highestYear = Object.entries(yearlyAverages).sort((a, b) => b[1].frp - a[1].frp)[0];
  const anomalyCount = Object.values(calendarMatrix).filter((c) => c.isUnusualCondition).length;
  const peakYear = highestYear ? highestYear[0] : '2015';
  const peakFRP = highestYear ? Math.round(highestYear[1].frp).toLocaleString() : '0';

  const sparklinePoints = useMemo(() => {
    const years = Object.keys(yearlyAverages).sort();
    if (years.length < 2) return '';
    const frps = years.map((y) => yearlyAverages[y]?.frp || 0);
    const max = Math.max(...frps, 1);
    const width = 120;
    const height = 28;
    return frps
      .map((val, idx) => {
        const x = (idx / (frps.length - 1)) * width;
        const y = height - (val / max) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [yearlyAverages]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Apple-style Navigation */}
      <Navbar
        language={language}
        onToggleLanguage={setLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        appMode={appMode}
        onToggleAppMode={handleToggleAppMode}
        onOpenTeam={() => setActiveTab('team')}
        onOpenTour={() => setIsTourModalOpen(true)}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
        isLiveSync={isLiveSync}
      />

      {/* Live NASA Orbital Telemetry Strip */}
      <OrbitalTelemetryTicker language={language} isLiveSync={isLiveSync} />

      {/* Main Canvas */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* DUAL MODE: MODE WARGA (CITIZEN) vs MODE RISET / SATGAS (SCIENCE) */}
        {appMode === 'citizen' ? (
          <CitizenPortal
            language={language}
            selectedAOI={selectedAOI}
            onSelectAOI={(aoi) => {
              setSelectedAOI(aoi);
              setSelectedKey(null);
              setSelectedWeekData(null);
            }}
            hotspots={displayedHotspots}
            isLiveSync={isLiveSync}
            onSwitchToScience={() => handleToggleAppMode('science')}
            onOpenBriefing={() => setIsBriefingModalOpen(true)}
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
          />
        ) : (
          <>
            {/* Tab 0: Mission Story & Executive Overview */}
            {activeTab === 'story' && (
              <Suspense fallback={<TabLoadingFallback label={language === 'id' ? 'Memuat Misi & Ikhtisar Eksekutif...' : 'Loading Mission Story...'} />}>
            <div className="animate-in fade-in duration-200">
              <LandingStory
                language={language}
                onSelectTab={setActiveTab}
                onOpenTour={() => setIsTourModalOpen(true)}
              />
            </div>
          </Suspense>
        )}

        {/* Tab 1: Live Intelligence & Harmonized Calendar (Overview) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Control bar with Segmented Tool Switcher & Historic Case Studies */}
            <DashboardControlBar
              language={language}
              selectedAOI={selectedAOI}
              onSelectAOI={(aoi) => {
                setSelectedAOI(aoi);
                setSelectedKey(null);
                setSelectedWeekData(null);
                setActiveScenario(null);
              }}
              rawMode={rawMode}
              setRawMode={setRawMode}
              isLiveSync={isLiveSync}
              onToggleLiveSync={handleToggleLiveSync}
              isLoadingLive={isLoadingLive}
              onOpenApiKeyModal={() => setIsNasaModalOpen(true)}
              activeView={overviewView}
              onSelectView={setOverviewView}
              totalHotspots={totalEvents}
              anomalyCount={anomalyCount}
              activeScenario={activeScenario}
              onSelectScenario={handleSelectScenario}
              onShareLink={handleShareLink}
              isLinkCopied={isLinkCopied}
              onOpenBriefing={() => setIsBriefingModalOpen(true)}
            />

            {/* Live sync notification banner */}
            {isLiveSync && (
              <div className="bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl px-5 py-3 flex items-center justify-between gap-3 text-xs shadow-xs">
                <div>
                  <span className="font-semibold text-[#1d1d1f] dark:text-white">
                    {t.liveSyncNotice} {selectedAOI.name}
                  </span>
                  <p className="text-[#86868b] dark:text-[#9ca3af] mt-0.5">
                    {liveResult
                      ? `${liveResult.modisCount} MODIS + ${liveResult.viirsCount} VIIRS. ${t.liveSyncOvercount}`
                      : t.fetchingNasa}
                  </p>
                </div>
                <button
                  onClick={() => loadLiveFeed(selectedAOI, userMapKey)}
                  disabled={isLoadingLive}
                  className="p-1.5 text-[#0071e3] dark:text-[#38bdf8] hover:underline transition-colors flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin' : ''}`} />
                  <span>{language === 'id' ? 'Segarkan' : 'Refresh'}</span>
                </button>
              </div>
            )}

            {/* VIEW MODE 1: Main Intelligence & 26-Year Matrix */}
            {overviewView === 'main' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* 1. Interactive Judges & Evaluator Quick-Start Roadmap */}
                <JudgesEvaluationGuide
                  language={language}
                  selectedAOI={selectedAOI}
                  onSelectAOI={(aoi) => {
                    setSelectedAOI(aoi);
                    setSelectedKey(null);
                    setSelectedWeekData(null);
                    setActiveScenario(null);
                  }}
                  rawMode={rawMode}
                  setRawMode={setRawMode}
                  onSelectScenario={handleSelectScenario}
                  activeScenario={activeScenario}
                  onSelectTab={setActiveTab}
                  onOpenTour={() => setIsTourModalOpen(true)}
                />

                {/* 2. Metric Strip: Tactile Cards with SVG Micro-Sparklines & Tabular Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Raw Detections */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                        {t.rawDetections}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {isLiveSync ? 'NASA FIRMS' : 'MODIS + VIIRS'}
                      </span>
                    </div>

                    <div>
                      <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums text-slate-900 dark:text-white leading-none">
                        {totalEvents.toLocaleString()}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        {isLiveSync ? `${selectedAOI.name} (Live Sync)` : t.rawDetectionsDesc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Terra/Aqua 1km</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">VIIRS 375m</span>
                    </div>
                  </div>

                  {/* Card 2: Historic Peak FRP */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                        {t.historicPeakYear}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        26-YR TRAJECTORY
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums text-slate-900 dark:text-white leading-none">
                        {peakYear}
                      </div>

                      {/* Micro-sparkline of 26-year FRP trajectory */}
                      {sparklinePoints && (
                        <div className="shrink-0" title="2000-2026 FRP Trajectory">
                          <svg className="w-24 h-7 overflow-visible" viewBox="0 0 120 28">
                            <polyline
                              fill="none"
                              stroke="#0284c7"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={sparklinePoints}
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{t.energyTotal}:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{peakFRP} MW</span>
                    </div>
                  </div>

                  {/* Card 3: Equal-Area Resolution */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                        {t.spatialResolution}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        RFC 7946 EQUAL-AREA
                      </span>
                    </div>

                    <div>
                      <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums text-slate-900 dark:text-white leading-none">
                        5.5 km
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        {t.spatialResolutionDesc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Reduksi Overcount:</span>
                      <span className="font-semibold text-sky-600 dark:text-sky-400">0.63x Fusi Spasial</span>
                    </div>
                  </div>

                  {/* Card 4: Unusual Climate Anomalies */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                        {t.unusualAnomalies}
                      </span>
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${
                        anomalyCount > 10 ? 'text-rose-500 font-bold' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {anomalyCount > 10 ? '● IKLIM EKSTREM' : '● NORMAL'}
                      </span>
                    </div>

                    <div>
                      <div className={`text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums leading-none ${
                        anomalyCount > 10 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {anomalyCount}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        {t.unusualAnomaliesDesc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Batas Z-Score:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">&gt; +2.0 Sigma</span>
                    </div>
                  </div>

                </div>

                {/* 3. Interactive 26-Year Burning Calendar */}
                <section>
                  <BurningCalendar
                    language={language}
                    calendarMatrix={calendarMatrix}
                    rawMode={rawMode}
                    selectedKey={selectedKey}
                    onSelectCell={handleSelectCell}
                  />
                </section>

                {/* 4. Geospatial & Prognosis Section: Perfectly Balanced 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column (7 cols): Map Viewer + Sensor Bias Proof Card */}
                  <div className="lg:col-span-7 space-y-6">
                    <MapViewer
                      language={language}
                      selectedAOI={selectedAOI}
                      onSelectAOI={setSelectedAOI}
                      hotspots={displayedHotspots}
                      selectedWeekData={isLiveSync ? null : selectedWeekData}
                      rawMode={rawMode}
                      isLiveSync={isLiveSync}
                      isLoading={isLoadingLive}
                    />

                    <ComparisonMetrics
                      language={language}
                      selectedAOI={selectedAOI}
                      yearlyAverages={yearlyAverages}
                    />
                  </div>

                  {/* Right Column (5 cols): Weather Prognosis & Extreme Anomaly Alerts */}
                  <div className="lg:col-span-5 space-y-6">
                    <RiskForecast
                      language={language}
                      selectedAOI={selectedAOI}
                      calendarMatrix={calendarMatrix}
                      weeklyBaselines={weeklyBaselines}
                      isLiveSync={isLiveSync}
                      liveHotspotCount={displayedHotspots.length}
                    />
                    
                    <CriticalAlerts
                      language={language}
                      selectedAOI={selectedAOI}
                      calendarMatrix={calendarMatrix}
                      weeklyBaselines={weeklyBaselines}
                    />
                  </div>
                </div>

                {/* 5. Full-Width Deep Interactive Visual Analytics & Physics Suite */}
                <section>
                  <VisualAnalytics
                    language={language}
                    selectedAOI={selectedAOI}
                    calendarMatrix={calendarMatrix}
                    rawMode={rawMode}
                  />
                </section>
              </div>
            )}

            {/* VIEW MODE 2: Dedicated Dual Map Comparison */}
            {overviewView === 'dual_map' && (
              <Suspense fallback={<TabLoadingFallback label={language === 'id' ? 'Memuat Peta Komparasi Dual...' : 'Loading Dual Sensor Map...'} />}>
                <div className="animate-in fade-in duration-150">
                  <DualMapComparison
                    language={language}
                    selectedAOI={selectedAOI}
                    allHotspots={displayedHotspots}
                  />
                </div>
              </Suspense>
            )}

            {/* VIEW MODE 3: Dedicated Polygon & Concession Inspector */}
            {overviewView === 'polygon' && (
              <Suspense fallback={<TabLoadingFallback label={language === 'id' ? 'Memuat Inspektur Konsesi & Poligon...' : 'Loading Concession Inspector...'} />}>
                <div className="animate-in fade-in duration-150">
                  <PolygonInspector
                    language={language}
                    selectedAOI={selectedAOI}
                    allHotspots={displayedHotspots}
                  />
                </div>
              </Suspense>
            )}

          </div>
        )}

        {/* Tab 2: Harmonization Lab */}
        {activeTab === 'lab' && (
          <Suspense fallback={<TabLoadingFallback label={language === 'id' ? 'Memuat Laboratorium Harmonisasi...' : 'Loading Harmonization Lab...'} />}>
            <div className="animate-in fade-in duration-200">
              <HarmonizationLab language={language} />
            </div>
          </Suspense>
        )}

        {/* Tab 3: Mitigation Hub & Executive SitRep */}
        {activeTab === 'mitigation' && (
          <Suspense fallback={<TabLoadingFallback label={language === 'id' ? 'Memuat Pusat Mitigasi & SitRep...' : 'Loading Mitigation Hub & SitRep...'} />}>
            <div className="animate-in fade-in duration-200">
              <MitigationHub
                language={language}
                selectedAOI={selectedAOI}
                onSelectAOI={setSelectedAOI}
                calendarMatrix={calendarMatrix}
                totalHotspots={totalEvents}
                isLiveSync={isLiveSync}
                liveResult={liveResult}
                liveHotspots={displayedHotspots}
                isLoadingLive={isLoadingLive}
                onRefreshLive={() => loadLiveFeed(selectedAOI, userMapKey)}
              />
            </div>
          </Suspense>
        )}

        {/* Tab 4: Open Data Registry */}
        {activeTab === 'data-hub' && (
          <Suspense fallback={<TabLoadingFallback label={language === 'id' ? 'Memuat Pusat Data Terbuka...' : 'Loading Open Data Hub...'} />}>
            <div className="animate-in fade-in duration-200">
              <DataHub
                language={language}
                selectedAOI={selectedAOI}
                calendarMatrix={calendarMatrix}
                onOpenApiKeyModal={() => setIsNasaModalOpen(true)}
                userMapKey={userMapKey}
              />
            </div>
          </Suspense>
        )}

            {/* Tab 5: Team Profile & Scientific Dossier */}
            {activeTab === 'team' && (
              <Suspense fallback={<TabLoadingFallback label={language === 'id' ? 'Memuat Profil Tim & Berkas Ilmiah...' : 'Loading Team Dossier...'} />}>
                <div className="animate-in fade-in duration-200">
                  <TeamPage language={language} />
                </div>
              </Suspense>
            )}
          </>
        )}
      </main>

      {/* Immersive Orbital & NASA Terra Satellite Footer */}
      <Footer language={language} onSelectTab={setActiveTab} />

      {/* Technical Configuration Modal for MAP_KEY if requested */}
      <NasaApiKeyModal
        language={language}
        isOpen={isNasaModalOpen}
        onClose={() => setIsNasaModalOpen(false)}
        currentKey={userMapKey}
        onSaveKey={handleSaveMapKey}
        onRefreshLive={() => loadLiveFeed(selectedAOI, userMapKey)}
        isLoading={isLoadingLive}
        sourceStatus={
          liveResult?.source === 'NASA_FIRMS_LIVE'
            ? (language === 'id' ? 'Terhubung: Feed Satelit NASA FIRMS 24 Jam' : 'Connected: NASA FIRMS 24-Hour Satellite Feed')
            : liveResult?.source === 'NASA_FIRMS_API_KEY'
            ? (language === 'id' ? 'Terhubung: NASA FIRMS API Resmi' : 'Connected: NASA FIRMS Authorized API')
            : undefined
        }
      />

      {/* 30-Second Cinematic Interactive Orbital & Satellite Mission Briefing Tour */}
      <CinematicIntroTour
        language={language}
        onToggleLanguage={setLanguage}
        isOpen={isTourModalOpen}
        onClose={() => {
          setIsTourModalOpen(false);
          try {
            localStorage.setItem('wanareksa_intro_seen', 'true');
          } catch (e) {}
        }}
        onEnterApp={() => {
          setIsTourModalOpen(false);
          try {
            localStorage.setItem('wanareksa_intro_seen', 'true');
          } catch (e) {}
        }}
      />

      {/* 1-Click Printable Executive Briefing Modal */}
      <ExecutiveBriefingModal
        isOpen={isBriefingModalOpen}
        onClose={() => setIsBriefingModalOpen(false)}
        language={language}
        selectedAOI={selectedAOI}
        calendarMatrix={calendarMatrix}
        liveHotspots={displayedHotspots}
        userMapKey={userMapKey}
      />

      {/* Real-time Subsurface Peat Early Warning Alert Dispatch Modal */}
      <EarlyWarningAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        language={language}
      />
    </div>
  );
}
