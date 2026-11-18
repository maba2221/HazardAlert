export type HazardType = 
  | 'EARTHQUAKE' 
  | 'TSUNAMI' 
  | 'FLOOD' 
  | 'LANDSLIDE' 
  | 'VOLCANO' 
  | 'WILDFIRE' 
  | 'MULTI_HAZARD';

export type AlertSeverity = 'NORMAL' | 'WASPADA' | 'SIAGA' | 'AWAS';

export type SensorType = 
  | 'seismic' 
  | 'hydrological' 
  | 'inclinometer' 
  | 'ocean_dart' 
  | 'volcanic_so2' 
  | 'weather';

export interface SensorStation {
  id: string;
  name: string;
  type: SensorType;
  unit: string;
  location: {
    name: string;
    region: string;
    lat: number;
    lng: number;
  };
  value: number;
  baseline: number;
  thresholdWaspada: number;
  thresholdSiaga: number;
  thresholdAwas: number;
  trend: 'rising' | 'falling' | 'stable';
  history: number[];
  isAnomaly: boolean;
  batteryLevel: number;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED';
  lastUpdated: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  urgencyBadge: 'CRITICAL' | 'HIGH' | 'ADVISORY' | 'NORMAL';
  soundAlertRequired: boolean;
  vibrationPattern?: number[];
  receivedAt?: string;
  channel?: 'BROWSER_PUSH' | 'CELL_BROADCAST' | 'SIREN_TOWER' | 'WHATSAPP_ALERT';
}

export interface EarthquakeMagnitudeData {
  currentMagnitude: number | null; // e.g. M 7.4 (current happening earthquake estimated from seismic PGA/wave amplitude)
  predictedMagnitude: number | null; // e.g. M 7.8 (predicted peak magnitude of mainshock or impending rupture)
  sourceFault?: string;
  epicenterDepthKm?: number;
  mmiIntensityScale?: string; // e.g. "VIII - Destruktif"
  confidencePercent?: number;
  aftershockProbability?: number; // e.g. 85%
  predictionWindowMinutes?: number; // e.g. 15 minutes window
}

export interface DisasterAssessment {
  alertLevel: AlertSeverity;
  hazardType: HazardType;
  confidenceScore: number;
  estimatedLeadTimeToImpactSeconds: number;
  primaryThreatSummary: string;
  affectedSubdistricts: string[];
  evacuationDirectives: string[];
  safeZones: string[];
  pushNotification: PushNotificationPayload;
  sensorSynthesis: string;
  capXmlPreview: string;
  evaluatedAt: string;
  engine: 'GEMINI_AI' | 'ALGORITHMIC_TRIGGER';
  earthquakeData?: EarthquakeMagnitudeData;
}

export interface DisasterScenario {
  id: string;
  title: string;
  subtitle: string;
  hazardType: HazardType;
  severity: AlertSeverity;
  description: string;
  affectedRegion: string;
  simulatedOverrides: Record<string, number>;
  expectedLeadTimeSeconds: number;
  currentMagnitude?: number;
  predictedMagnitude?: number;
}

export interface BroadcastLogItem {
  id: string;
  timestamp: string;
  title: string;
  body: string;
  severity: AlertSeverity;
  channels: string[];
  deliveredRecipients: number;
  leadTimeSeconds: number;
}
