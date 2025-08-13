import type { AppCommand } from '../commands';

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const lower = prompt.toLowerCase();
  if (lower.includes('undo')) {
    return [{ id: 'undo', args: {} } as AppCommand];
  }
  if (lower.includes('red')) {
    return [{ id: 'setColor', args: { hex: '#ff0000' } } as AppCommand];
  }
  if (lower.includes('black')) {
    return [{ id: 'setColor', args: { hex: '#000000' } } as AppCommand];
  }
  return [];
}
