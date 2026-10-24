const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'gemma4:e2b';

export async function summarizeIssueWithGemma(
  title: string,
  description: string,
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const response = await fetcher(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model: MODEL_NAME,
      prompt: [
        'Summarize this campus issue in 2 to 4 concise sentences.',
        'Use only facts present in the title and description. Do not add recommendations or invent details.',
        `Title: ${title.trim()}`,
        `Description: ${description.trim()}`,
      ].join('\n\n'),
      stream: false,
    }),
  }).catch((error: unknown) => {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('Ollama did not respond within two minutes. Check that Ollama is running and try again.');
    }
    throw new Error('Could not connect to Ollama at localhost:11434. Install and start Ollama, then download gemma4:e2b.');
  });

  if (!response.ok) {
    let detail = '';
    try {
      const body: unknown = await response.json();
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        detail = body.error;
      }
    } catch {
      detail = '';
    }
    if (response.status === 404) {
      throw new Error('Ollama could not find gemma4:e2b. Run `ollama pull gemma4:e2b` and try again.');
    }
    throw new Error(detail || `Ollama returned HTTP ${response.status}. Check the Ollama service and try again.`);
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error('Ollama returned an invalid response. Try again.');
  }
  if (!result || typeof result !== 'object' || !('response' in result) || typeof result.response !== 'string' || !result.response.trim()) {
    throw new Error('Ollama returned no summary. Try again.');
  }
  return result.response.trim();
}
