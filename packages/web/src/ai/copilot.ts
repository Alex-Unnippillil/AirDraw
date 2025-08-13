import type { AppCommand } from '../commands';

/** Keyword based fallback parser used when the LLM is unavailable. */
function fallbackParse(prompt: string): AppCommand[] {
  const p = prompt.toLowerCase();
  if (/undo/.test(p)) return [{ id: 'undo', args: {} }];
  if (p.includes('red')) return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  if (p.includes('black')) return [{ id: 'setColor', args: { hex: '#000000' } }];
  return [];
}

function isAppCommand(cmd: any): cmd is AppCommand {
  if (!cmd || typeof cmd !== 'object') return false;
  if (cmd.id === 'undo') return cmd.args && Object.keys(cmd.args).length === 0;
  if (cmd.id === 'setColor') return cmd.args && typeof cmd.args.hex === 'string';
  return false;
}

export async function parsePrompt(
  prompt: string,
  fetchImpl: typeof fetch = fetch
): Promise<AppCommand[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const res = await fetchImpl('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You translate user prompts into a JSON array of AppCommand objects. Each object must have an id and args and no additional text.',
            },
            { role: 'user', content: prompt },
          ],
        }),
      });
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === 'string') {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.every(isAppCommand)) {
          return parsed;
        }
      }
    } catch {
      /* ignore and fall back */
    }
  }
  return fallbackParse(prompt);
}

export default parsePrompt;
