import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { generateCampusSummary } from './src/server/campusSummary';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '15mb' }));

app.post('/api/campus-summary', async (req, res) => {
  const result = await generateCampusSummary(req.body);
  return res.status(result.status).json(result.body);
});

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusPulse server listening on port ${PORT}`);
  });
}

startServer();
