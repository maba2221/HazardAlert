import React, { useState } from 'react';
import { DisasterAssessment } from '../types/disaster';
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  Volume2,
  FileCode,
  CheckCircle,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AiAssessmentPanelProps {
  assessment: DisasterAssessment | null;
  leadTimeRemaining: number;
  onPlaySiren: () => void;
  onPlayVoiceAlert: () => void;
  isPlayingVoice: boolean;
}

export const AiAssessmentPanel: React.FC<AiAssessmentPanelProps> = ({
  assessment,
  leadTimeRemaining,
  onPlaySiren,
  onPlayVoiceAlert,
  isPlayingVoice,
}) => {
  const [showCapXml, setShowCapXml] = useState(false);
  const [copiedCap, setCopiedCap] = useState(false);

  if (!assessment) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">
        <p className="text-sm font-mono">Belum ada evaluasi krisis aktif. Pilih skenario atau jalankan analisis AI.</p>
      </div>
    );
  }

  const isCritical = assessment.alertLevel === 'AWAS';
  const isWatch = assessment.alertLevel === 'SIAGA';
  const isAdvisory = assessment.alertLevel === 'WASPADA';

  const levelColor = isCritical
    ? 'text-rose-400'
    : isWatch
    ? 'text-orange-400'
    : isAdvisory
    ? 'text-amber-400'
    : 'text-emerald-400';

  const badgeBg = isCritical
    ? 'border-rose-500/50 bg-rose-950/40'
    : isWatch
    ? 'border-orange-500/50 bg-orange-950/40'
    : isAdvisory
    ? 'border-amber-500/40 bg-amber-950/30'
    : 'border-emerald-500/40 bg-emerald-950/20';

  const formatTimer = (seconds: number) => {
    if (seconds <= 0) return 'DAMPAK TIBA / EVAKUASI SELESAI';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `T - ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} DETIK`;
  };

  const handleCopyCap = () => {
    navigator.clipboard.writeText(assessment.capXmlPreview);
    setCopiedCap(true);
    setTimeout(() => setCopiedCap(false), 2000);
  };

  return (
    <div className={`rounded-2xl border ${badgeBg} p-5 backdrop-blur-md transition-all shadow-xl space-y-5`}>
      {/* Top Banner: Status & Lead Time Clock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className={`w-5 h-5 ${levelColor}`} />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Evaluasi Risiko AI Gemini & Protokol ISO-22320
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs font-mono text-cyan-400">
              {assessment.engine === 'GEMINI_AI' ? 'Model: gemini-3.8-flash' : 'Deteksi Cepat Algoritma'}
            </span>
          </div>
          <h2 className={`text-xl font-extrabold tracking-tight ${levelColor}`}>
            TINGKAT PERINGATAN: {assessment.alertLevel} — {assessment.hazardType}
          </h2>
        </div>

        {/* Lead Time Countdown Clock */}
        <div className="flex items-center gap-3 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5">
          <Clock className={`w-5 h-5 ${isCritical ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">
              Estimasi Waktu Menuju Dampak (Lead Time)
            </div>
            <div className="text-base font-mono font-bold text-white tabular-nums tracking-wide">
              {formatTimer(leadTimeRemaining)}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Threat Summary & Correlation Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-400 mb-1">
              Ringkasan Ancaman & Wilayah Terdampak
            </h3>
            <p className="text-sm font-medium text-slate-100 leading-relaxed">
              {assessment.primaryThreatSummary}
            </p>
          </div>

          <div>
            <div className="text-xs font-mono text-slate-400 mb-1">Wilayah Prioritas Evakuasi:</div>
            <div className="flex flex-wrap gap-1.5">
              {assessment.affectedSubdistricts.map((reg, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-200 border border-slate-700"
                >
                  {reg}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
            <span>Sintesis Korelasi Multi-Sensor AI:</span>
            <span>Keyakinan: {assessment.confidenceScore}%</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            {assessment.sensorSynthesis}
          </p>
        </div>
      </div>

      {/* Earthquake Magnitude Telemetry & Prediction Block */}
      {assessment.earthquakeData && (assessment.earthquakeData.currentMagnitude || assessment.earthquakeData.predictedMagnitude) && (
        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-950/80 to-rose-950/30 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Analisis Magnitudo Seismik Real-Time & Prediksi AI Gemini
                </h3>
                <div className="text-[11px] font-mono text-slate-400">
                  Sumber Sesar: <span className="text-slate-200">{assessment.earthquakeData.sourceFault || 'Sesar Aktif Regional'}</span> · Kedalaman: <span className="text-slate-200">{assessment.earthquakeData.epicenterDepthKm || 15} km</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span>Intensitas: {assessment.earthquakeData.mmiIntensityScale || 'VII - Sangat Kuat'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Magnitude for earthquake happening right now */}
            <div className="p-3.5 rounded-lg border border-amber-500/30 bg-slate-950/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-amber-300 mb-1">
                  <span className="font-semibold uppercase tracking-wider">Magnitudo Gempa Sedang Terjadi</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 animate-pulse">
                    LIVE SHAKING
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Estimasi energi gelombang seketika dari akselerometer PGA & displacement sensor.
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-mono font-extrabold text-amber-400 tabular-nums">
                    M {assessment.earthquakeData.currentMagnitude?.toFixed(1) || '7.4'}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-2">Skala Moment (Mw)</span>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <div>Status: <span className="text-rose-400 font-semibold">Aktif Bergetar</span></div>
                  <div>Kecepatan: <span className="text-slate-300">3.8 km/s (S-wave)</span></div>
                </div>
              </div>
            </div>

            {/* Box 2: Magnitude prediction for predicted earthquake */}
            <div className="p-3.5 rounded-lg border border-rose-500/40 bg-slate-950/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-rose-300 mb-1">
                  <span className="font-semibold uppercase tracking-wider">Prediksi Magnitudo AI (Forecast)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/40">
                    AI PROJECTION
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Prediksi magnitudo puncak ruptur patahan & potensi gempa susulan utama (*mainshock propagation*).
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-mono font-extrabold text-rose-400 tabular-nums">
                    M {assessment.earthquakeData.predictedMagnitude?.toFixed(1) || '7.8'}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-2">Potensi Puncak (Mmax)</span>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <div>Keyakinan AI: <span className="text-cyan-400 font-semibold">{assessment.earthquakeData.confidencePercent || 94}%</span></div>
                  <div>Probabilitas Susulan: <span className="text-amber-400 font-semibold">{assessment.earthquakeData.aftershockProbability || 88}%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actionable Directives & Safe Havens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5">
          <h4 className="text-xs font-mono uppercase font-semibold text-amber-300 mb-2">
            Instruksi Penyelamatan Diri Warga (Action Steps)
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {assessment.evacuationDirectives.map((dir, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                <span>{dir}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5">
          <h4 className="text-xs font-mono uppercase font-semibold text-emerald-400 mb-2">
            Titik Kumpul Evakuasi Aman (Safe Havens)
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {assessment.safeZones.map((zone, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{zone}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Emergency Siren & Voice Audio Broadcast Trigger Bar */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onPlaySiren}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-sm"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Bunyikan Sirene EAS (853Hz+960Hz)</span>
          </button>

          <button
            onClick={onPlayVoiceAlert}
            disabled={isPlayingVoice}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border ${
              isPlayingVoice
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingVoice ? 'animate-bounce text-cyan-400' : ''}`} />
            <span>{isPlayingVoice ? 'Menyiarkan Audio Darurat...' : 'Siarkan Warta Suara Darurat (TTS)'}</span>
          </button>
        </div>

        {/* CAP XML preview button */}
        <button
          onClick={() => setShowCapXml(!showCapXml)}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <FileCode className="w-3.5 h-3.5 text-slate-500" />
          <span>{showCapXml ? 'Tutup XML CAP' : 'Format CAP v1.2 (OASIS)'}</span>
          {showCapXml ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* CAP XML Drawer */}
      {showCapXml && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Standar Common Alerting Protocol (CAP) v1.2</span>
            <button
              onClick={handleCopyCap}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedCap ? 'Tersalin!' : 'Salin Payload XML'}</span>
            </button>
          </div>
          <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-3 rounded-lg overflow-x-auto max-h-48 border border-slate-800">
            {assessment.capXmlPreview}
          </pre>
        </div>
      )}
    </div>
  );
};
