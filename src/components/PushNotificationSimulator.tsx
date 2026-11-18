import React, { useState } from 'react';
import { PushNotificationPayload, BroadcastLogItem } from '../types/disaster';
import {
  Smartphone,
  Bell,
  Radio,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCheck,
  Share2,
  Volume2,
} from 'lucide-react';

interface PushNotificationSimulatorProps {
  notification: PushNotificationPayload | null;
  logs: BroadcastLogItem[];
  onTriggerRealBrowserPush: () => void;
  permissionStatus: NotificationPermission;
  onRequestPermission: () => void;
}

export const PushNotificationSimulator: React.FC<PushNotificationSimulatorProps> = ({
  notification,
  logs,
  onTriggerRealBrowserPush,
  permissionStatus,
  onRequestPermission,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const fallbackPayload: PushNotificationPayload = {
    title: 'PERINGATAN DINI BENCANA ALAM (AWAS)',
    body: 'Anomali terdeteksi pada sensor telemetri. Segera jauhi zona bahaya dan ikuti arahan evakuasi.',
    urgencyBadge: 'CRITICAL',
    soundAlertRequired: true,
    receivedAt: 'Baru saja',
  };

  const activeNotification = notification || fallbackPayload;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Simulated Mobile Smartphone Lockscreen */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <div className="text-center mb-3">
          <div className="text-xs font-mono uppercase text-slate-400">
            Simulasi Layar Kunci Ponsel Warga (Lockscreen Push)
          </div>
          <div className="text-sm font-semibold text-white">
            Penerimaan Notifikasi Push Instan
          </div>
        </div>

        {/* Smartphone Mockup */}
        <div className="w-[310px] h-[580px] bg-slate-900 border-4 border-slate-700 rounded-[44px] p-3 shadow-2xl relative flex flex-col justify-between overflow-hidden">
          {/* Dynamic Island / Speaker Notch */}
          <div className="w-24 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-center gap-1.5 z-20">
            <span className="w-2 h-2 rounded-full bg-slate-800"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-900"></span>
          </div>

          {/* Lockscreen Wallpaper / Content Area */}
          <div className="flex-1 flex flex-col justify-start pt-4 px-2 space-y-4">
            {/* Clock */}
            <div className="text-center text-slate-100">
              <div className="text-4xl font-light tracking-tight font-mono">14:28</div>
              <div className="text-xs text-slate-400 mt-0.5">Rabu, 28 Oktober 2026</div>
            </div>

            {/* Inbound Push Notification Banner */}
            <div
              className={`rounded-2xl p-3.5 shadow-2xl transition-all duration-300 border ${
                activeNotification.urgencyBadge === 'CRITICAL'
                  ? 'bg-rose-950/95 border-rose-500/80 text-rose-100 ring-2 ring-rose-500/40 animate-pulse'
                  : 'bg-slate-800/95 border-slate-600 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded bg-rose-600 text-white">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold tracking-tight uppercase">
                    PERINGATAN DARURAT
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeNotification.receivedAt || 'Baru saja'}
                </span>
              </div>

              <div className="text-xs font-bold text-white leading-snug mb-1">
                {activeNotification.title}
              </div>

              <p className="text-[11px] text-slate-200 leading-relaxed">
                {activeNotification.body}
              </p>

              {/* Action buttons on notification */}
              <div className="mt-3 pt-2 border-t border-rose-800/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => setAcknowledged(true)}
                  className="flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  {acknowledged ? 'Sudah Dikonfirmasi ✓' : 'Konfirmasi Bahaya'}
                </button>
                <button
                  onClick={() => alert('Membuka rute evakuasi terdekat di Google Maps / GIS.')}
                  className="px-2.5 py-1.5 text-[10px] font-medium rounded-lg bg-black/40 text-slate-300 hover:text-white"
                >
                  Peta Evakuasi
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-28 h-1 bg-slate-500 rounded-full mx-auto my-1"></div>
        </div>
      </div>

      {/* Right Column: Multi-Channel Broadcast Center & Dispatch Log */}
      <div className="lg:col-span-7 space-y-6">
        {/* Real Browser Push Trigger Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>Kanal Push Notification Perangkat Pengguna</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Menggunakan Web Push Notification API untuk mengirim peringatan darurat ke desktop & mobile browser.
              </p>
            </div>

            {permissionStatus !== 'granted' ? (
              <button
                onClick={onRequestPermission}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                Izinkan Notifikasi Browser
              </button>
            ) : (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCheck className="w-4 h-4" />
                <span>Izin Notifikasi Aktif</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onTriggerRealBrowserPush}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Push Notification Nyata ke Browser Ini</span>
            </button>
            <span className="text-xs font-mono text-slate-400">
              Latency Dispatch: &lt; 85ms
            </span>
          </div>
        </div>

        {/* Multi-Channel Distribution Matrix */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-rose-400" />
            <span>Matriks Siaran Multi-Kanal (Omnichannel Early Warning)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Web & Mobile Push</div>
                <div className="text-[11px] font-mono text-slate-400">1,842,000 Warga Terhubung</div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-950/80 text-rose-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">GSM Cell Broadcast (3GPP)</div>
                <div className="text-[11px] font-mono text-slate-400">Semua BTS Sektor Bahaya</div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">WhatsApp & SMS Gateway</div>
                <div className="text-[11px] font-mono text-slate-400">Gugus Tugas & RT/RW Setempat</div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Menara Sirene Lapangan</div>
                <div className="text-[11px] font-mono text-slate-400">14 Titik Sirene Suara Nyaring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch Log Table with Tabular Figures */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Log Siaran Peringatan Terakhir
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Audit Trail ISO-22320
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="pb-2">Waktu</th>
                  <th className="pb-2">Peringatan</th>
                  <th className="pb-2">Level</th>
                  <th className="pb-2">Lead Time</th>
                  <th className="pb-2">Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 tabular-nums text-slate-400">{log.timestamp}</td>
                    <td className="py-2.5 font-medium text-white">{log.title}</td>
                    <td className="py-2.5">
                      <span
                        className={
                          log.severity === 'AWAS'
                            ? 'text-rose-400 font-bold'
                            : log.severity === 'SIAGA'
                            ? 'text-orange-400'
                            : 'text-amber-400'
                        }
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-2.5 tabular-nums">{log.leadTimeSeconds}s</td>
                    <td className="py-2.5 tabular-nums text-slate-400">
                      {log.deliveredRecipients.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
