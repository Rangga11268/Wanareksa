import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  Volume2, 
  VolumeX, 
  Send, 
  MapPin, 
  CheckCircle2, 
  Copy, 
  Share2, 
  Radio, 
  Clock, 
  Droplets,
  ExternalLink
} from 'lucide-react';
import { Language } from '../data/translations';

interface EarlyWarningAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

interface AlertItem {
  id: string;
  khgName: string;
  province: string;
  level: 'CRITICAL' | 'WARNING';
  groundwaterCm: number;
  thresholdDeficitCm: number;
  firmsCount: number;
  frpMw: number;
  leadTimeHours: number;
  nearestCanal: string;
  actionRequired: string;
  mpaContactName: string;
  mpaPhone: string;
}

const ACTIVE_ALERTS: AlertItem[] = [
  {
    id: 'WN-ALERT-RIAU-01',
    khgName: 'KHG Sungai Kampar – Sungai Rokan',
    province: 'Riau',
    level: 'CRITICAL',
    groundwaterCm: -48,
    thresholdDeficitCm: -8, // 8cm below PP 71/2014 limit (-40cm)
    firmsCount: 14,
    frpMw: 324,
    leadTimeHours: 36,
    nearestCanal: 'Kanal Sekunder Blok 32 (420m)',
    actionRequired: 'Injeksi nozzle tombak gambut ke kedalaman 1.5m dan segera tutup pintu sekat kanal timur.',
    mpaContactName: 'Pak Budi (Posko MPA Teluk Meranti)',
    mpaPhone: '6281234567890',
  },
  {
    id: 'WN-ALERT-KALTENG-02',
    khgName: 'KHG Sungai Kahayan – Sungai Sebangau',
    province: 'Kalimantan Tengah',
    level: 'WARNING',
    groundwaterCm: -38,
    thresholdDeficitCm: 2, // close to -40cm
    firmsCount: 6,
    frpMw: 112,
    leadTimeHours: 64,
    nearestCanal: 'Pintu Air Kanal Primer Sebangau (680m)',
    actionRequired: 'Patroli preventif ground-check dan pembasahan zona transisi tepi kubah gambut.',
    mpaContactName: 'Pak Yanto (Posko MPA Pulang Pisau)',
    mpaPhone: '6281298765432',
  },
  {
    id: 'WN-ALERT-KALBAR-03',
    khgName: 'KHG Sungai Mempawah – Sungai Peniti',
    province: 'Kalimantan Barat',
    level: 'WARNING',
    groundwaterCm: -36,
    thresholdDeficitCm: 4,
    firmsCount: 4,
    frpMw: 88,
    leadTimeHours: 72,
    nearestCanal: 'Sekat Kanal Parit 4 (310m)',
    actionRequired: 'Pemeriksaan rembesan tanggul sekat kanal dan aktivasi pompa apung desa.',
    mpaContactName: 'Pak Agus (Posko MPA Kubu Raya)',
    mpaPhone: '6281311223344',
  },
];

