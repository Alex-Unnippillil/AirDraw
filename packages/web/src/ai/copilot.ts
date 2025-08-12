import { AppCommand } from '../commands';

/**
 * Parse a natural language prompt into application commands.
 */
export function parsePrompt(text: string): AppCommand[] {
  const normalized = text.toLowerCase();

  if (normalized.includes('undo')) {
    return [{ id: 'undo', args: {} }];
  }

  if (normalized.includes('red')) {
    return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  }

  if (normalized.includes('black')) {
    return [{ id: 'setColor', args: { hex: '#000000' } }];
  }

  return [];
}
