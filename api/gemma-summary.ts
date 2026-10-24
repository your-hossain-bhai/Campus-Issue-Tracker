import { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(request: IncomingMessage, response: ServerResponse): void {
  if (request.method !== 'POST') {
    response.statusCode = 405;
    response.setHeader('Allow', 'POST');
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }
  response.statusCode = 503;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify({
    error: 'Local Gemma summaries are available only when the CampusPulse server and Ollama run on the same machine. A Vercel function cannot reach your laptop Ollama service.',
  }));
}
