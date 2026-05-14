import { ipcMain } from 'electron';
import { listErrors, clearErrors, dismissError } from '../services/error-detector';
import { getOpenAiKey } from '../services/secrets';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

async function explainError(stack: string): Promise<string> {
  const key = getOpenAiKey();
  if (!key) throw new Error('OpenAI API key não configurada.');
  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Você é um assistente de debugging. Explique o erro abaixo em português brasileiro, em até 5 linhas: o que ele significa, a causa mais provável e a primeira coisa a verificar. Seja direto.',
        },
        { role: 'user', content: stack.slice(0, 8000) },
      ],
      temperature: 0.2,
      max_tokens: 400,
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OpenAI request failed (${response.status}): ${body}`);
  }
  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message.content?.trim() ?? '(resposta vazia)';
}

export function registerDebugIpc(): void {
  ipcMain.handle('debug:list', (event) => listErrors(event.sender.id));
  ipcMain.handle('debug:clear', (event) => clearErrors(event.sender.id));
  ipcMain.handle('debug:dismiss', (event, id: string) => dismissError(event.sender.id, id));
  ipcMain.handle('debug:explain', async (_event, payload: { stack: string }) => {
    return explainError(payload.stack);
  });
}
