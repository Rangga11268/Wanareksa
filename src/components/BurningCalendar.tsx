import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HarmonizedWeekData } from '../engine/harmonizer';
import { Language, translations } from '../data/translations';
import {
  Play,
  Pause,
  Calendar as CalendarIcon,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

interface BurningCalendarProps {
  language: Language;
  calendarMatrix: Record<string, HarmonizedWeekData>;
  rawMode: boolean;
  selectedKey: string | null;
  onSelectCell: (key: string, data: HarmonizedWeekData) => void;
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const ALL_YEARS = Array.from({ length: 27 }, (_, i) => 2000 + i);

export const BurningCalendar: React.FC<BurningCalendarProps> = ({
  language,
  calendarMatrix,
  rawMode,
  selectedKey,
  onSelectCell,
}) => {
  const t = translations[language];
  const MONTHS = language === 'id' ? MONTHS_ID : MONTHS_EN;

  // View modes: 'matrix' (Dense 52-week heatmap) or 'monthly' (Mobile-first monthly card breakdown)
  const [viewMode, setViewMode] = useState<'matrix' | 'monthly'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'monthly' : 'matrix';
  });
  const [hoveredData, setHoveredData] = useState<HarmonizedWeekData | null>(null);
  const [pinnedData, setPinnedData] = useState<HarmonizedWeekData | null>(null);

  // Focus year for monthly view
  const [focusYear, setFocusYear] = useState<number>(2023);

  // Playback engine
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackYear, setPlaybackYear] = useState<number | null>(null);
  const playerTimerRef = useRef<any>(null);

  // Climate filter preset
  const [activeClimateFilter, setActiveClimateFilter] = useState<'all' | '2015' | '2019' | '2023' | 'lanina'>('all');

  // Filtered Years
  const displayedYears = useMemo(() => {
    if (activeClimateFilter === '2015') return [2015];
    if (activeClimateFilter === '2019') return [2019];
    if (activeClimateFilter === '2023') return [2023];
    if (activeClimateFilter === 'lanina') return [2010, 2016, 2020];
    return ALL_YEARS;
  }, [activeClimateFilter]);

  // Animation Playback Engine
  useEffect(() => {
    if (isPlaying) {
      playerTimerRef.current = setInterval(() => {
        setPlaybackYear((prev) => {
          const next = prev === null || prev >= 2026 ? 2000 : prev + 1;
          setFocusYear(next);
          // Auto select peak week of that year (typically week 36-38 in Sept)
          const peakWeek = `${next}-37`;
          if (calendarMatrix[peakWeek]) {
            onSelectCell(peakWeek, calendarMatrix[peakWeek]);
            setPinnedData(calendarMatrix[peakWeek]);
          }
          return next;
        });
      }, 800);
    } else {
      if (playerTimerRef.current) clearInterval(playerTimerRef.current);
    }
    return () => {
      if (playerTimerRef.current) clearInterval(playerTimerRef.current);
    };
  }, [isPlaying, calendarMatrix, onSelectCell]);

  // Color intensity scale
  const getCellColor = (item?: HarmonizedWeekData) => {
    if (!item) return 'bg-[#f2f2f7] dark:bg-[#1e293b] hover:bg-[#e5e5ea] dark:hover:bg-[#334155]';

    const value = rawMode
      ? Math.min(100, item.rawTotalCount * 2.2)
      : item.burningActivityIndex;

    if (value <= 0) return 'bg-[#f2f2f7] dark:bg-[#1e293b] hover:bg-[#e5e5ea] dark:hover:bg-[#334155]';
    if (value < 15) return 'bg-[#fef08a] dark:bg-[#ca8a04]/70 hover:bg-[#fde047] dark:hover:bg-[#ca8a04]'; // Level 1 (Low)
    if (value < 35) return 'bg-[#fed7aa] dark:bg-[#f97316]/80 hover:bg-[#fdba74] dark:hover:bg-[#ea580c]'; // Level 2 (Moderate)
    if (value < 65) return 'bg-[#fb923c] dark:bg-[#ea580c] hover:bg-[#f97316] dark:hover:bg-[#c2410c]';     // Level 3 (High)
    return 'bg-[#dc2626] dark:bg-[#dc2626] hover:bg-[#b91c1c] text-white';                                  // Level 4 (Severe)
  };

  const activeInspection = hoveredData || pinnedData || (selectedKey ? calendarMatrix[selectedKey] : null);

  // Monthly aggregated data for focusYear (Mobile card view)
  const monthlyDataForFocusYear = useMemo(() => {
    const monthlyStats: Array<{
      monthIndex: number;
      monthName: string;
      totalFRP: number;
      harmonizedCount: number;
      rawCount: number;
      maxIndex: number;
      isPeakDry: boolean;
      weeks: HarmonizedWeekData[];
    }> = [];

    for (let m = 1; m <= 12; m++) {
      const monthWeeks: HarmonizedWeekData[] = [];
      let totalFRP = 0;
      let harmonizedCount = 0;
      let rawCount = 0;
      let maxIndex = 0;

      for (let w = 1; w <= 52; w++) {
        const item = calendarMatrix[`${focusYear}-${w}`];
        if (item && item.month === m) {
          monthWeeks.push(item);
          totalFRP += item.totalFrpCalibrated;
          harmonizedCount += item.harmonizedClusterCount;
          rawCount += item.rawTotalCount;
          if (item.burningActivityIndex > maxIndex) {
            maxIndex = item.burningActivityIndex;
          }
        }
      }

      monthlyStats.push({
        monthIndex: m,
        monthName: MONTHS[m - 1],
        totalFRP,
        harmonizedCount,
        rawCount,
        maxIndex,
        isPeakDry: m >= 7 && m <= 10,
        weeks: monthWeeks,
      });
    }

    return monthlyStats;
  }, [focusYear, calendarMatrix, MONTHS]);

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 transition-all">
      
      {/* Top Header & Interactive View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e5e5e7] dark:border-[#1f2937]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base sm:text-lg text-[#1d1d1f] dark:text-white tracking-tight">
              {t.calendarTitle}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#f5f5f7] dark:bg-[#1f2937] text-[#6e6e73] dark:text-[#9ca3af] border border-[#e5e5e7] dark:border-[#374151] num">
              {t.calendarSpan}
            </span>
          </div>
          <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af] mt-1 leading-relaxed max-w-3xl">
            {rawMode ? t.calendarSubRaw : t.calendarSubHarmonized}
          </p>
        </div>

        {/* View Mode Toggle & Timeline Animation Player - Uniform Grid on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 w-full lg:w-auto">
          
          {/* Segmented View Switcher: Matrix vs Monthly */}
          <div className="grid grid-cols-2 bg-[#f5f5f7] dark:bg-[#1f2937] rounded-xl p-0.5 text-xs font-medium border border-[#e5e5e7] dark:border-[#374151] w-full sm:w-auto min-h-[44px]">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer min-h-[40px] ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-semibold'
                  : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{t.matrix52Weeks}</span>
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer min-h-[40px] ${
                viewMode === 'monthly'
                  ? 'bg-white dark:bg-[#374151] text-[#1d1d1f] dark:text-white shadow-xs font-semibold'
                  : 'text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t.monthlyCards}</span>
            </button>
          </div>

          {/* Time-lapse Playback Engine Button */}
          <div className="flex items-center justify-between sm:justify-center bg-[#f5f5f7] dark:bg-[#1f2937] border border-[#e5e5e7] dark:border-[#374151] rounded-xl p-0.5 text-xs w-full sm:w-auto min-h-[44px]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 font-bold text-[#1d1d1f] dark:text-white hover:text-black dark:hover:text-amber-400 transition cursor-pointer min-h-[40px]"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current text-red-600" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current text-[#0071e3] dark:text-blue-400" />
              )}
              <span>{isPlaying ? t.pauseSimulation : t.play20002026}</span>
            </button>
            {playbackYear && (
              <span className="px-2.5 py-1 text-xs font-bold num text-[#0071e3] dark:text-blue-400 bg-white dark:bg-[#374151] rounded-lg shadow-2xs border border-[#e5e5e7] dark:border-[#4b5563] shrink-0 mr-1">
                {playbackYear}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Climate Anomaly Quick Filter Strip */}
      <div className="space-y-2 text-xs">
        <span className="text-[#86868b] dark:text-[#9ca3af] font-bold text-[11px] uppercase tracking-wider block">
          {t.climateAnomaly}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 w-full">
          {[
            { key: 'all', label: t.all26Years },
            { key: '2015', label: t.elNino2015 },
            { key: '2019', label: t.elNino2019 },
            { key: '2023', label: t.elNino2023 },
            { key: 'lanina', label: t.laNinaWet },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setActiveClimateFilter(key as any);
                setIsPlaying(false);
              }}
              className={`px-2.5 py-2 rounded-xl font-medium transition-all text-center flex items-center justify-center cursor-pointer min-h-[44px] text-[11px] sm:text-xs ${
                activeClimateFilter === key
                  ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#111827] font-semibold shadow-xs'
                  : 'bg-[#f5f5f7] dark:bg-[#1f2937] text-[#6e6e73] dark:text-[#9ca3af] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#e5e5ea] dark:hover:bg-[#374151] border border-[#e5e5e7] dark:border-[#374151]'
              }`}
            >
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Dry Season Peak Badge */}
        <div className="flex items-center gap-2 text-[11px] text-[#86868b] dark:text-[#9ca3af]">
          <span className="inline-block w-2 h-2 rounded-xs bg-red-500" />
          <span>{t.primaryDrySeason} <b>{t.primaryDrySeasonMonths}</b></span>
        </div>
      </div>

      {/* MODE 1: 52-Week Dense Contribution Heatmap */}
      {viewMode === 'matrix' && (
        <div className="space-y-3">
          
          {/* Scrollable Heatmap Container with Clean Scroll Styling */}
          <div className="overflow-x-auto pb-2 border border-[#e5e5e7] dark:border-[#1f2937] rounded-xl bg-[#fafafa] dark:bg-[#0b0f19] p-3 sm:p-4 scrollbar-none">
            <div className="min-w-[840px]">
              
              {/* Month Header Legend with Dry Season Band */}
              <div className="grid grid-cols-[68px_repeat(52,1fr)] text-[11px] text-[#86868b] dark:text-[#9ca3af] text-center mb-2 font-medium items-center">
                <div className="text-left font-bold text-[#1d1d1f] dark:text-white pl-1">
                  {t.year}
                </div>
                {Array.from({ length: 52 }, (_, i) => {
                  const weekNum = i + 1;
                  const isMonthStart = (weekNum - 1) % 4 === 0 && Math.floor((weekNum - 1) / 4) < 12;
                  const monthIdx = Math.floor((weekNum - 1) / 4);
                  const monthName = isMonthStart ? MONTHS[monthIdx] : '';
                  const isDryPeak = monthIdx >= 7 && monthIdx <= 9; // Aug - Oct

                  return (
                    <div
                      key={weekNum}
                      className={`truncate py-0.5 rounded-sm ${
                        isDryPeak && isMonthStart ? 'text-red-700 dark:text-red-400 font-bold bg-red-100/60 dark:bg-red-950/60' : ''
                      }`}
                    >
                      {monthName || (weekNum % 5 === 0 ? weekNum : '')}
                    </div>
                  );
                })}
              </div>

              {/* Matrix Heat Rows */}
              <div className="space-y-1">
                {displayedYears.map((year) => {
                  const isDual = year >= 2012;
                  const isCurrentPlayback = playbackYear === year || focusYear === year;

                  return (
                    <div
                      key={year}
                      className={`grid grid-cols-[68px_repeat(52,1fr)] gap-0.5 items-center p-1 rounded-lg transition-colors ${
                        isCurrentPlayback ? 'bg-blue-50/70 dark:bg-blue-950/50 ring-1 ring-[#0071e3]' : 'hover:bg-white dark:hover:bg-[#1f2937]/50'
                      }`}
                    >
                      {/* Year Header Label */}
                      <div className="pr-2.5">
                        <button
                          onClick={() => {
                            setFocusYear(year);
                            setViewMode('monthly');
                          }}
                          className="text-[11px] font-bold text-[#1d1d1f] dark:text-white flex items-center justify-between w-full num cursor-pointer hover:text-[#0071e3] dark:hover:text-blue-400 min-h-[24px]"
                          title={language === 'id' ? `Klik untuk melihat rincian bulanan tahun ${year}` : `Click to view monthly details for ${year}`}
                        >
                          <span className={isCurrentPlayback ? 'text-[#0071e3] dark:text-blue-400' : ''}>{year}</span>
                          <span className="text-[9px] text-[#4b5563] dark:text-[#94a3b8] font-medium">
                            {isDual ? 'V+M' : 'MOD'}
                          </span>
                        </button>
                      </div>

                      {/* 52 Week Heatmap Cells */}
                      {Array.from({ length: 52 }, (_, i) => {
                        const week = i + 1;
                        const key = `${year}-${week}`;
                        const item = calendarMatrix[key];
                        const isSelected = selectedKey === key;

                        return (
                          <div
                            key={key}
                            onClick={() => {
                              if (item) {
                                onSelectCell(key, item);
                                setPinnedData(item);
                                setFocusYear(year);
                              }
                            }}
                            onMouseEnter={() => item && setHoveredData(item)}
                            onMouseLeave={() => setHoveredData(null)}
                            className={`h-4 sm:h-4.5 w-full rounded-[2.5px] heat-cell transition-transform hover:scale-125 hover:z-20 cursor-pointer ${getCellColor(
                              item
                            )} ${
                              isSelected
                                ? 'ring-2 ring-[#1d1d1f] dark:ring-white scale-110 z-10 relative shadow-xs'
                                : ''
                            }`}
                            title={`${t.year} ${year}, ${t.weekLabel} ${week}`}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Mobile-Friendly Monthly Cards (12 Months Breakdown) */}
      {viewMode === 'monthly' && (
        <div className="space-y-4">
          
          {/* Year Navigator Bar */}
          <div className="flex items-center justify-between bg-[#f5f5f7] dark:bg-[#1f2937] border border-[#e5e5e7] dark:border-[#374151] rounded-xl p-3">
            <button
              onClick={() => setFocusYear((prev) => Math.max(2000, prev - 1))}
              disabled={focusYear <= 2000}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-[#374151] text-[#1d1d1f] dark:text-white disabled:opacity-30 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Previous Year"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="text-xl font-bold text-[#1d1d1f] dark:text-white num">{focusYear}</div>
              <p className="text-[11px] text-[#86868b] dark:text-[#9ca3af]">
                {focusYear >= 2012
                  ? (language === 'id' ? 'Era Sensor Ganda (MODIS + VIIRS)' : 'Dual Sensor Era (MODIS + VIIRS)')
                  : (language === 'id' ? 'Era Sensor Tunggal (MODIS 1km)' : 'Single Sensor Era (MODIS 1km)')}
              </p>
            </div>

            <button
              onClick={() => setFocusYear((prev) => Math.min(2026, prev + 1))}
              disabled={focusYear >= 2026}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-[#374151] text-[#1d1d1f] dark:text-white disabled:opacity-30 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Next Year"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 12-Month Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {monthlyDataForFocusYear.map((m) => {
              return (
                <div
                  key={m.monthIndex}
                  className={`p-3.5 rounded-xl border transition-all ${
                    m.isPeakDry
                      ? 'bg-red-50/40 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 shadow-2xs'
                      : 'bg-white dark:bg-[#111827] border-[#e5e5e7] dark:border-[#1f2937] hover:border-[#1d1d1f]/20 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#1d1d1f] dark:text-white">{m.monthName}</span>
                    {m.isPeakDry && (
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded">
                        {language === 'id' ? 'Puncak Kering' : 'Peak Dry'}
                      </span>
                    )}
                  </div>

                  {/* 4 Weekly Cells for this month */}
                  <div className="grid grid-cols-4 gap-1 my-2.5">
                    {m.weeks.map((w) => {
                      const key = `${w.year}-${w.week}`;
                      const isSelected = selectedKey === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            onSelectCell(key, w);
                            setPinnedData(w);
                          }}
                          className={`h-6 rounded-md transition-transform hover:scale-105 cursor-pointer ${getCellColor(
                            w
                          )} ${isSelected ? 'ring-2 ring-[#1d1d1f] dark:ring-white' : ''}`}
                          title={`${t.weekLabel} ${w.week}: ${t.baiScore} ${w.burningActivityIndex}`}
                        />
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-[#6e6e73] dark:text-[#9ca3af] space-y-0.5 pt-2 border-t border-[#e5e5e7] dark:border-[#1f2937]">
                    <div className="flex justify-between">
                      <span>{language === 'id' ? 'Daya Panas (FRP):' : 'Thermal (FRP):'}</span>
                      <strong className="text-[#1d1d1f] dark:text-white num">{m.totalFRP} MW</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'id' ? 'Klaster Gambut:' : 'Peat Clusters:'}</span>
                      <strong className="text-[#1d1d1f] dark:text-white num">{m.harmonizedCount}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Detail Inspector Bottom Card */}
      <div className="p-4 sm:p-5 bg-[#f5f5f7] dark:bg-[#0f172a] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
        {activeInspection ? (
          <>
            <div className="space-y-1.5">
              <div className="font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-white flex flex-wrap items-center gap-2">
                <span>
                  {t.year} {activeInspection.year}, {language === 'id' ? 'Minggu ke-' : 'Week '} {activeInspection.week} ({MONTHS[activeInspection.month - 1]})
                </span>
                {activeInspection.isUnusualCondition && (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-md">
                    {language === 'id' ? `Lonjakan Anomali (+${activeInspection.zScore.toFixed(1)}σ)` : `Anomaly Spike (+${activeInspection.zScore.toFixed(1)}σ)`}
                  </span>
                )}
                {activeInspection.isCriticalPeriod && !activeInspection.isUnusualCondition && (
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                    {language === 'id' ? 'Periode Rawan Kering' : 'Critical Dry Window'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#6e6e73] dark:text-[#9ca3af] text-xs">
                <span>{language === 'id' ? 'Indeks Harmonisasi:' : 'Harmonized Index:'} <strong className="text-[#1d1d1f] dark:text-white num text-sm">{activeInspection.burningActivityIndex} / 100</strong></span>
                <span>&bull;</span>
                <span>{language === 'id' ? 'Daya Panas Termal:' : 'Thermal FRP:'} <strong className="text-[#1d1d1f] dark:text-white num text-sm">{activeInspection.totalFrpCalibrated} MW</strong></span>
                <span>&bull;</span>
                <span>{language === 'id' ? 'Klaster 5.5 km:' : '5.5 km Clusters:'} <strong className="text-[#1d1d1f] dark:text-white num text-sm">{activeInspection.harmonizedClusterCount}</strong></span>
              </div>
            </div>

            {/* Sensor Breakdown Pills */}
            <div className="flex items-center gap-3 text-[#86868b] dark:text-[#9ca3af] lg:border-l lg:border-[#e5e5e7] dark:lg:border-[#1f2937] lg:pl-5 shrink-0">
              <div className="bg-white dark:bg-[#1f2937] p-2 rounded-xl border border-[#e5e5e7] dark:border-[#374151] text-center min-w-[70px]">
                <span className="text-[10px] block text-[#86868b] dark:text-[#9ca3af]">MODIS (1km)</span>
                <span className="font-bold text-[#1d1d1f] dark:text-white num text-xs sm:text-sm">{activeInspection.rawModisCount}</span>
              </div>
              <div className="bg-white dark:bg-[#1f2937] p-2 rounded-xl border border-[#e5e5e7] dark:border-[#374151] text-center min-w-[70px]">
                <span className="text-[10px] block text-[#86868b] dark:text-[#9ca3af]">VIIRS (375m)</span>
                <span className="font-bold text-[#1d1d1f] dark:text-white num text-xs sm:text-sm">{activeInspection.rawViirsCount}</span>
              </div>
              <div className="bg-white dark:bg-[#1f2937] p-2 rounded-xl border border-[#e5e5e7] dark:border-[#374151] text-center min-w-[70px]">
                <span className="text-[10px] block text-[#86868b] dark:text-[#9ca3af]">{language === 'id' ? 'Total Deteksi' : 'Total Raw'}</span>
                <span className="font-bold text-[#1d1d1f] dark:text-white num text-xs sm:text-sm">{activeInspection.rawTotalCount}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-[#86868b] dark:text-[#9ca3af] text-xs py-1">
            <Info className="w-4 h-4 text-[#0071e3] dark:text-blue-400 shrink-0" />
            <span>{t.selectPrompt}</span>
          </div>
        )}
      </div>

      {/* Heat Scale Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-[#86868b] dark:text-[#9ca3af]">
        <span className="font-medium text-[#1d1d1f] dark:text-white">
          {language === 'id' ? 'Skala Intensitas Kebakaran & Emisi:' : 'Fire & Emission Intensity Scale:'}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-[2px] bg-[#f2f2f7] dark:bg-[#1e293b] border border-[#e5e5ea] dark:border-[#334155]" />
            <span>{t.zero} (0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-[2px] bg-[#fef08a] dark:bg-[#ca8a04]/70 border border-[#fde047] dark:border-[#ca8a04]" />
            <span>{t.low} (1–15)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-[2px] bg-[#fed7aa] dark:bg-[#f97316]/80 border border-[#fdba74] dark:border-[#ea580c]" />
            <span>{t.moderate} (15–35)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-[2px] bg-[#fb923c] dark:bg-[#ea580c] border border-[#f97316] dark:border-[#c2410c]" />
            <span>{t.high} (35–65)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-[2px] bg-[#dc2626] dark:bg-[#dc2626] border border-[#b91c1c]" />
            <span>{t.severe} (&gt;65)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
