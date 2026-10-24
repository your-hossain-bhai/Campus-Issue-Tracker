import { IncomingMessage, ServerResponse } from 'node:http';
import { generateCampusSummary } from '../src/server/campusSummary';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

async function readBody(request: VercelRequest): Promise<unknown> {
  if (request.body !== undefined) return request.body;
  const chunks: Uint8Array[] = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export default async function handler(request: VercelRequest, response: ServerResponse): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.statusCode = 405;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }

  const result = await generateCampusSummary(await readBody(request));
  response.statusCode = result.status;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(result.body));
}
