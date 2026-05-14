import { getOpenAiKey } from './secrets';

const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';
const MODEL = 'text-embedding-3-small';
const MAX_INPUT_CHARS = 24_000;

export class MissingOpenAiKeyError extends Error {
  constructor() {
    super('OpenAI API key não configurada. Configure em Settings.');
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const key = getOpenAiKey();
  if (!key) throw new MissingOpenAiKeyError();

  const input = text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) : text;

  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`OpenAI embeddings request failed (${response.status}): ${errBody}`);
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  const embedding = data.data[0]?.embedding;
  if (!embedding) throw new Error('Resposta da OpenAI não contém embedding');
  return embedding;
}
