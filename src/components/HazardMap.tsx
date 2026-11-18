import React, { useState } from 'react';
import { SensorStation, AlertSeverity } from '../types/disaster';
import { Shield, Eye, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface HazardMapProps {
  stations: SensorStation[];
  alertLevel: AlertSeverity;
  leadTimeSeconds: number;
  onSelectStation: (station: SensorStation) => void;
  selectedStationId?: string;
  epicenterActive?: boolean;
}

export const HazardMap: React.FC<HazardMapProps> = ({
  stations,
  alertLevel,
  leadTimeSeconds,
  onSelectStation,
  selectedStationId,
  epicenterActive = false,
}) => {
  const [showFaults, setShowFaults] = useState(true);
  const [showWaves, setShowWaves] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Conversion: Map coordinates for Indonesia representation (longitude 95°E - 141°E, latitude 6°N - 11°S)
  // ViewBox: 0 0 900 450
  const coordToSvg = (lat: number, lng: number) => {
    const minLng = 95;
    const maxLng = 120; // Focused on Western & Central Indonesia where our stations sit
    const minLat = -10.5;
    const maxLat = 5.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * 820 + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 370 + 40;
    return { x, y };
  };

  // Safe Havens / Evacuation Shelters
  const shelters = [
    { id: 'SH-01', name: 'Shelter Evakuasi Tsunami Anyer High Ground (+35m)', lat: -6.04, lng: 105.9 },
    { id: 'SH-02', name: 'Pusat Evakuasi Bencana Kaliurang (+900m dpl)', lat: -7.6, lng: 110.42 },
    { id: 'SH-03', name: 'Stadion Terbuka Pajajaran Bandung', lat: -6.9, lng: 107.6 },
    { id: 'SH-04', name: 'Shelter Mandiri Bukit Tarusan', lat: -1.2, lng: 100.5 },
  ];

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
      {/* Map Control HUD Bar */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Jaringan Sensor Aktif: {stations.length} Node</span>
            <span aria-hidden="true">·</span>
            <span>Proyeksi: WGS84 Geodesik</span>
          </div>
        </div>

        {/* Layer Toggles & Zoom */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono text-slate-400">
            <button
              onClick={() => setShowFaults(!showFaults)}
              className={`px-2 py-1 rounded transition-colors ${
                showFaults ? 'bg-slate-800 text-rose-300 font-semibold' : 'hover:text-slate-200'
              }`}
            >
              Patahan Sesar
            </button>
            <button
              onClick={() => setShowWaves(!showWaves)}
              className={`px-2 py-1 rounded transition-colors ${
                showWaves ? 'bg-slate-800 text-cyan-300 font-semibold' : 'hover:text-slate-200'
              }`}
            >
              Gelombang & Propagasi
            </button>
            <button
              onClick={() => setShowShelters(!showShelters)}
              className={`px-2 py-1 rounded transition-colors ${
                showShelters ? 'bg-slate-800 text-emerald-300 font-semibold' : 'hover:text-slate-200'
              }`}
            >
              Titik Evakuasi
            </button>
          </div>

          <div className="flex items-center gap-1 border border-slate-800 bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
              className="p-1 text-slate-400 hover:text-white"
              title="Perbesar Peta"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
              className="p-1 text-slate-400 hover:text-white"
              title="Perkecil Peta"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-400 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Interactive Map Stage */}
      <div className="relative w-full h-[480px] bg-[#070b14] overflow-hidden">
        {/* Subtle coordinate grid lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <svg
          viewBox="0 0 900 450"
          className="w-full h-full select-none"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <defs>
            {/* Tectonic Trench gradient */}
            <linearGradient id="trenchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
            </linearGradient>

            {/* Inundation Pattern */}
            <pattern id="floodHazard" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#0284c7" strokeWidth="2" strokeOpacity="0.3" />
            </pattern>
          </defs>

          {/* Oceanic Basins */}
          <rect x="0" y="0" width="900" height="450" fill="#070c18" />

          {/* Stylized Indonesian Landmass Outline (Sumatra, Java, Bali, Kalimantan South, Sunda Strait) */}
          <g fill="#131b2e" stroke="#1e293b" strokeWidth="1.2">
            {/* Sumatra */}
            <path d="M 60 70 L 120 110 L 190 190 L 260 270 L 290 310 L 280 325 L 250 310 L 180 230 L 110 140 L 50 85 Z" />
            {/* Java Island */}
            <path d="M 310 328 L 360 332 L 440 338 L 520 345 L 600 350 L 640 352 L 638 368 L 580 366 L 490 362 L 400 358 L 330 352 L 305 342 Z" />
            {/* Bali & Lombok */}
            <path d="M 648 355 L 670 356 L 668 368 L 646 366 Z" />
            <path d="M 675 356 L 695 357 L 693 368 L 674 367 Z" />
            {/* South Kalimantan */}
            <path d="M 330 140 L 410 130 L 470 160 L 480 220 L 420 240 L 350 225 L 320 180 Z" />
          </g>

          {/* Major Tectonic Subduction Trench (Sunda Megathrust) */}
          {showFaults && (
            <g>
              <path
                d="M 30 90 Q 150 220 260 330 T 450 395 T 670 410"
                fill="none"
                stroke="url(#trenchGradient)"
                strokeWidth="2.5"
                strokeDasharray="6 3"
              />
              <text x="70" y="240" fill="#f87171" fontSize="10" fontFamily="JetBrains Mono" opacity="0.7">
                PALUNG SUNDA (SUNDA MEGATHRUST TRENCH)
              </text>

              {/* Sesar Semangko (Sumatra Fault) */}
              <path
                d="M 90 95 L 265 295"
                fill="none"
                stroke="#fb923c"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                opacity="0.6"
              />

              {/* Sesar Lembang (Bandung Fault) */}
              <path
                d="M 375 344 L 415 348"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
              />
              <text x="375" y="340" fill="#fda4af" fontSize="9" fontFamily="JetBrains Mono">
                Sesar Lembang
              </text>
            </g>
          )}

          {/* Dynamic Expanding Wave Fronts when Alert is AWAS or Epicenter active */}
          {showWaves && (alertLevel === 'AWAS' || epicenterActive) && (
            <g className="waves-group">
              {/* Earthquake Epicenter Marker & Magnitude Badges */}
              <circle cx="280" cy="335" r="7" fill="#ef4444" />
              <circle cx="280" cy="335" r="14" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8">
                <animate attributeName="r" values="7;70" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="280" cy="335" r="14" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="r" values="7;130" dur="3.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="3.8s" repeatCount="indefinite" />
              </circle>

              {/* Tsunami Inundation Warning Zone on Coast */}
              <path
                d="M 280 320 Q 305 325 330 340 L 325 355 Q 300 340 275 335 Z"
                fill="url(#floodHazard)"
                stroke="#0ea5e9"
                strokeWidth="1"
              />

              {/* Epicenter Magnitude Readout Flag */}
              <g transform="translate(295, 305)">
                <rect x="0" y="0" width="165" height="42" rx="6" fill="#090d16" stroke="#f43f5e" strokeWidth="1.5" opacity="0.95" />
                <text x="8" y="16" fill="#fbbf24" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  GEMPA AKTIF: M 7.4
                </text>
                <text x="8" y="32" fill="#f43f5e" fontSize="9.5" fontFamily="JetBrains Mono" fontWeight="bold">
                  PREDIKSI PUNCAK: M 7.8
                </text>
              </g>

              <text x="250" y="380" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                PROPAGASI GELOMBANG T-00:{leadTimeSeconds.toString().padStart(2, '0')}s
              </text>
            </g>
          )}

          {/* Evacuation Shelters & Assembly Safe Zones */}
          {showShelters &&
            shelters.map((shelter) => {
              const pos = coordToSvg(shelter.lat, shelter.lng);
              return (
                <g key={shelter.id} className="cursor-pointer group">
                  <circle cx={pos.x} cy={pos.y} r="5" fill="#10b981" stroke="#064e3b" strokeWidth="1.5" />
                  <title>{shelter.name}</title>
                  <text
                    x={pos.x + 8}
                    y={pos.y + 3}
                    fill="#34d399"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    {shelter.name}
                  </text>
                </g>
              );
            })}

          {/* Active IoT Sensor Station Nodes */}
          {stations.map((st) => {
            const pos = coordToSvg(st.location.lat, st.location.lng);
            const isSelected = selectedStationId === st.id;
            const isAlarm = st.value >= st.thresholdAwas;
            const isWarning = st.value >= st.thresholdSiaga;

            const nodeColor = isAlarm ? '#f43f5e' : isWarning ? '#fb923c' : '#06b6d4';

            return (
              <g
                key={st.id}
                onClick={() => onSelectStation(st)}
                className="cursor-pointer group transition-transform"
              >
                {/* Ping circle for alarms */}
                {(isAlarm || isWarning) && (
                  <circle cx={pos.x} cy={pos.y} r="6" fill="none" stroke={nodeColor} strokeWidth="2">
                    <animate attributeName="r" values="6;22" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Base Node Pin */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? '7' : '5'}
                  fill={nodeColor}
                  stroke="#020617"
                  strokeWidth="2"
                />

                {/* Sensor Label Tag */}
                <text
                  x={pos.x + 8}
                  y={pos.y - 6}
                  fill="#f1f5f9"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                >
                  {st.id}
                </text>
                <text
                  x={pos.x + 8}
                  y={pos.y + 6}
                  fill={isAlarm ? '#f87171' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  className="tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                >
                  {st.value.toFixed(1)} {st.unit.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur text-[11px] font-mono text-slate-400 space-y-1">
          <div className="text-white font-semibold flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Legenda GIS Telemetri</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Sensor Melebihi Ambang Awas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Sensor Nominal / Aman</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Titik Evakuasi Aman (Shelter)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-rose-500"></span>
            <span>Patahan Tectonic Subduksi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
