import React, { useState } from 'react';
import { UserCheck, Target, ListTodo, ShieldCheck, Copy, Check, Terminal } from 'lucide-react';

export const PgtcArchitectureModal: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const pgtcSections = [
    {
      key: 'persona',
      code: 'P',
      title: 'Persona (Identitas & Sudut Pandang Keahlian)',
      description: 'Menetapkan identitas, wewenang, dan domain keahlian yang diadopsi oleh AI.',
      content:
        'You are the Chief AI Disaster Systems Analyst for Indonesia\'s National Disaster Warning System (GeoVigil Nusantara). You possess deep expertise in seismology, hydrometeorology, oceanography, volcanic hazard mitigation, and ISO-22320 emergency management protocols.',
      icon: <UserCheck className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/40 bg-cyan-950/20',
    },
    {
      key: 'goal',
      code: 'G',
      title: 'Goal (Tujuan Utama & Luaran Strategis)',
      description: 'Menetapkan sasaran utama sistem dalam menyelamatkan nyawa dan aset.',
      content:
        'Your goal is to accurately assess multi-sensor anomalies, synthesize cross-domain telemetry in under 200ms, compute precise lead time to impact (ETA), and generate life-saving early warning advisories before catastrophe strikes.',
      icon: <Target className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-950/20',
    },
    {
      key: 'task',
      code: 'T',
      title: 'Task (Tugas Konkret & Aksi Eksekusi)',
      description: 'Menginstruksikan langkah kalkulasi spesifik dan format keluaran data.',
      content:
        '1. Ingest real-time telemetry from seismic accelerometers, river gauges, DART buoys, inclinometers, and weather stations.\n2. Cross-correlate anomalies against historical baselines and physical propagation models.\n3. Determine discrete alert tier (AWAS / SIAGA / WASPADA / NORMAL).\n4. Formulate push notification payload under 110 chars and generate CAP v1.2 OASIS XML.',
      icon: <ListTodo className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-950/20',
    },
    {
      key: 'context',
      code: 'C',
      title: 'Context (Konteks, Batasan & Format Standar)',
      description: 'Menetapkan batasan teknis, format baku, dan persyaratan bahasa.',
      content:
        'Format in strict JSON matching responseSchema. Use concise, urgent, authoritative Indonesian with standardized scientific units (gal, m, ton/hari, mm/jam). Adhere to BMKG/BNPB early warning standards with actionable life-saving steps.',
      icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-950/20',
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Implementasi Framework Prompting PGTC (Persona, Goal, Task, Context)
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Sistem peringatan dini GeoVigil Nusantara mengintegrasikan prinsip rekayasa prompt <strong>PGTC</strong> untuk mengarahkan model penalaran <strong>Gemini 3.8 Flash</strong> agar menghasilkan analisis telemetri berpresisi tinggi tanpa halusinasi, siap disiarkan ke jutaan perangkat warga.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pgtcSections.map((sec) => (
          <div
            key={sec.key}
            className={`rounded-2xl border ${sec.color} p-5 backdrop-blur flex flex-col justify-between space-y-4`}
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    {sec.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      KOMPONEN [{sec.code}]
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {sec.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(sec.content, sec.key)}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
                  title="Salin Prompt Bagian Ini"
                >
                  {copiedKey === sec.key ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-3">{sec.description}</p>

              <pre className="text-xs font-mono text-slate-200 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 whitespace-pre-wrap leading-relaxed">
                {sec.content}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Live System Architecture Flow */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">
          Alur Kerja Pipeline Peringatan Dini Real-Time
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
            <div className="text-cyan-400 font-bold">1. Ingesti IoT Telemetri</div>
            <div className="text-slate-400">PGA seismometer, DART buoy maritim, radar banjir, dan tiltmeter lereng ditransmisikan per detik via MQTT/LoRaWAN.</div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
            <div className="text-amber-400 font-bold">2. Trigger Algoritma (&lt;20ms)</div>
            <div className="text-slate-400">Algoritma STA/LTA &amp; rate-of-rise mendeteksi deviasi tajam melampaui ambang batas keamanan ISO-22320.</div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
            <div className="text-rose-400 font-bold">3. Penalaran AI Gemini</div>
            <div className="text-slate-400">Gemini 3.8 Flash mensintesis korelasi multi-sensor, menghitung lead time T-min, dan menyusun teks notifikasi push darurat.</div>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
            <div className="text-emerald-400 font-bold">4. Siaran Push Instan</div>
            <div className="text-slate-400">Push notification, GSM Cell Broadcast, dan sirene audio frekuensi ganda 853Hz+960Hz dipancarkan ke warga.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