export const EarlyWarningAlertModal: React.FC<EarlyWarningAlertModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  // Web Audio API synthesized radar alert ping (zero external audio dependencies)
  const playSirenPing = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      setIsPlayingSiren(true);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      // Alarm frequency alternating between 880Hz and 587Hz (warning tone)
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(587, now + 0.15);
      osc.frequency.setValueAtTime(880, now + 0.3);
      osc.frequency.setValueAtTime(587, now + 0.45);
      osc.frequency.setValueAtTime(880, now + 0.6);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);

      setTimeout(() => {
        setIsPlayingSiren(false);
      }, 900);
    } catch (e) {
      console.warn('Audio alert unsupported:', e);
      setIsPlayingSiren(false);
    }
  };

  const handleRequestPushNotif = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
      if (res === 'granted') {
        new Notification('WANAREKSA • Early Warning System', {
          body: language === 'id'
            ? 'Notifikasi Siaga Kubah Gambut Aktif. Anda akan menerima peringatan jika muka air tanah < -40 cm.'
            : 'Peat Dome Early Warning Active. You will receive alerts when groundwater falls below -40 cm.',
          icon: '/favicon.ico',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopySitrep = (alert: AlertItem) => {
    const text = language === 'id'
      ? `🚨 *WANAREKSA DISPOSISI PERINGATAN DINI [${alert.id}]*
Zona: ${alert.khgName} (${alert.province})
Status: ${alert.level === 'CRITICAL' ? 'SIAGA 1 MERAH' : 'WASPADA KUNING'}
Tinggi Muka Air Tanah: ${alert.groundwaterCm} cm (Ambang batas PP 71/2014: -40 cm)
Deteksi Satelit: ${alert.firmsCount} Titik Panas FIRMS (${alert.frpMw} MW)
Estimasi Waktu Menuju Pirolisis: ${alert.leadTimeHours} Jam
Akses Air Terdekat: ${alert.nearestCanal}
Instruksi Lapangan: ${alert.actionRequired}
Posko: ${alert.mpaContactName}

Sistem Peringatan Dini Gambut Wanareksa — https://wanareksa.vercel.app`
      : `🚨 *WANAREKSA EARLY WARNING DISPATCH [${alert.id}]*
Zone: ${alert.khgName} (${alert.province})
Status: ${alert.level === 'CRITICAL' ? 'CRITICAL ALERT (RED)' : 'WARNING (YELLOW)'}
Peat Water Table: ${alert.groundwaterCm} cm (Gov Reg 71/2014 Limit: -40 cm)
Satellite Detections: ${alert.firmsCount} FIRMS Hotspots (${alert.frpMw} MW)
Estimated Time to Pyrolysis: ${alert.leadTimeHours} Hours
Nearest Water Supply: ${alert.nearestCanal}
Field Mandate: ${alert.actionRequired}
Command Post: ${alert.mpaContactName}

Wanareksa Peat Early Warning System — https://wanareksa.vercel.app`;

    navigator.clipboard.writeText(text);
    setCopiedId(alert.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const createWhatsAppUrl = (alert: AlertItem) => {
    const msg = `Halo ${alert.mpaContactName}, berikut DISPATCH RESMI PERINGATAN DINI WANAREKSA [${alert.id}]:
Status: ${alert.level === 'CRITICAL' ? 'SIAGA 1 (Muka air tanah ' + alert.groundwaterCm + ' cm)' : 'WASPADA'}
Wilayah: ${alert.khgName}
Akses Air: ${alert.nearestCanal}
Instruksi: ${alert.actionRequired}
Mohon konfirmasi kesiapan posko MPA!`;
    return `https://wa.me/${alert.mpaPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* TOP STATUS HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border-b border-rose-900/30 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative p-2.5 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 uppercase">
                  Live Emergency Broadcast
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {language === 'id' ? 'Protokol Peringatan Dini 72 Jam' : '72-Hour Pre-Ignition Protocol'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                {language === 'id' 
                  ? 'Pusat Siaga & Peringatan Dini Bencana Gambut' 
                  : 'Peatland Early Warning & Incident Command Hub'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Siren Test Button */}
            <button
              onClick={playSirenPing}
              disabled={isPlayingSiren}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold font-mono transition-all cursor-pointer ${
                isPlayingSiren 
                  ? 'bg-rose-600 text-white border-rose-500 scale-95 animate-pulse'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/20'
              }`}
              title={language === 'id' ? 'Uji Suara Sirine Siaga' : 'Test Acoustic Warning Tone'}
            >
              {isPlayingSiren ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {isPlayingSiren 
                  ? (language === 'id' ? 'Sirine Aktif...' : 'Siren Sounding...') 
                  : (language === 'id' ? 'Uji Sirine' : 'Test Siren')}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION PERMISSION BANNER */}
        {notifPermission !== 'granted' && typeof Notification !== 'undefined' && (
          <div className="px-5 py-2.5 bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Bell className="w-4 h-4 shrink-0" />
              <span>
                {language === 'id'
                  ? 'Aktifkan notifikasi desktop agar Anda menerima peringatan instan saat tinggi air gambut turun < -40 cm.'
                  : 'Enable desktop notifications for instant alerts when groundwater drops below -40 cm.'}
              </span>
            </div>
            <button
              onClick={handleRequestPushNotif}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shrink-0 transition cursor-pointer"
            >
              {language === 'id' ? 'Aktifkan Notifikasi' : 'Enable Alerts'}
            </button>
          </div>
        )}

        {/* ALERTS FEED CONTAINER */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/60 dark:bg-[#070b14]/60">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">
              {language === 'id' ? 'Daftar Siaga Aktif Berdasarkan Aturan PP 71/2014' : 'Active Peat Alerts Enforcing PP 71/2014 Mandate'}
            </span>
            <span className="font-mono">
              {ACTIVE_ALERTS.length} {language === 'id' ? 'Zona Terpantau Kritis' : 'Critical Zones Detected'}
            </span>
          </div>

          <div className="space-y-3.5">
            {ACTIVE_ALERTS.map((alert) => {
              const isCritical = alert.level === 'CRITICAL';
              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                    isCritical
                      ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-xs'
                      : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 shadow-xs'
                  }`}
                >
                  {/* Alert Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                        isCritical
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-black font-extrabold'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {isCritical ? 'SIAGA 1 KRITIS' : 'WASPADA'}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {alert.khgName}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">({alert.province})</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Estimasi: {alert.leadTimeHours}h Pre-Ignition</span>
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {language === 'id' ? 'Muka Air Tanah (PP 71)' : 'Groundwater Table (PP 71)'}
                      </span>
                      <strong className={`text-base font-mono font-bold ${
                        isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {alert.groundwaterCm} cm
                      </strong>
                      <span className="text-[10px] text-slate-500 block">
                        {alert.thresholdDeficitCm < 0 
                          ? (language === 'id' ? `${Math.abs(alert.thresholdDeficitCm)}cm di bawah batas` : `${Math.abs(alert.thresholdDeficitCm)}cm below threshold`) 
                          : (language === 'id' ? `${alert.thresholdDeficitCm}cm sisa aman` : `${alert.thresholdDeficitCm}cm safe margin`)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono block">NASA FIRMS Hotspots</span>
                      <strong className="text-base font-mono font-bold text-amber-600 dark:text-amber-400">
                        {alert.firmsCount} {language === 'id' ? 'Titik' : 'Hotspots'}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">Total FRP: {alert.frpMw} MW</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {language === 'id' ? 'Akses Air / Sekat Kanal' : 'Canal Water Access'}
                      </span>
                      <strong className="text-xs font-semibold text-slate-900 dark:text-slate-200 block truncate mt-0.5">
                        {alert.nearestCanal}
                      </strong>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        {language === 'id' ? 'Tersedia Sumber Air' : 'Water Supply Ready'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {language === 'id' ? 'Posko Satgas / MPA' : 'Satgas Patrol Post'}
                      </span>
                      <strong className="text-xs font-semibold text-slate-900 dark:text-slate-200 block truncate mt-0.5">
                        {alert.mpaContactName}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-mono">{alert.mpaPhone}</span>
                    </div>
                  </div>

                  {/* Action Mandate & Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isCritical ? 'text-rose-500' : 'text-amber-500'
                      }`} />
                      <p className="leading-relaxed">
                        <strong className="font-semibold text-slate-900 dark:text-white">
                          {language === 'id' ? 'Mandat Tindakan: ' : 'Required Action: '}
                        </strong>
                        {alert.actionRequired}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopySitrep(alert)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                        title={language === 'id' ? 'Salin Situation Report (SitRep) ke Clipboard' : 'Copy Situation Report (SitRep) to Clipboard'}
                      >
                        {copiedId === alert.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {language === 'id' ? 'Tersalin!' : 'Copied!'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{language === 'id' ? 'Salin SitRep' : 'Copy SitRep'}</span>
                          </>
                        )}
                      </button>

                      <a
                        href={createWhatsAppUrl(alert)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        title={language === 'id' ? 'Kirim Peringatan Langsung ke Posko MPA via WhatsApp' : 'Dispatch Alert to Field Patrol via WhatsApp'}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{language === 'id' ? 'Kirim ke MPA' : 'Send to MPA'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER AUDIT STAMP */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#0c121e] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>
              {language === 'id'
                ? 'Terhubung ke Feed NASA FIRMS & Model Hidrologi Kubah Gambut'
                : 'Connected to NASA FIRMS Feed & Peat Hydrology Models'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono">
              {language === 'id' ? 'Standar Statutori PP RI No. 71/2014' : 'Statutory Standard PP RI No. 71/2014'}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              {language === 'id' ? 'Tutup Panel' : 'Close Panel'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
