import React from 'react';
import { DisasterScenario, SensorStation } from '../types/disaster';
import { CRISIS_SCENARIOS } from '../data/mockSensors';
import { Zap, Play, Pause, RefreshCw, Cpu, Flame, AlertTriangle } from 'lucide-react';

interface SimulationSandboxProps {
  scenarios: DisasterScenario[];
  activeScenarioId: string;
  onSelectScenario: (scenario: DisasterScenario) => void;
  stations: SensorStation[];
  onUpdateStationValue: (id: string, val: number) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  streamSpeed: number;
  onChangeStreamSpeed: (speed: number) => void;
  onRunAiAnalysis: () => void;
  isAnalyzing: boolean;
  ruleTriggered: boolean;
}

export const SimulationSandbox: React.FC<SimulationSandboxProps> = ({
  scenarios = CRISIS_SCENARIOS,
  activeScenarioId,
  onSelectScenario,
  stations,
  onUpdateStationValue,
  isStreaming,
  onToggleStreaming,
  streamSpeed,
  onChangeStreamSpeed,
  onRunAiAnalysis,
  isAnalyzing,
  ruleTriggered,
}) => {
  return (
    <div className="space-y-6">
      {/* Scenario Presets Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Skenario Uji Bencana & Injeksi Telemetri Sensor</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih profil krisis untuk memicu anomali sensor simultan, menguji algoritma deteksi cepat, dan mengevaluasi AI Gemini.
            </p>
          </div>

          {/* Streaming Ingestion Controls */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg p-1.5 self-start md:self-auto">
            <button
              onClick={onToggleStreaming}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                isStreaming
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Stream Aktif</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Mulai Stream</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
              <span className="text-[11px] text-slate-500 ml-1">Speed:</span>
              {[1, 2, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeStreamSpeed(s)}
                  className={`px-2 py-0.5 rounded text-xs ${
                    streamSpeed === s
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((scen) => {
            const isSelected = activeScenarioId === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => onSelectScenario(scen)}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/40 shadow-lg'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[11px] font-mono font-semibold ${
                        scen.severity === 'AWAS'
                          ? 'text-rose-400'
                          : scen.severity === 'NORMAL'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {scen.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ETA: {scen.expectedLeadTimeSeconds > 0 ? `${scen.expectedLeadTimeSeconds}s` : 'Aman'}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
                    {scen.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {scen.description}
                  </p>
                </div>

                {/* Magnitude Readout if applicable */}
                {scen.currentMagnitude && (
                  <div className="mt-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <span className="text-[10px] text-slate-400">Aktif:</span>
                      <span className="font-bold">M {scen.currentMagnitude.toFixed(1)}</span>
                    </div>
                    {scen.predictedMagnitude && (
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <span className="text-[10px] text-slate-400">Prediksi AI:</span>
                        <span className="font-bold">M {scen.predictedMagnitude.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
                  {scen.affectedRegion}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Fine-grained Sensor Sliders & Algorithmic Trip Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Kontrol Injeksi Telemetri Lapangan (Fine-Tune Parametrik)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sesuaikan nilai bacaan tiap stasiun sensor untuk memverifikasi respon real-time sistem peringatan.
            </p>
          </div>

          {/* Trigger AI Button */}
          <button
            onClick={onRunAiAnalysis}
            disabled={isAnalyzing}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
              ruleTriggered
                ? 'bg-rose-600 text-white hover:bg-rose-500 animate-pulse'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menganalisis Sensor via Gemini 3.8 Flash...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Jalankan Analisis AI & Kirim Peringatan</span>
              </>
            )}
          </button>
        </div>

        {/* Algorithmic Trip Warning Banner */}
        {ruleTriggered && (
          <div className="mb-4 p-3 rounded-lg border border-rose-500/40 bg-rose-950/30 flex items-center gap-3 text-xs font-mono text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">TRIP ALGORITMA CEPAT TERDETEKSI:</span> Satu atau lebih parameter telemetri melampaui ambang batas ISO-22320. Menjalankan verifikasi korelasi AI...
            </div>
          </div>
        )}

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((st) => {
            const isCritical = st.value >= st.thresholdAwas;
            const isWarning = st.value >= st.thresholdSiaga;
            const maxVal = Math.max(st.thresholdAwas * 1.5, st.value, 10);

            return (
              <div
                key={st.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white line-clamp-1">
                    {st.name}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      isCritical
                        ? 'text-rose-400'
                        : isWarning
                        ? 'text-orange-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {st.value.toFixed(2)} {st.unit}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={maxVal}
                  step="0.05"
                  value={st.value}
                  onChange={(e) => onUpdateStationValue(st.id, parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg mt-1"
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2">
                  <span>Normal: {st.baseline}</span>
                  <span>Siaga: {st.thresholdSiaga}</span>
                  <span>Awas: {st.thresholdAwas}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
