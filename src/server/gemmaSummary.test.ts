import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeIssueWithGemma } from './gemmaSummary';

test('requests a non-streaming Gemma 4 summary from local Ollama', async () => {
  let requestedUrl = '';
  let requestBody: Record<string, unknown> | undefined;
  const summary = await summarizeIssueWithGemma(
    'Slow campus Wi-Fi',
    'Students report frequent disconnections in the library.',
    async (input, init) => {
      requestedUrl = String(input);
      requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return new Response(JSON.stringify({ response: 'Students report frequent Wi-Fi disconnections in the library.' }), { status: 200 });
    },
  );

  assert.equal(requestedUrl, 'http://localhost:11434/api/generate');
  assert.equal(requestBody?.model, 'gemma4:e2b');
  assert.equal(requestBody?.stream, false);
  assert.match(String(requestBody?.prompt), /Slow campus Wi-Fi/);
  assert.match(String(requestBody?.prompt), /frequent disconnections in the library/);
  assert.equal(summary, 'Students report frequent Wi-Fi disconnections in the library.');
});

test('reports actionable errors when Ollama is unavailable or the model is missing', async () => {
  await assert.rejects(
    summarizeIssueWithGemma('Title', 'Description', async () => {
      throw new TypeError('connection refused');
    }),
    /Could not connect to Ollama.*gemma4:e2b/,
  );
  await assert.rejects(
    summarizeIssueWithGemma('Title', 'Description', async () => new Response(
      JSON.stringify({ error: 'model not found' }),
      { status: 404 },
    )),
    /ollama pull gemma4:e2b/,
  );
});

test('rejects an empty Ollama generation result', async () => {
  await assert.rejects(
    summarizeIssueWithGemma('Title', 'Description', async () => new Response(
      JSON.stringify({ response: '' }),
      { status: 200 },
    )),
    /Ollama returned no summary/,
  );
});
