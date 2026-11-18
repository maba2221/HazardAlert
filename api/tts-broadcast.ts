import { generateTtsBroadcast } from '../lib/telemetryEngine';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const result = await generateTtsBroadcast(body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Vercel /api/tts-broadcast error:', error);
    return res.status(200).json({
      available: false,
      message: 'TTS unavailable',
    });
  }
}
