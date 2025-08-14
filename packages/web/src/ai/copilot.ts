import type { AppCommand } from '../commands';
import { isPrivacyEnabled } from '../context/PrivacyContext';

interface OpenAIResponse {
  choices?: { message?: { content?: string } }[];
}

/**
 * Parse a natural language prompt into application commands.
 * Uses simple keyword matches and falls back to OpenAI when privacy is disabled.
 */
export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const trimmed = prompt.trim().toLowerCase();

  if (trimmed.includes('undo')) {
    return [{ id: 'undo', args: {} }];
  }
  if (trimmed.includes('red')) {
    return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  }
  if (trimmed.includes('black')) {
    return [{ id: 'setColor', args: { hex: '#000000' } }];
  }

  if (isPrivacyEnabled() || !process.env.OPENAI_API_KEY) {
    return [];
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Respond with a JSON array of {id,args} commands.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
      }),
    });
    const data: OpenAIResponse = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
      return JSON.parse(content) as AppCommand[];
    }
  } catch {
    // ignore network or parsing errors
  }
  return [];
}

export default parsePrompt;
