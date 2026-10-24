import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { generateCampusSummary } from './src/server/campusSummary';
import { summarizeIssueWithGemma } from './src/server/gemmaSummary';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '15mb' }));

app.post('/api/campus-summary', async (req, res) => {
  const result = await generateCampusSummary(req.body);
  return res.status(result.status).json(result.body);
});

app.post('/api/gemma-summary', async (req, res) => {
  const { title, description } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'Issue title and description are required.' });
  }
  if (title.length > 500 || description.length > 10_000) {
    return res.status(413).json({ error: 'Issue text is too long to summarize.' });
  }
  try {
    const summary = await summarizeIssueWithGemma(title, description);
    return res.json({ summary, model: 'gemma4:e2b', provider: 'Ollama' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gemma summary failed.';
    return res.status(502).json({ error: message });
  }
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
