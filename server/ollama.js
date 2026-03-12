const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * Fetch the list of locally available Ollama models.
 * @returns {Promise<string[]>} Array of model name strings.
 */
export async function listModels() {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
  if (!response.ok) {
    throw new Error(`Ollama responded with status ${response.status}`);
  }
  const data = await response.json();
  return (data.models || []).map((m) => m.name);
}

/**
 * Stream a chat completion from Ollama, calling onChunk for each token.
 * @param {string} model - The Ollama model name.
 * @param {Array<{role: string, content: string}>} messages - Chat history.
 * @param {function} onChunk - Callback invoked with each streamed chunk object.
 */
export async function chatStream(model, messages, onChunk) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!response.ok) {
    throw new Error(`Ollama responded with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        onChunk(parsed);
      } catch {
        // skip malformed lines
      }
    }
  }

  // Process any remaining buffered data
  if (buffer.trim()) {
    try {
      onChunk(JSON.parse(buffer.trim()));
    } catch {
      // skip malformed final line
    }
  }
}
