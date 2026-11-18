import React from 'react';
import { SensorStation } from '../types/disaster';
import { Activity, Waves, Droplet, Mountain, Flame, CloudRain, Sliders } from 'lucide-react';

interface TelemetryCardProps {
  station: SensorStation;
  onAdjustValue: (stationId: string, newValue: number) => void;
  onOpenSensorDetail: (station: SensorStation) => void;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  station,
  onAdjustValue,
  onOpenSensorDetail,
}) => {
  // Determine severity tier
  let statusTier: 'NORMAL' | 'WASPADA' | 'SIAGA' | 'AWAS' = 'NORMAL';
  let tierColor = 'text-emerald-400';
  let borderColor = 'border-slate-800';
  let badgeGlyph = '● Nominal';

  if (station.value >= station.thresholdAwas) {
    statusTier = 'AWAS';
    tierColor = 'text-rose-400';
    borderColor = 'border-rose-900/60 bg-rose-950/20';
    badgeGlyph = '✖ Kritis / Awas';
  } else if (station.value >= station.thresholdSiaga) {
    statusTier = 'SIAGA';
    tierColor = 'text-orange-400';
    borderColor = 'border-orange-900/60 bg-orange-950/20';
    badgeGlyph = '▲ Siaga';
  } else if (station.value >= station.thresholdWaspada) {
    statusTier = 'WASPADA';
    tierColor = 'text-amber-400';
    borderColor = 'border-amber-900/50 bg-amber-950/10';
    badgeGlyph = '▲ Waspada';
  }

  // Get matching icon
  const getIcon = () => {
    switch (station.type) {
      case 'seismic':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'ocean_dart':
        return <Waves className="w-4 h-4 text-blue-400" />;
      case 'hydrological':
        return <Droplet className="w-4 h-4 text-sky-400" />;
      case 'inclinometer':
        return <Mountain className="w-4 h-4 text-amber-400" />;
      case 'volcanic_so2':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'weather':
        return <CloudRain className="w-4 h-4 text-indigo-400" />;
      default:
        return <Activity className="w-4 h-4 text-cyan-400" />;
    }
  };

  // SVG Sparkline calculation
  const history = station.history || [station.baseline, station.value];
  const minVal = Math.min(0, ...history);
  const maxVal = Math.max(station.thresholdAwas * 1.1, ...history, 1);
  const width = 180;
  const height = 40;

  const points = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1 || 1)) * width;
      const normalizedY = 1 - (val - minVal) / (maxVal - minVal || 1);
      const y = Math.max(4, Math.min(height - 4, normalizedY * height));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Calculate percentage toward Awas threshold
  const thresholdPercent = Math.min(100, Math.round((station.value / station.thresholdAwas) * 100));

  return (
    <div
      className={`p-4 rounded-xl border ${borderColor} bg-slate-900/60 backdrop-blur-sm transition-all hover:border-slate-700 flex flex-col justify-between`}
    >
      <div>
        {/* Header & Metadata (No pills, clean unboxed typographic metadata) */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-slate-800/80 border border-slate-700/60">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
                {station.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>{station.id}</span>
                <span aria-hidden="true">·</span>
                <span>{station.location.region}</span>
              </div>
            </div>
          </div>

          <span className={`text-xs font-mono font-medium ${tierColor}`}>
            {badgeGlyph}
          </span>
        </div>

        {/* Telemetry Metric Display */}
        <div className="mt-3">
          <div className="flex items-baseline">
            <span className="text-3xl font-mono font-bold tracking-tight text-white tabular-nums">
              {station.value.toFixed(2)}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400 ml-2">
              {station.unit}
            </span>
          </div>

          {/* If station is seismic accelerometer, display converted instant Magnitude equivalent */}
          {station.type === 'seismic' && (
            <div className="mt-1.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Estimasi Magnitudo Sesaat:</span>
              <span className={`font-bold ${
                station.value >= 160 ? 'text-rose-400' : station.value >= 85 ? 'text-orange-400' : station.value >= 30 ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                M {Math.max(2.1, (Math.log10(Math.max(1, station.value)) * 2.2 + 2.0)).toFixed(1)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mt-1">
            <span>Baseline: {station.baseline} {station.unit}</span>
            <span>Awas: {station.thresholdAwas} {station.unit}</span>
          </div>
        </div>

        {/* Real-time SVG waveform */}
        <div className="mt-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
            <span>Tren Gelombang Real-Time</span>
            <span>{station.trend === 'rising' ? '▲ Meningkat' : station.trend === 'falling' ? '▼ Menurun' : '▬ Stabil'}</span>
          </div>
          <svg className="w-full h-10 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            <polyline
              fill="none"
              stroke={statusTier === 'AWAS' ? '#f43f5e' : statusTier === 'SIAGA' ? '#fb923c' : statusTier === 'WASPADA' ? '#fbbf24' : '#06b6d4'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>

        {/* Progress bar towards Awas */}
        <div className="mt-2">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                statusTier === 'AWAS'
                  ? 'bg-rose-500'
                  : statusTier === 'SIAGA'
                  ? 'bg-orange-500'
                  : statusTier === 'WASPADA'
                  ? 'bg-amber-400'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${thresholdPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Manual interactive scrubber / detail trigger */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <Sliders className="w-3 h-3 text-slate-500" />
          <span>Atur Nilai:</span>
        </label>
        <input
          type="range"
          min="0"
          max={station.thresholdAwas * 1.5}
          step="0.05"
          value={station.value}
          onChange={(e) => onAdjustValue(station.id, parseFloat(e.target.value))}
          className="w-28 accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          title={`Geser untuk menyimulasikan lonjakan sensor ${station.name}`}
        />
        <button
          onClick={() => onOpenSensorDetail(station)}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
        >
          Detail
        </button>
      </div>
    </div>
  );
};
