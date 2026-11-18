import React from 'react';
import { Volume2, VolumeX, Bell } from 'lucide-react';

interface HeaderProps {
  activeTab: 'telemetry' | 'map' | 'simulation' | 'broadcast' | 'architecture';
  setActiveTab: (tab: 'telemetry' | 'map' | 'simulation' | 'broadcast' | 'architecture') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerQuickSim: () => void;
  alertLevel: 'NORMAL' | 'WASPADA' | 'SIAGA' | 'AWAS';
  hasNotificationPermission: boolean;
  onRequestNotificationPermission: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  onToggleMute,
  onTriggerQuickSim,
  alertLevel,
  hasNotificationPermission,
  onRequestNotificationPermission,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('telemetry');
            }}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap"
          >
            GeoVigil Nusantara
          </a>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            Early Warning & Push Broadcast
          </span>
        </div>

        {/* Zone 2: 4-5 Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'telemetry' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Telemetri Sensor
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'map' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Peta Bahaya GIS
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'simulation' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Simulasi Krisis
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'broadcast' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Pusat Notifikasi Push
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'architecture' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Arsitektur PGTC
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          {!hasNotificationPermission && (
            <button
              onClick={onRequestNotificationPermission}
              title="Aktifkan Web Push Notification di browser Anda"
              className="p-2 text-slate-400 hover:text-amber-400 transition-colors border border-slate-800 rounded-lg bg-slate-900/60"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Nyalakan Sirene Audio' : 'Senyapkan Sirene Audio'}
            className={`p-2 transition-colors border border-slate-800 rounded-lg bg-slate-900/60 ${
              isMuted ? 'text-slate-500' : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onTriggerQuickSim}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm ${
              alertLevel === 'AWAS'
                ? 'bg-rose-600 text-white hover:bg-rose-500 ring-2 ring-rose-500/50'
                : 'bg-cyan-600 text-slate-950 hover:bg-cyan-500 font-bold'
            }`}
          >
            {alertLevel === 'AWAS' ? 'Status: AWAS (Simulasi Aktif)' : 'Simulasi Uji Krisis'}
          </button>
        </div>
      </div>
    </header>
  );
};
