import React, { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_STATIONS, CRISIS_SCENARIOS } from './data/mockSensors';
import {
  SensorStation,
  DisasterScenario,
  DisasterAssessment,
  BroadcastLogItem,
  AlertSeverity,
} from './types/disaster';
import { Header } from './components/Header';
import { TelemetryCard } from './components/TelemetryCard';
import { HazardMap } from './components/HazardMap';
import { SimulationSandbox } from './components/SimulationSandbox';
import { AiAssessmentPanel } from './components/AiAssessmentPanel';
import { PushNotificationSimulator } from './components/PushNotificationSimulator';
import { PgtcArchitectureModal } from './components/PgtcArchitectureModal';
import { emergencyAudio } from './utils/audioAlert';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendBrowserPushNotification,
} from './utils/webNotification';
import { Activity, Cpu, RefreshCw } from 'lucide-react';
import emergencyOpsImg from './assets/images/emergency_operations_room_1793171131343.jpg';

export default function App() {
  const [stations, setStations] = useState<SensorStation[]>(INITIAL_STATIONS);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'map' | 'simulation' | 'broadcast' | 'architecture'>('telemetry');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scen-nominal');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(getNotificationPermissionStatus());
  
  const [assessment, setAssessment] = useState<DisasterAssessment | null>(null);
  const [leadTimeRemaining, setLeadTimeRemaining] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<SensorStation | null>(null);

  const [broadcastLogs, setBroadcastLogs] = useState<BroadcastLogItem[]>([
    {
      id: 'LOG-001',
      timestamp: '14:20:15',
      title: 'Uji Rutin Jaringan Telemetri Sensor',
      body: 'Semua 6 stasiun sensor telemetri merespons dalam latensi 24ms.',
      severity: 'NORMAL',
      channels: ['TELEMETRY_HEARTBEAT'],
      deliveredRecipients: 42,
      leadTimeSeconds: 0,
    },
  ]);

  // Fast rule-based trigger check: returns true if any station exceeds thresholdAwas
  const ruleTriggered = stations.some((s) => s.value >= s.thresholdAwas);

  // Determine global alert level
  const alertLevel: AlertSeverity = assessment
    ? assessment.alertLevel
    : ruleTriggered
    ? 'AWAS'
    : stations.some((s) => s.value >= s.thresholdSiaga)
    ? 'SIAGA'
    : stations.some((s) => s.value >= s.thresholdWaspada)
    ? 'WASPADA'
    : 'NORMAL';

  // Request browser push notification permission
  const handleRequestPermission = async () => {
    const status = await requestNotificationPermission();
    setNotificationPermission(status);
  };

  // Run AI Telemetry Analysis via Gemini 3.8 Flash endpoint
  const handleRunAiAnalysis = useCallback(async (
    overrideStations?: SensorStation[],
    overrideScenario?: DisasterScenario
  ) => {
    setIsAnalyzing(true);
    try {
      const targetStations = overrideStations || stations;
      const activeScen = overrideScenario || CRISIS_SCENARIOS.find((s) => s.id === activeScenarioId);
      const isTriggered = targetStations.some((s) => s.value >= s.thresholdAwas);

      const res = await fetch('/api/analyze-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stations: targetStations,
          scenarioName: activeScen?.title || 'Pengawasan Real-Time',
          ruleTriggered: isTriggered,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const newAssessment: DisasterAssessment = {
        alertLevel: data.alertLevel || (isTriggered ? 'AWAS' : 'NORMAL'),
        hazardType: data.hazardType || 'MULTI_HAZARD',
        confidenceScore: data.confidenceScore || 92,
        estimatedLeadTimeToImpactSeconds: data.estimatedLeadTimeToImpactSeconds || 45,
        primaryThreatSummary: data.primaryThreatSummary || 'Anomali terdeteksi pada sensor.',
        affectedSubdistricts: data.affectedSubdistricts || ['Sektor Pantauan'],
        evacuationDirectives: data.evacuationDirectives || ['Jauhi zona bahaya.'],
        safeZones: data.safeZones || ['Titik Kumpul Evakuasi Terbuka'],
        pushNotification: {
          title: data.pushNotification?.title || 'PERINGATAN DARURAT BENCANA',
          body: data.pushNotification?.body || 'Segera selamatkan diri ke lokasi evakuasi.',
          urgencyBadge: data.pushNotification?.urgencyBadge || 'CRITICAL',
          soundAlertRequired: Boolean(data.pushNotification?.soundAlertRequired),
          receivedAt: 'Baru saja',
        },
        sensorSynthesis: data.sensorSynthesis || 'Korelasi telemetri terverifikasi.',
        capXmlPreview: data.capXmlPreview || '<alert></alert>',
        evaluatedAt: new Date().toLocaleTimeString('id-ID'),
        engine: 'GEMINI_AI',
        earthquakeData: data.earthquakeData || (activeScen?.currentMagnitude ? {
          currentMagnitude: activeScen.currentMagnitude,
          predictedMagnitude: activeScen.predictedMagnitude || activeScen.currentMagnitude + 0.4,
          sourceFault: activeScen.title,
          epicenterDepthKm: 16,
          mmiIntensityScale: activeScen.currentMagnitude >= 7 ? 'VIII - Destruktif' : 'VI - Kuat',
          confidencePercent: 93,
          aftershockProbability: 85,
          predictionWindowMinutes: 20,
        } : undefined),
      };

      setAssessment(newAssessment);
      setLeadTimeRemaining(newAssessment.estimatedLeadTimeToImpactSeconds);

      // Log dispatch
      const newLog: BroadcastLogItem = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        title: newAssessment.pushNotification.title,
        body: newAssessment.pushNotification.body,
        severity: newAssessment.alertLevel,
        channels: ['Web Push', 'GSM Cell Broadcast', 'Outdoor Siren'],
        deliveredRecipients: newAssessment.alertLevel === 'AWAS' ? 1842000 : 250000,
        leadTimeSeconds: newAssessment.estimatedLeadTimeToImpactSeconds,
      };

      setBroadcastLogs((prev) => [newLog, ...prev.slice(0, 9)]);

      // If alert level is AWAS or SIAGA, trigger real browser push and EAS siren
      if (newAssessment.alertLevel === 'AWAS' || newAssessment.alertLevel === 'SIAGA') {
        if (!isMuted) {
          emergencyAudio.playEasSiren(2500);
        }
        sendBrowserPushNotification(newAssessment.pushNotification.title, {
          body: newAssessment.pushNotification.body,
          tag: 'disaster-alert',
        });
      }
    } catch (err) {
      console.warn('AI analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [stations, activeScenarioId, isMuted]);

  // Lead time countdown effect
  useEffect(() => {
    if (leadTimeRemaining <= 0) return;
    const timer = setInterval(() => {
      setLeadTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [leadTimeRemaining]);

  // Telemetry streaming interval: introduces natural micro-noise or moves towards scenario targets
  useEffect(() => {
    if (!isStreaming) return;

    const intervalMs = Math.max(200, 1000 / streamSpeed);
    const timer = setInterval(() => {
      setStations((prev) =>
        prev.map((st) => {
          // If in nominal scenario, fluctuate gently around baseline
          const noise = (Math.random() - 0.49) * (st.baseline * 0.05 || 0.05);
          let newVal = Math.max(0, st.value + noise);

          // Update trend
          const lastVal = st.history[st.history.length - 1] || st.value;
          const trend = newVal > lastVal + 0.02 ? 'rising' : newVal < lastVal - 0.02 ? 'falling' : 'stable';
          const newHistory = [...st.history.slice(-11), Number(newVal.toFixed(2))];

          return {
            ...st,
            value: Number(newVal.toFixed(2)),
            trend,
            history: newHistory,
            lastUpdated: 'Baru saja',
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isStreaming, streamSpeed]);

  // Adjust a specific station value manually (sliders)
  const handleUpdateStationValue = (id: string, val: number) => {
    setStations((prev) =>
      prev.map((st) => {
        if (st.id === id) {
          const trend = val > st.value ? 'rising' : 'falling';
          return {
            ...st,
            value: val,
            trend,
            history: [...st.history.slice(-11), val],
          };
        }
        return st;
      })
    );
  };

  // Scenario Selection Handler
  const handleSelectScenario = (scenario: DisasterScenario) => {
    setActiveScenarioId(scenario.id);

    const updatedStations = stations.map((st) => {
      if (scenario.simulatedOverrides[st.id] !== undefined) {
        const targetVal = scenario.simulatedOverrides[st.id];
        return {
          ...st,
          value: targetVal,
          history: [...st.history.slice(-11), targetVal],
          trend: (targetVal > st.baseline ? 'rising' : 'stable') as 'rising' | 'falling' | 'stable',
          isAnomaly: targetVal >= st.thresholdWaspada,
        };
      }
      return st;
    });

    setStations(updatedStations);

    // Automatically trigger AI analysis with fresh stations (avoiding stale closure)
    if (scenario.id !== 'scen-nominal') {
      handleRunAiAnalysis(updatedStations, scenario);
    } else {
      // Reset assessment to nominal
      setAssessment(null);
      setLeadTimeRemaining(0);
      emergencyAudio.stopAll();
    }
  };

  // Play Emergency Siren button
  const handlePlaySiren = () => {
    emergencyAudio.playEasSiren(3000);
  };

  // Play Emergency Voice Warning (TTS via server or speech synthesis fallback)
  const handlePlayVoiceAlert = async () => {
    setIsPlayingVoice(true);
    const speechText =
      assessment?.pushNotification.body ||
      'Peringatan darurat bencana. Segera lakukan evakuasi mandiri ke lokasi yang lebih aman.';

    try {
      const res = await fetch('/api/tts-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: speechText,
          urgency: assessment?.alertLevel || 'AWAS',
        }),
      });

      const data = await res.json();
      if (data.available && data.audioBase64) {
        emergencyAudio.playTtsBase64(data.audioBase64, () => setIsPlayingVoice(false));
      } else {
        emergencyAudio.speakFallbackText(speechText, () => setIsPlayingVoice(false));
      }
    } catch {
      emergencyAudio.speakFallbackText(speechText, () => setIsPlayingVoice(false));
    }
  };

  // Trigger manual browser push notification
  const handleTriggerRealBrowserPush = () => {
    const title = assessment?.pushNotification.title || 'UJI COBA PERINGATAN DARURAT (BMKG/GEOVIGIL)';
    const body =
      assessment?.pushNotification.body ||
      'Ini adalah uji transmisi notifikasi peringatan dini bencana berbasis multi-sensor real-time.';

    sendBrowserPushNotification(title, {
      body,
      tag: 'test-alert',
    });

    if (!isMuted) {
      emergencyAudio.playEasSiren(1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Strict Top Bar Contract Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          emergencyAudio.setMuted(next);
        }}
        onTriggerQuickSim={() => {
          const crisis = CRISIS_SCENARIOS.find((s) => s.id === 'scen-megathrust');
          if (crisis) handleSelectScenario(crisis);
        }}
        alertLevel={alertLevel}
        hasNotificationPermission={notificationPermission === 'granted'}
        onRequestNotificationPermission={handleRequestPermission}
      />

      {/* Hero Visual & Operations Header Strip */}
      <div className="border-b border-slate-800 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>PUSAT OPERASI PENGENDALIAN BENCANA NASIONAL (PUSOPS)</span>
                <span aria-hidden="true">·</span>
                <span>LATENSI JARINGAN: 18ms</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Sistem Peringatan Dini Multi-Sensor &amp; Push Notification Real-Time
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Mengintegrasikan telemetri akselerometer seismik, buoy DART samudra, radar hidrologi banjir, dan tiltmeter deformasi lereng dengan penalaran <strong>Gemini 3.8 Flash</strong> untuk peringatan dini instan sebelum bencana melanda.
              </p>
            </div>

            {/* Tactical Command Center Visual with Fallback Container */}
            <div className="lg:col-span-4 relative rounded-xl overflow-hidden border border-slate-800 h-32 sm:h-36 bg-slate-900 shadow-md">
              <img
                src={emergencyOpsImg}
                alt="Tactical disaster command center display"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-3">
                <div className="flex items-center justify-between w-full text-xs font-mono text-slate-300">
                  <span>Pusdalops Grid Telemetri</span>
                  <span className="text-emerald-400">● 6/6 Stasiun Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Active AI Assessment & Lead Time Clock (Always visible when alert is active or requested) */}
        {assessment && (
          <AiAssessmentPanel
            assessment={assessment}
            leadTimeRemaining={leadTimeRemaining}
            onPlaySiren={handlePlaySiren}
            onPlayVoiceAlert={handlePlayVoiceAlert}
            isPlayingVoice={isPlayingVoice}
          />
        )}

        {/* Tab 1: Telemetry Sensor Grid */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>Stasiun Telemetri IoT Lapangan (Live Sensor Array)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pembacaan nilai real-time, tren gelombang, baseline nominal, dan kalkulasi deviasi ambang batas ISO-22320.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunAiAnalysis()}
                  disabled={isAnalyzing}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 text-slate-950 hover:bg-cyan-500 font-bold transition-colors flex items-center gap-1.5"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5" />
                  )}
                  <span>Evaluasi AI Sekarang</span>
                </button>
              </div>
            </div>

            {/* Sensor Telemetry Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stations.map((station) => (
                <TelemetryCard
                  key={station.id}
                  station={station}
                  onAdjustValue={handleUpdateStationValue}
                  onOpenSensorDetail={(st) => setSelectedStation(st)}
                />
              ))}
            </div>

            {/* Secondary GIS Map embedded in telemetry tab for holistic overview */}
            <div className="pt-4">
              <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <span>Peta Geospasial Stasiun &amp; Garis Subduksi Lempeng</span>
              </div>
              <HazardMap
                stations={stations}
                alertLevel={alertLevel}
                leadTimeSeconds={leadTimeRemaining}
                onSelectStation={(st) => setSelectedStation(st)}
                selectedStationId={selectedStation?.id}
                epicenterActive={alertLevel === 'AWAS'}
                currentMagnitude={assessment?.earthquakeData?.currentMagnitude}
                predictedMagnitude={assessment?.earthquakeData?.predictedMagnitude}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Screen Hazard GIS Map */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Peta Spasial Geospasial &amp; Propagasi Bahaya Bencana
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualisasi sebaran stasiun, episenter gempa, zona rendaman banjir/tsunami, dan lokasi titik kumpul evakuasi.
                </p>
              </div>
            </div>

            <HazardMap
              stations={stations}
              alertLevel={alertLevel}
              leadTimeSeconds={leadTimeRemaining}
              onSelectStation={(st) => setSelectedStation(st)}
              selectedStationId={selectedStation?.id}
              epicenterActive={alertLevel === 'AWAS'}
              currentMagnitude={assessment?.earthquakeData?.currentMagnitude}
              predictedMagnitude={assessment?.earthquakeData?.predictedMagnitude}
            />
          </div>
        )}

        {/* Tab 3: Crisis Simulation Sandbox */}
        {activeTab === 'simulation' && (
          <SimulationSandbox
            scenarios={CRISIS_SCENARIOS}
            activeScenarioId={activeScenarioId}
            onSelectScenario={handleSelectScenario}
            stations={stations}
            onUpdateStationValue={handleUpdateStationValue}
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming(!isStreaming)}
            streamSpeed={streamSpeed}
            onChangeStreamSpeed={setStreamSpeed}
            onRunAiAnalysis={() => handleRunAiAnalysis()}
            isAnalyzing={isAnalyzing}
            ruleTriggered={ruleTriggered}
          />
        )}

        {/* Tab 4: Push Broadcast & Lockscreen Simulator */}
        {activeTab === 'broadcast' && (
          <PushNotificationSimulator
            notification={assessment?.pushNotification || null}
            logs={broadcastLogs}
            onTriggerRealBrowserPush={handleTriggerRealBrowserPush}
            permissionStatus={notificationPermission}
            onRequestPermission={handleRequestPermission}
            onNavigateToMap={() => setActiveTab('map')}
          />
        )}

        {/* Tab 5: PGTC Prompt Engineering Architecture */}
        {activeTab === 'architecture' && <PgtcArchitectureModal />}
      </main>

      {/* Sensor Detail Modal (if selected) */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {selectedStation.name} ({selectedStation.id})
              </h3>
              <button
                onClick={() => setSelectedStation(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs font-mono space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Lokasi:</span>
                <span>{selectedStation.location.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Koordinat:</span>
                <span>{selectedStation.location.lat}, {selectedStation.location.lng}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Status Daya Baterai:</span>
                <span>{selectedStation.batteryLevel}% (Solar Panel Terhubung)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Ambang Batas Waspada:</span>
                <span>{selectedStation.thresholdWaspada} {selectedStation.unit}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Ambang Batas Awas:</span>
                <span>{selectedStation.thresholdAwas} {selectedStation.unit}</span>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <div className="text-xs font-mono text-slate-400">Simulasikan Nilai Stasiun:</div>
              <input
                type="range"
                min="0"
                max={selectedStation.thresholdAwas * 1.5}
                step="0.05"
                value={selectedStation.value}
                onChange={(e) => handleUpdateStationValue(selectedStation.id, parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="text-right text-xs font-mono text-cyan-400 font-bold">
                {selectedStation.value.toFixed(2)} {selectedStation.unit}
              </div>
            </div>

            <button
              onClick={() => setSelectedStation(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      )}

      {/* Clean Technical Footer (No ornamental fake tickers, conforming to section 1.B) */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            GeoVigil Nusantara &copy; 2026 · Standar Protokol Peringatan Dini CAP v1.2 &amp; ISO-22320
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Seismologi</span>
            <span aria-hidden="true">·</span>
            <span>Hidrometeorologi</span>
            <span aria-hidden="true">·</span>
            <span>Vulkanologi</span>
            <span aria-hidden="true">·</span>
            <span>Oseanografi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
