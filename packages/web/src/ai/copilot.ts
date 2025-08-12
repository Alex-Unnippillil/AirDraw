import { AppCommand } from '../commands';

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return JSON.parse(text) as AppCommand[];
        }
      }
    } catch {
      // fall through to rule-based parser
    }
  }

  if (/undo/i.test(prompt)) return [{ id: 'undo', args: {} }];
  if (/red/i.test(prompt)) return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  return [];
}
