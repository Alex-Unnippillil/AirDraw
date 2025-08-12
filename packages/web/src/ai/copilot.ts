import { AppCommand } from '../commands';

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  // Very small rule-based stub
  if (/undo/i.test(prompt)) return [{ id: 'undo', args: {} }];
  if (/red/i.test(prompt)) return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  return [];
}
