import type { AppCommand } from '../commands';

// Very naive prompt parser used for tests/demo purposes.
// It looks for simple keywords in the input string and
// maps them to corresponding drawing commands.
export function parsePrompt(input: string): AppCommand[] {
  const text = input.toLowerCase();
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

