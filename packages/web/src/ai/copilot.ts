import type { AppCommand } from '../commands';

const COLOR_KEYWORDS: Record<string, string> = {
  red: '#ff0000',
  black: '#000000'
};

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const p = prompt.toLowerCase();
  if (p.includes('undo')) {
    return [{ id: 'undo', args: {} }];
  }
  for (const [word, hex] of Object.entries(COLOR_KEYWORDS)) {
    if (p.includes(word)) {
      return [{ id: 'setColor', args: { hex } }];
    }
  }
  return [];
}

export default parsePrompt;

