import React, { useState } from 'react';
import { Language, translations } from '../data/translations';
import { AOIRegion, PRESET_AOIS } from '../engine/harmonizer';
import { Radio, RefreshCw, Settings2, ChevronDown, Volume2, VolumeX, Split, MapPin, Calendar, Share2, CheckCircle2, History, Sparkles, Printer } from 'lucide-react';
import { speakSituationBriefing } from '../utils/audioBriefing';

export type OverviewViewMode = 'main' | 'dual_map' | 'polygon';

interface DashboardControlBarProps {
  language: Language;
  selectedAOI: AOIRegion;
  onSelectAOI: (aoi: AOIRegion) => void;
  rawMode: boolean;
  setRawMode: (val: boolean) => void;
  isLiveSync: boolean;
  onToggleLiveSync: () => void;
  isLoadingLive: boolean;
  onOpenApiKeyModal: () => void;
  activeView: OverviewViewMode;
  onSelectView: (view: OverviewViewMode) => void;
  totalHotspots?: number;
  anomalyCount?: number;
  activeScenario?: string | null;
  onSelectScenario?: (id: string | null) => void;
  onShareLink?: () => void;
  isLinkCopied?: boolean;
  onOpenBriefing?: () => void;
}

export const DashboardControlBar: React.FC<DashboardControlBarProps> = ({
  language,
  selectedAOI,
  onSelectAOI,
  rawMode,
  setRawMode,
  isLiveSync,
  onToggleLiveSync,
  isLoadingLive,
  onOpenApiKeyModal,
  activeView,
  onSelectView,
  totalHotspots = 0,
  anomalyCount = 0,
  activeScenario = null,
  onSelectScenario,
  onShareLink,
  isLinkCopied = false,
  onOpenBriefing,
}) => {
  const t = translations[language];
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const handleToggleVoice = () => {
    speakSituationBriefing(
      selectedAOI,
      totalHotspots,
      anomalyCount,
      language,
      setIsSpeaking
    );
  };

  return (
    <div className="bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden space-y-0 transition-colors">
      
      {/* Primary Toolbar Controls */}
      <div className="px-4 sm:px-5 py-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 bg-white dark:bg-[#0a0f1d] border-b border-slate-200 dark:border-slate-800">

        {/* Region Selector & Quick AOI Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <label htmlFor="aoi-select" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.region}:
            </label>
          </div>

          <div className="relative w-full sm:w-56 shrink-0">
            <select
              id="aoi-select"
              name="aoi"
              aria-label={t.region}
              value={selectedAOI.id}
              onChange={(e) => {
                const aoi = PRESET_AOIS.find((a) => a.id === e.target.value);
                if (aoi) onSelectAOI(aoi);
              }}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 cursor-pointer min-h-[40px] shadow-2xs"
            >
              {PRESET_AOIS.map((aoi) => (
                <option key={aoi.id} value={aoi.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {aoi.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Quick AOI Tactile Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'riau', name: 'Riau', biome: language === 'id' ? 'Gambut' : 'Peat' },
              { id: 'kalteng', name: 'Kalteng', biome: language === 'id' ? 'Biosfer' : 'Biosphere' },
              { id: 'sumsel', name: 'Sumsel', biome: 'Basin' },
              { id: 'indonesia', name: 'Indonesia', biome: language === 'id' ? 'Nasional' : 'National' },
            ].map((item) => {
              const isSelected = selectedAOI.id === item.id;
              const aoiObj = PRESET_AOIS.find((a) => a.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => aoiObj && onSelectAOI(aoiObj)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 border min-h-[36px] ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs font-semibold'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={`${item.name} (${item.biome})`}
                >
                  <span>{item.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-sky-200' : 'text-slate-400 font-mono'}`}>
                    {item.biome}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Space-Saving Aerospace Control Bar: Segmented Switch, Live Sync & Quick Toolbelt */}
        <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
          
          {/* Mode Toggle (Aerospace Segmented Capsule) */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 text-xs font-medium h-9 items-center border border-slate-200 dark:border-slate-800 shadow-2xs">
            <button
              onClick={() => setRawMode(false)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer h-7 flex items-center justify-center text-xs ${
                !rawMode
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.harmonized}
            </button>
            <button
              onClick={() => setRawMode(true)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer h-7 flex items-center justify-center text-xs ${
                rawMode
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.rawSensors}
            </button>
          </div>

          {/* NASA Live Sync Button */}
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs h-9 shadow-2xs">
            <button
              onClick={onToggleLiveSync}
              className={`flex items-center justify-center gap-1.5 px-3 py-1 font-medium transition-all cursor-pointer h-9 ${
                isLiveSync
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {isLoadingLive ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Radio className={`w-3.5 h-3.5 ${isLiveSync ? 'text-rose-500 animate-pulse' : ''}`} />
              )}
              <span className="text-xs">{isLiveSync ? t.liveSyncActive : t.liveSync}</span>
            </button>
            <button
              onClick={onOpenApiKeyModal}
              title={t.apiKeySettings}
              className="px-2 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer h-9 flex items-center justify-center"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compact Quick Action Toolbelt */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {/* Voice Audio Briefing */}
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-lg transition-all cursor-pointer h-8 w-8 flex items-center justify-center ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-white dark:hover:bg-[#1f2937]'
              }`}
              title={isSpeaking ? t.stopVoice : (language === 'id' ? 'Dengarkan Briefing Suara AI' : 'Listen to Voice Briefing')}
              aria-label="Voice Briefing"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* 1-Click Executive Briefing */}
            {onOpenBriefing && (
              <button
                onClick={onOpenBriefing}
                className="p-2 rounded-lg text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-white dark:hover:bg-[#1f2937] transition-all cursor-pointer h-8 w-8 flex items-center justify-center"
                title={language === 'id' ? 'Buka Ringkasan Eksekutif (A4 PDF)' : 'Open Executive Briefing (A4 PDF)'}
                aria-label="Executive Briefing"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            {/* Shareable Analysis Permalink */}
            {onShareLink && (
              <button
                onClick={onShareLink}
                className={`p-2 rounded-lg transition-all cursor-pointer h-8 w-8 flex items-center justify-center ${
                  isLinkCopied
                    ? 'bg-emerald-600 text-white'
                    : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-white dark:hover:bg-[#1f2937]'
                }`}
                title={isLinkCopied ? t.shareLinkCopied : t.shareAnalysisLink}
                aria-label="Share Link"
              >
                {isLinkCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Historic Disaster Benchmark Case Studies Strip (Space-Efficient Compact Pills) */}
      {onSelectScenario && (
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 dark:bg-[#0c121e] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider shrink-0">
            <History className="w-3.5 h-3.5 text-sky-500" />
            <span>{t.scenariosTitle}:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap flex-1 max-w-xl">
            {[
              {
                id: 'el_nino_2015',
                title: '2015 El Niño',
                subtitle: 'Kalteng',
                activeBg: 'bg-rose-600 text-white font-bold',
              },
              {
                id: 'iod_2019',
                title: '2019 IOD+',
                subtitle: 'Sumsel',
                activeBg: 'bg-amber-600 text-white font-bold',
              },
              {
                id: 'restoration_2023',
                title: '2023 BRGM',
                subtitle: 'Riau',
                activeBg: 'bg-emerald-600 text-white font-bold',
              },
            ].map((sc) => {
              const isSelected = activeScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(isSelected ? null : sc.id)}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap min-h-[32px] ${
                    isSelected
                      ? `${sc.activeBg} border-transparent shadow-xs`
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                  title={`${sc.title} (${sc.subtitle})`}
                >
                  <History className="w-3 h-3 shrink-0 opacity-80" />
                  <span className="font-semibold">{sc.title}</span>
                  <span className="text-[10px] opacity-70">({sc.subtitle})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Segmented View Mode Switcher */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/50 dark:bg-[#0c121e]/80 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Left: Biome Info & Client-Side Engine Badge */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 flex-wrap">
          <span className="font-semibold text-slate-900 dark:text-white">{selectedAOI.biome}</span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400">{selectedAOI.description}</span>
          
          <span
            title={t.offlineEngineTooltip}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.offlineEngineBadge}</span>
          </span>
        </div>

        {/* Right: Segmented Tool Switcher - 100% Equal Width on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 gap-1 w-full md:w-auto border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
          <button
            onClick={() => onSelectView('main')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
              activeView === 'main'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <span className="truncate">{t.mainIntelCalendar}</span>
          </button>

          <button
            onClick={() => onSelectView('dual_map')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
              activeView === 'dual_map'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Split className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <span className="truncate">{t.dualMapCompare}</span>
          </button>

          <button
            onClick={() => onSelectView('polygon')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
              activeView === 'polygon'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <span className="truncate">{t.polygonInspector}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
