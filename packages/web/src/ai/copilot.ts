import { AppCommand } from '../commands';

/**
 * Parse a free form user prompt into application commands.
 *
 * This lightweight parser understands a handful of basic intents and
 * translates them into the `AppCommand` structures used by the rest of the
 * application.  Unrecognised prompts result in an empty command list.
 */
export function parsePrompt(prompt: string): AppCommand[] {
  const lower = prompt.toLowerCase();

  if (lower.includes('undo')) {
    return [{ id: 'undo', args: {} }];
  }

  if (lower.includes('red')) {
    return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  }

  if (lower.includes('black')) {
    return [{ id: 'setColor', args: { hex: '#000000' } }];
  }

  return [];
}

