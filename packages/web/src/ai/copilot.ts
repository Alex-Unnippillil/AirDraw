import { AppCommand } from '../commands';

export function parsePrompt(prompt: string): AppCommand[] {
  const p = prompt.toLowerCase();
  if (p.includes('undo')) {
    return [{ id: 'undo', args: {} }];
  }
  if (p.includes('red')) {
    return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  }
  if (p.includes('black')) {
    return [{ id: 'setColor', args: { hex: '#000000' } }];
  }
  return [];
}
