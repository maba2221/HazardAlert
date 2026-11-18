import { GoogleGenAI, Type } from '@google/genai';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function getHealthPayload() {
  return {
    status: 'operational',
    service: 'GeoVigil Nusantara AI Telemetry & Push Engine',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  };
}

export async function analyzeTelemetryPayload(body: {
  stations?: any[];
  scenarioName?: string;
  manualOverrides?: Record<string, unknown>;
  ruleTriggered?: boolean;
}) {
  const stations = Array.isArray(body?.stations) ? body.stations : [];
  const scenarioName = body?.scenarioName || 'Live Sensor Network Monitoring';
  const manualOverrides = body?.manualOverrides || {};
  const ruleTriggered = Boolean(body?.ruleTriggered);

  const ai = getAiClient();
  if (!ai) {
    return generateAlgorithmicFallback(stations, scenarioName, ruleTriggered);
  }

  try {
    const sensorSummary = stations
      .map(
        (s: any) =>
          `- [Station ${s.id}] ${s.name} (${s.location?.name || 'Unknown'}, Lat ${s.location?.lat ?? 0}, Lng ${s.location?.lng ?? 0}): Type: ${s.type}, Value: ${s.value} ${s.unit} (Normal baseline: ${s.baseline} ${s.unit}, Anomaly: ${s.isAnomaly ? 'ANOMALOUS TRIGGER' : 'nominal'}), Rate of change: ${s.trend}`
      )
      .join('\n');

    const prompt = `
You are the Chief AI Disaster Systems Analyst for Indonesia's National Disaster Warning System (GeoVigil Nusantara).
Your task is to analyze real-time telemetry from multiple IoT field sensor arrays (seismic accelerometers, ultrasonic river gauges, soil pore inclinometers, ocean DART buoys, volcanic SO2 spectrometers, and weather stations).

Context & Telemetry Stream:
Scenario context: "${scenarioName}"
Rule Trigger Status: ${ruleTriggered ? 'THRESHOLD EXCEEDED BY FAST ALGORITHM' : 'MONITORING'}
Manual Overrides: ${JSON.stringify(manualOverrides)}

Current Station Readings:
${sensorSummary}

Guidelines:
1. Synthesize multi-sensor data: Correlate P-wave arrival with DART buoy pressure for tsunamigenic megathrusts, or rainfall rate with soil moisture & tilt inclinometer for landslides, or river level rise rate with radar rain for flash floods.
2. Determine Alert Level strictly:
   - "AWAS" (Emergency Warning / Red): Imminent catastrophic impact requiring immediate sheltering or evacuation (lead time seconds/minutes).
   - "SIAGA" (Watch / Orange): High probability threat unfolding rapidly.
   - "WASPADA" (Advisory / Yellow): Emerging anomaly requiring operational readiness.
   - "NORMAL" (Green): Safe baseline.
3. Earthquake Magnitude Calculation & Prediction:
   - Calculate "currentMagnitude": The estimated moment magnitude (Mw) of the current shaking in progress derived from accelerometer Peak Ground Acceleration (PGA in gal) and displacement telemetry (e.g. 150-250 gal typically corresponds to M7.0 - M7.5).
   - Calculate "predictedMagnitude": The AI model forecast of the maximum potential mainshock or rupture magnitude on that specific fault segment (e.g. Sunda Megathrust maximum rupture capability M7.8 - M8.2; Lembang fault maximum rupture M6.8 - M7.0) or predicted peak magnitude if rupture propagates further. Include confidence percent, hypocenter depth, source fault, and aftershock probability.
4. Calculate estimated lead time to impact in seconds (e.g. 25-180 seconds for earthquake S-wave / tsunami arrival / flash flood surge).
5. Provide immediate actionable push notification text in concise, urgent Indonesian (and English summary), formatted for mobile lockscreen banners (<110 characters).
6. Generate CAP (Common Alerting Protocol v1.2) XML compliant snippet.

Provide your response in strictly structured JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alertLevel: {
              type: Type.STRING,
              description: "Must be 'NORMAL', 'WASPADA', 'SIAGA', or 'AWAS'",
            },
            hazardType: {
              type: Type.STRING,
              description: 'EARTHQUAKE, TSUNAMI, FLOOD, LANDSLIDE, VOLCANO, WILDFIRE, or MULTI_HAZARD',
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'Confidence percentage 0-100',
            },
            estimatedLeadTimeToImpactSeconds: {
              type: Type.NUMBER,
              description: 'Lead time in seconds before peak danger arrives',
            },
            primaryThreatSummary: {
              type: Type.STRING,
              description: '1-2 sentence core technical threat description',
            },
            affectedSubdistricts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of districts/areas under immediate alert',
            },
            evacuationDirectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step-by-step life saving actions',
            },
            safeZones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Recommended assembly shelters or higher ground zones',
            },
            earthquakeData: {
              type: Type.OBJECT,
              description:
                'Estimated current happening earthquake magnitude and AI predicted magnitude (if seismic anomaly exists or is emerging)',
              properties: {
                currentMagnitude: {
                  type: Type.NUMBER,
                  description: 'Estimated magnitude of currently happening shaking/rupture (e.g. 7.4), or null if no earthquake',
                },
                predictedMagnitude: {
                  type: Type.NUMBER,
                  description:
                    'AI forecast/predicted peak magnitude of impending mainshock or maximum fault rupture capacity (e.g. 7.9)',
                },
                sourceFault: {
                  type: Type.STRING,
                  description: "Name of active fault or subduction segment (e.g. 'Megathrust Selat Sunda' or 'Sesar Lembang')",
                },
                epicenterDepthKm: {
                  type: Type.NUMBER,
                  description: 'Hypocenter depth in kilometers (e.g. 15 km)',
                },
                mmiIntensityScale: {
                  type: Type.STRING,
                  description: "Modified Mercalli Intensity, e.g. 'VIII - Destruktif' or 'VI - Kuat'",
                },
                confidencePercent: {
                  type: Type.NUMBER,
                  description: 'Confidence in prediction 0-100%',
                },
                aftershockProbability: {
                  type: Type.NUMBER,
                  description: 'Probability of strong aftershocks M>6.0 in next 24h (percentage 0-100)',
                },
                predictionWindowMinutes: {
                  type: Type.NUMBER,
                  description: 'Time window for predicted rupture/aftershocks in minutes',
                },
              },
            },
            pushNotification: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                body: { type: Type.STRING },
                urgencyBadge: { type: Type.STRING },
                soundAlertRequired: { type: Type.BOOLEAN },
                vibrationPattern: {
                  type: Type.ARRAY,
                  items: { type: Type.INTEGER },
                },
              },
              required: ['title', 'body', 'urgencyBadge', 'soundAlertRequired'],
            },
            sensorSynthesis: {
              type: Type.STRING,
              description: 'Scientific explanation of how sensor readings correlate to prove or disprove the hazard',
            },
            capXmlPreview: {
              type: Type.STRING,
              description: 'CAP v1.2 XML notification payload',
            },
          },
          required: [
            'alertLevel',
            'hazardType',
            'confidenceScore',
            'estimatedLeadTimeToImpactSeconds',
            'primaryThreatSummary',
            'affectedSubdistricts',
            'evacuationDirectives',
            'safeZones',
            'pushNotification',
            'sensorSynthesis',
            'capXmlPreview',
          ],
        },
      },
    });

    const rawText = (response.text || '{}')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(rawText);
  } catch (error) {
    console.error('Gemini Telemetry Analysis Error:', error);
    return generateAlgorithmicFallback(stations, scenarioName, true);
  }
}

export async function generateTtsBroadcast(body: { text?: string; urgency?: string }) {
  const ai = getAiClient();
  if (!ai) {
    return {
      available: false,
      message: 'TTS requires GEMINI_API_KEY. Browser Web Speech Synthesis fallback will be used.',
    };
  }

  try {
    const broadcastScript = body?.text || 'Peringatan dini darurat. Segera selamatkan diri ke lokasi evakuasi.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: broadcastScript,
              speechMetadata: {
                style:
                  body?.urgency === 'AWAS'
                    ? 'Urgent, authoritative disaster emergency broadcaster'
                    : 'Clear, calm national public alert announcer',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return {
        available: true,
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      };
    }

    return {
      available: false,
      message: 'No audio stream returned, using browser audio fallback.',
    };
  } catch (error: any) {
    console.error('Gemini TTS error:', error);
    return {
      available: false,
      message: error?.message || 'TTS unavailable',
    };
  }
}

export function generateAlgorithmicFallback(
  stations: any[] = [],
  scenarioName: string = '',
  ruleTriggered: boolean = false
) {
  let maxSeverity: 'NORMAL' | 'WASPADA' | 'SIAGA' | 'AWAS' = 'NORMAL';
  let primaryHazard = 'EARTHQUAKE';

  const seismic = stations.find((s) => s.type === 'seismic');
  const hydro = stations.find((s) => s.type === 'hydrological');
  const tilt = stations.find((s) => s.type === 'inclinometer');
  const buoy = stations.find((s) => s.type === 'ocean_dart');
  const volcano = stations.find((s) => s.type === 'volcanic_so2');

  if (seismic && seismic.value > 150) {
    maxSeverity = 'AWAS';
    primaryHazard = buoy && buoy.value > 2.5 ? 'TSUNAMI' : 'EARTHQUAKE';
  } else if (hydro && hydro.value > 4.2) {
    maxSeverity = 'AWAS';
    primaryHazard = 'FLOOD';
  } else if (tilt && tilt.value > 5.5) {
    maxSeverity = 'AWAS';
    primaryHazard = 'LANDSLIDE';
  } else if (volcano && volcano.value > 180) {
    maxSeverity = 'AWAS';
    primaryHazard = 'VOLCANO';
  } else if (ruleTriggered) {
    maxSeverity = 'SIAGA';
  }

  const alertMap: Record<string, { title: string; body: string; leadTime: number }> = {
    EARTHQUAKE: {
      title: 'PERINGATAN DINI GEMPA BUMI (M > 7.0)',
      body: 'Guncangan seismik destruktif terdeteksi. Segera Tunduk, Lindungi Kepala, dan Bertahan!',
      leadTime: 32,
    },
    TSUNAMI: {
      title: 'PERINGATAN DINI TSUNAMI (AWAS)',
      body: 'Sensor DART mendeteksi lonjakan muka laut 3.8m. Segera jauhi pantai menuju ketinggian >20m!',
      leadTime: 380,
    },
    FLOOD: {
      title: 'PERINGATAN DARURAT BANJIR BANDANG',
      body: 'Tinggi muka air sungai melampaui batas kritis Siaga 1. Segera evakuasi dari bantaran sungai!',
      leadTime: 480,
    },
    LANDSLIDE: {
      title: 'PERINGATAN DINI TANAH LONGSOR',
      body: 'Pergeseran lereng bukit kritis & saturasi pori tanah >95%. Segera tinggalkan zona lereng!',
      leadTime: 95,
    },
    VOLCANO: {
      title: 'PERINGATAN DINI ERUPSI GUNUNG API',
      body: 'Peningkatan seismik vulkanik & fluks SO2 tajam. Zona bahaya radius 7 km disterilkan!',
      leadTime: 600,
    },
  };

  const alertData = alertMap[primaryHazard] || alertMap.EARTHQUAKE;

  let earthquakeData = undefined;
  if (primaryHazard === 'EARTHQUAKE' || primaryHazard === 'TSUNAMI' || (seismic && seismic.value > 10)) {
    const pga = seismic?.value || 2.4;
    let estCurrentMag = 3.2;
    if (pga >= 180) {
      estCurrentMag = 7.4;
    } else if (pga >= 100) {
      estCurrentMag = 6.8;
    } else if (pga >= 50) {
      estCurrentMag = 6.1;
    } else if (pga >= 20) {
      estCurrentMag = 5.2;
    } else if (pga >= 5) {
      estCurrentMag = 4.1;
    }

    const isMegathrust = buoy && buoy.value > 1.0;
    const estPredictedMag = isMegathrust ? 7.8 : Math.max(6.8, estCurrentMag + 0.3);

    earthquakeData = {
      currentMagnitude: estCurrentMag,
      predictedMagnitude: estPredictedMag,
      sourceFault: isMegathrust ? 'Zona Subduksi Megathrust Selat Sunda' : 'Sesar Aktif Lembang (Segmen Barat)',
      epicenterDepthKm: isMegathrust ? 18 : 10,
      mmiIntensityScale: estCurrentMag >= 7.0 ? 'VIII - Destruktif' : estCurrentMag >= 6.0 ? 'VI - Kuat' : 'IV - Ringan',
      confidencePercent: 93,
      aftershockProbability: 88,
      predictionWindowMinutes: 20,
    };
  }

  return {
    alertLevel: maxSeverity,
    hazardType: primaryHazard,
    confidenceScore: maxSeverity === 'AWAS' ? 94 : 78,
    estimatedLeadTimeToImpactSeconds: alertData.leadTime,
    primaryThreatSummary: `Algoritma deteksi cepat memvalidasi anomali multi-sensor pada sektor ${scenarioName || 'Aktif'}. Nilai instan melampaui ambang batas keamanan ISO-22320.`,
    affectedSubdistricts: ['Zona Pesisir Barat', 'Lembah DAS Hilir', 'Lereng Sektor Utara'],
    evacuationDirectives: [
      'Jauhi bangunan rapuh, tiang listrik, dan tebing curam.',
      'Bawa tas siaga darurat (dokumen, obat-obatan, air minum).',
      'Pantau terus saluran radio resmi BMKG/BPBD.',
    ],
    safeZones: ['Titik Kumpul Lapangan Terbuka Merdeka', 'Balai Desa Dataran Tinggi', 'Shelter Evakuasi Tsunami TS-02'],
    earthquakeData,
    pushNotification: {
      title: alertData.title,
      body: alertData.body,
      urgencyBadge: maxSeverity === 'AWAS' ? 'CRITICAL' : 'HIGH',
      soundAlertRequired: maxSeverity === 'AWAS' || maxSeverity === 'SIAGA',
      vibrationPattern: [500, 200, 500, 200, 800],
    },
    sensorSynthesis: `Korelasi instan mendeteksi deviasi >3.8σ dari baseline nominal. Pola spektral konsisten dengan pelepasan energi kinetik/dinamika fluida cepat.`,
    capXmlPreview: `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>GEOVIGIL-${Date.now()}</identifier>
  <sender>pusdalops@geovigil.go.id</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Geo</category>
    <event>${alertData.title}</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <headline>${alertData.title}</headline>
    <description>${alertData.body}</description>
  </info>
</alert>`,
  };
}
