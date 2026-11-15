import React from 'react';
import { Download } from 'lucide-react';
import { AOIRegion, HarmonizedWeekData } from '../engine/harmonizer';
import { Language, translations } from '../data/translations';

interface CriticalAlertsProps {
  language: Language;
  selectedAOI: AOIRegion;
  calendarMatrix: Record<string, HarmonizedWeekData>;
  weeklyBaselines: Record<number, { mean: number; stdDev: number; isCritical: boolean }>;
}

export const CriticalAlerts: React.FC<CriticalAlertsProps> = ({
  language,
  selectedAOI,
  calendarMatrix,
  weeklyBaselines
}) => {
  const t = translations[language];
  const criticalWeeks = Object.entries(weeklyBaselines)
    .filter(([_, b]) => b.isCritical)
    .map(([w]) => parseInt(w, 10))
    .sort((a, b) => a - b);

  const startWeek = criticalWeeks.length > 0 ? criticalWeeks[0] : 30;
  const endWeek = criticalWeeks.length > 0 ? criticalWeeks[criticalWeeks.length - 1] : 42;

  const anomalies = Object.values(calendarMatrix)
    .filter((d) => d.isUnusualCondition)
    .sort((a, b) => b.zScore - a.zScore)
    .slice(0, 5);

  const handleExportCSV = () => {
    const headers = 'Year,Week,Month,Raw_MODIS,Raw_VIIRS,Raw_Total,Harmonized_Clusters,Calibrated_FRP_MW,Burning_Activity_Index,Z_Score,Is_Critical_Period,Is_Unusual_Spike\n';
    const rows = Object.values(calendarMatrix)
      .map((d) =>
        `${d.year},${d.week},${d.month},${d.rawModisCount},${d.rawViirsCount},${d.rawTotalCount},${d.harmonizedClusterCount},${d.totalFrpCalibrated},${d.burningActivityIndex},${d.zScore},${d.isCriticalPeriod ? 'YES' : 'NO'},${d.isUnusualCondition ? 'YES' : 'NO'}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Wanareksa_${selectedAOI.id}_2000_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e7] dark:border-[#1f2937]">
          <h2 className="font-semibold text-sm text-[#1d1d1f] dark:text-white">
            {t.earlyWarningTitle}
          </h2>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#0071e3] dark:text-blue-400 hover:underline cursor-pointer"
            title="Download full dataset as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>

        {/* Peak season summary in clean neutral card */}
        <div className="mt-3.5 p-3.5 bg-[#f5f5f7] dark:bg-[#1f2937] border border-[#e5e5e7] dark:border-[#374151] rounded-xl">
          <div className="text-xs font-semibold text-[#86868b] dark:text-[#9ca3af] uppercase tracking-wider mb-1">
            {t.annualPeakSeason}
          </div>
          <div className="text-xl font-bold text-[#1d1d1f] dark:text-white num">
            {language === 'id' ? 'Minggu' : 'Weeks'} {startWeek} – {endWeek}{' '}
            <span className="text-xs text-[#86868b] dark:text-[#9ca3af] font-normal">
              ({Math.round(endWeek - startWeek + 1)} {t.weeksDuration})
            </span>
          </div>
          <p className="text-xs text-[#6e6e73] dark:text-[#9ca3af] mt-1.5 leading-relaxed">
            {language === 'id'
              ? <>Data historis 26 tahun membuktikan konsentrasi kebakaran terbesar di <strong className="text-[#1d1d1f] dark:text-white">{selectedAOI.name}</strong> terjadi pada rentang minggu ini.</>
              : <>26-year satellite records confirm that major fire events in <strong className="text-[#1d1d1f] dark:text-white">{selectedAOI.name}</strong> concentrate in this annual dry window.</>}
          </p>
        </div>

        {/* Top anomalies */}
        <div className="mt-4">
          <div className="text-xs font-semibold text-[#1d1d1f] dark:text-white mb-2">
            {t.highestAnomalies}
          </div>
          <div className="space-y-1.5">
            {anomalies.map((anom, idx) => (
              <div
                key={`${anom.year}-${anom.week}`}
                className="flex items-center justify-between p-2 rounded-lg border border-[#e5e5e7] dark:border-[#374151] bg-white dark:bg-[#1f2937] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-[#1d1d1f] dark:bg-white text-white dark:text-[#111827] flex items-center justify-center text-[10px] font-bold shrink-0 num">
                    {idx + 1}
                  </span>
                  <div>
                    <strong className="text-[#1d1d1f] dark:text-white">{t.year} {anom.year}, {language === 'id' ? 'Minggu' : 'Wk'} {anom.week}</strong>
                    <span className="text-[#86868b] dark:text-[#9ca3af] ml-1.5">({anom.dominantSensor})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-red-600 dark:text-red-400 font-semibold num">+{anom.zScore.toFixed(1)}x</span>
                  <span className="text-[#86868b] dark:text-[#6b7280] mx-1.5">·</span>
                  <span className="text-[#1d1d1f] dark:text-white num font-medium">{anom.totalFrpCalibrated} MW</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Directives in clean typography */}
        <div className="mt-4 border-t border-[#e5e5e7] dark:border-[#1f2937] pt-3">
          <div className="font-semibold text-xs text-[#1d1d1f] dark:text-white mb-1.5">
            {t.directivesTitle}
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#6e6e73] dark:text-[#9ca3af]">
            <li>{language === 'id' ? `Mulai patroli lapangan 2 minggu sebelum Minggu ${startWeek}.` : `Deploy field patrols 2 weeks prior to Week ${startWeek}.`}</li>
            <li>{t.directive2}</li>
            <li>{t.directive3}</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-[#e5e5e7] dark:border-[#1f2937] text-[10px] text-[#86868b] dark:text-[#9ca3af] flex items-center justify-between">
        <span>{t.verificationComplete}</span>
        <span className="num">{t.archiveSpan}</span>
      </div>
    </div>
  );
};
