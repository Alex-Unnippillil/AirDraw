import type { AppCommand } from '../commands';

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const text = prompt.toLowerCase();
  if (text.includes('undo')) {
    return [{ id: 'undo', args: {} }];
  }
  if (text.includes('red')) {
    return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  }
  if (text.includes('black')) {
    return [{ id: 'setColor', args: { hex: '#000000' } }];
  }
  return [];
}

export default { parsePrompt };

