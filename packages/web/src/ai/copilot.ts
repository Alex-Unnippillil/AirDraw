import type { AppCommand } from '../commands';
import { isPrivacyEnabled } from '../context/PrivacyContext';

const KEYWORD_CMDS: Array<[RegExp, AppCommand]> = [
  [/undo/i, { id: 'undo', args: {} }],
  [/red/i, { id: 'setColor', args: { hex: '#ff0000' } }],
  [/black/i, { id: 'setColor', args: { hex: '#000000' } }],
];

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (isPrivacyEnabled() || !apiKey) {
    for (const [re, cmd] of KEYWORD_CMDS) {
      if (re.test(prompt)) return [cmd];
    }
    return [];
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Return JSON array of drawing commands.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return [];
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];
    const cmds: AppCommand[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const { id, args } = item as any;
      if (id === 'setColor' && args && typeof args.hex === 'string') {
        cmds.push({ id: 'setColor', args: { hex: args.hex } });
      } else if (id === 'undo' && args && Object.keys(args).length === 0) {
        cmds.push({ id: 'undo', args: {} });
      } else if (id === 'redo' && args && Object.keys(args).length === 0) {
        cmds.push({ id: 'redo', args: {} });
      }
    }
    return cmds;
  } catch {
    return [];
  }
}
