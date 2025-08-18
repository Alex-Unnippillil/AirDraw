import { isPrivacyEnabled } from '../context/PrivacyContext';
import type { AppCommand } from '../commands';

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  if (isPrivacyEnabled()) {
    return [];
  }

  const lower = prompt.toLowerCase();

  if (lower.includes('undo')) {
    return [{ id: 'undo', args: {} }];
  }
  if (lower.includes('red')) {
    return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  }
  if (lower.includes('black')) {
    return [{ id: 'setColor', args: { hex: '#000000' } }];
  }

  if (process.env.OPENAI_API_KEY) {
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
            {
              role: 'system',
              content: 'Return a JSON array of AppCommand objects.'
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0,
        }),
      });
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        try {
          const cmds = JSON.parse(content);
          if (Array.isArray(cmds)) {
            return cmds as AppCommand[];
          }
        } catch {
          // fall through to return []
        }
      }
    } catch {
      // ignore network errors
    }
  }

  return [];
}

export default parsePrompt;
