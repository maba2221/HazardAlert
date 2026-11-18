import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getHealthPayload,
  analyzeTelemetryPayload,
  generateTtsBroadcast,
} from './lib/telemetryEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json(getHealthPayload());
});

// Real-Time Sensor Telemetry Analysis Endpoint
app.post('/api/analyze-telemetry', async (req: Request, res: Response) => {
  try {
    const result = await analyzeTelemetryPayload(req.body || {});
    return res.json(result);
  } catch (error) {
    console.error('Server /api/analyze-telemetry error:', error);
    return res.status(500).json({ error: 'Failed to analyze telemetry' });
  }
});

// Emergency Voice Alert Speech Synthesis Endpoint (TTS)
app.post('/api/tts-broadcast', async (req: Request, res: Response) => {
  try {
    const result = await generateTtsBroadcast(req.body || {});
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Server /api/tts-broadcast error:', error);
    return res.status(200).json({
      available: false,
      message: error?.message || 'TTS unavailable',
    });
  }
});

// Dev server or Production setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
