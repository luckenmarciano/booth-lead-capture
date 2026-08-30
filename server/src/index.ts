import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { leadsRouter } from './routes/leads.js';
import { settingsRouter } from './routes/settings.js';
import { integrationsRouter } from './routes/integrations.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Server-Sent Events (SSE) Client Registry for Realtime Broadcasting
interface SSEClient {
  id: string;
  res: Response;
}

const sseClients: SSEClient[] = [];

export function broadcastEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(payload);
    } catch (err) {
      sseClients.splice(i, 1);
    }
  }
}

// SSE Stream Endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = 'sse_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const client: SSEClient = { id: clientId, res };
  sseClients.push(client);

  // Send initial handshake
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clientId })}\n\n`);

  // Heartbeat every 25 seconds to keep connection open through proxies/reverse proxy (Nginx)
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const idx = sseClients.findIndex((c) => c.id === clientId);
    if (idx >= 0) sseClients.splice(idx, 1);
  });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Booth Lead Capture API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/leads', leadsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/integrations', integrationsRouter);

// Serve static frontend in production if client/dist exists
const clientDistPath = path.join(process.cwd(), '../client/dist');
const localDistPath = path.join(process.cwd(), 'client_dist');
const servePath = fs.existsSync(clientDistPath) ? clientDistPath : fs.existsSync(localDistPath) ? localDistPath : null;

if (servePath) {
  console.log(`[Server] Serving static client files from ${servePath}`);
  app.use(express.static(servePath));
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(servePath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🎪 Booth Lead Capture API Server running on port ${PORT}`);
  console.log(`📡 SSE Stream: http://localhost:${PORT}/api/events`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
