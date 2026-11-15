import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { AOIRegion, RawHotspot } from '../engine/harmonizer';
import { Language } from '../data/translations';
import { LiveWeatherData } from '../services/weatherApi';
import { Thermometer, CloudRain, Flame, Droplets, Satellite, TrendingUp } from 'lucide-react';

interface MitigationChartsProps {
  language: Language;
  selectedAOI: AOIRegion;
  liveWeather: LiveWeatherData | null;
  liveHotspots: RawHotspot[];
  currentTmat: number;
  effectiveTmat: number;
  isPrintMode?: boolean;
}

export const MitigationCharts: React.FC<MitigationChartsProps> = ({
  language,
  selectedAOI,
  liveWeather,
  liveHotspots,
  currentTmat,
  effectiveTmat,
  isPrintMode = false,
}) => {
  // 1. Prepare 14-day prognosis multi-series data
  const forecastData = (liveWeather?.dailyForecast || []).map((d) => {
    const dayLabel = new Date(d.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      month: 'numeric',
      day: 'numeric',
    });
    return {
      date: dayLabel,
      fullDate: d.date,
      temp: d.tempMax,
      rain: d.precipitationSum,
      fwi: d.fwiScore,
      wind: d.windSpeedMax,
    };
  });

  // 2. Peat Hydrology Comparison Data
  const hydrologyData = [
    {
      name: language === 'id' ? 'Kondisi Alami (Hutan)' : 'Natural Forest',
      tmag: -15,
      limit: -40,
      fill: '#10b981',
    },
    {
      name: language === 'id' ? 'Kondisi Saat Ini' : 'Current Baseline',
      tmag: currentTmat,
      limit: -40,
      fill: currentTmat <= -40 ? '#ef4444' : '#f59e0b',
    },
    {
      name: language === 'id' ? 'Pasca Sekat Kanal' : 'With Canal Blocks',
      tmag: effectiveTmat,
      limit: -40,
      fill: effectiveTmat > -40 ? '#059669' : '#f97316',
    },
  ];

  // 3. Sensor distribution breakdown
  const modisSpots = liveHotspots.filter((h) => h.instrument === 'MODIS');
  const viirsSpots = liveHotspots.filter((h) => h.instrument === 'VIIRS');
  const totalModisFrp = Math.round(modisSpots.reduce((s, h) => s + h.frp, 0));
  const totalViirsFrp = Math.round(viirsSpots.reduce((s, h) => s + h.frp, 0));

  const sensorPieData = [
    {
      name: `MODIS Terra/Aqua (${modisSpots.length} pts)`,
      value: modisSpots.length || 1,
      frp: totalModisFrp,
      color: '#3b82f6',
    },
    {
      name: `VIIRS SNPP/NOAA (${viirsSpots.length} pts)`,
      value: viirsSpots.length || 1,
      frp: totalViirsFrp,
      color: '#f97316',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Chart 1: 14-Day Fire Weather Index & Climate Trajectory */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#e5e5e7] dark:border-[#1f2937]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#86868b] dark:text-[#9ca3af] uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              <span>{language === 'id' ? 'Grafik Dinamika Prognosis 14 Hari' : '14-Day Dynamic Risk Prognosis Trajectory'}</span>
            </div>
            <h3 className="font-bold text-sm text-[#1d1d1f] dark:text-white mt-0.5">
              {language === 'id'
                ? `Korelasi Suhu Maksimum (°C), Curah Hujan (mm), dan Indeks Bahaya FWI di ${selectedAOI.name}`
                : `Correlation of Max Temp (°C), Rainfall (mm), and Peat FWI Risk in ${selectedAOI.name}`}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-[#ef4444] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>FWI Risk (0-100)</span>
            </span>
            <span className="flex items-center gap-1 text-[#3b82f6] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Rain (mm)</span>
            </span>
            <span className="flex items-center gap-1 text-[#f59e0b] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Temp (°C)</span>
            </span>
          </div>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fwiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#88888860" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#88888860" domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#88888860" domain={[0, 45]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <ReferenceLine
                yAxisId="left"
                y={50}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{
                  value: language === 'id' ? 'Ambang Siaga (FWI 50)' : 'Alert Threshold (FWI 50)',
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="fwi"
                name={language === 'id' ? 'Indeks Bahaya Api (FWI)' : 'Fire Weather Index (FWI)'}
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#fwiGrad)"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="rain"
                name={language === 'id' ? 'Curah Hujan (mm)' : 'Rainfall (mm)'}
                stroke="#3b82f6"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#rainGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temp"
                name={language === 'id' ? 'Suhu Maksimum (°C)' : 'Max Temperature (°C)'}
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Hydrology Depth vs Satellite Sensor Energy */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Chart 2: Peat Groundwater Hydrology Profile (7 cols) */}
        <div className="md:col-span-7 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] shadow-xs space-y-3">
          <div className="pb-2 border-b border-[#e5e5e7] dark:border-[#1f2937]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#86868b] dark:text-[#9ca3af] uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'id' ? 'Profil Muka Air Tanah Gambut (TMAT)' : 'Groundwater Hydrological Table (TMAT)'}</span>
            </div>
            <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-white mt-0.5">
              {language === 'id' ? 'Evaluasi Batas Kritis PP 57/2016 (-40 cm)' : 'PP 57/2016 Statutory Limit Evaluation (-40 cm)'}
            </h4>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hydrologyData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                <XAxis type="number" domain={[-80, 0]} tick={{ fontSize: 11 }} stroke="#88888860" unit=" cm" />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#888888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val} cm`, language === 'id' ? 'Tinggi Muka Air' : 'Groundwater Table']}
                />
                <ReferenceLine
                  x={-40}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: language === 'id' ? 'Batas BRGM -40cm' : 'BRGM Threshold -40cm',
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'top',
                  }}
                />
                <Bar
                  dataKey="tmag"
                  name={language === 'id' ? 'Tinggi Muka Air (cm)' : 'Water Table (cm)'}
                  radius={[0, 8, 8, 0]}
                >
                  {hydrologyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-[#6e6e73] dark:text-[#9ca3af] leading-relaxed">
            {language === 'id'
              ? `Pembangunan sekat kanal meningkatkan elevasi air tanah sebesar ${Math.abs(effectiveTmat - currentTmat)} cm, mengembalikan kubah gambut ke batas hidrologis aman.`
              : `Canal blocking raises local water table by ${Math.abs(effectiveTmat - currentTmat)} cm, restoring peat dome above critical fire ignition threshold.`}
          </p>
        </div>

        {/* Chart 3: Satellite Instrument Spectrum Breakdown (5 cols) */}
        <div className="md:col-span-5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#e5e5e7] dark:border-[#1f2937] shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="pb-2 border-b border-[#e5e5e7] dark:border-[#1f2937]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#86868b] dark:text-[#9ca3af] uppercase tracking-wider">
                <Satellite className="w-3.5 h-3.5 text-cyan-500" />
                <span>{language === 'id' ? 'Komposisi Deteksi Sensor Satelit' : 'Satellite Sensor Distribution'}</span>
              </div>
              <h4 className="font-bold text-sm text-[#1d1d1f] dark:text-white mt-0.5">
                MODIS (1km) vs VIIRS (375m)
              </h4>
            </div>

            <div className="w-full h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sensorPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sensorPieData.map((entry, index) => (
                      <Cell key={`cell-pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-[#e5e5e7] dark:border-[#1f2937] grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-[#f8fafc] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937]">
              <span className="text-[10px] text-[#3b82f6] font-bold block">MODIS Terra/Aqua</span>
              <strong className="text-sm font-bold text-[#1d1d1f] dark:text-white num">{modisSpots.length} pts</strong>
              <span className="text-[9px] text-[#86868b] block">{totalModisFrp} MW</span>
            </div>

            <div className="p-2 rounded-xl bg-[#f8fafc] dark:bg-[#151d2f] border border-[#e5e5e7] dark:border-[#1f2937]">
              <span className="text-[10px] text-[#f97316] font-bold block">VIIRS SNPP/NOAA</span>
              <strong className="text-sm font-bold text-[#1d1d1f] dark:text-white num">{viirsSpots.length} pts</strong>
              <span className="text-[9px] text-[#86868b] block">{totalViirsFrp} MW</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
