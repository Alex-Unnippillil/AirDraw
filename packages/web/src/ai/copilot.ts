import type { AppCommand } from '../commands';

/**
 * Parse a natural language prompt into application commands.
 *
 * @param text Prompt provided by the user.
 * @returns A list of commands inferred from the prompt.
 */
export async function parsePrompt(text: string): Promise<AppCommand[]> {
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

