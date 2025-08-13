import type { AppCommand } from '../commands';

/**
 * Very small keyword-based parser that turns text prompts into commands.
 * It only recognizes a few hard-coded intents which is sufficient for tests
 * and allows running without any external AI service.
 */
export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
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

export default parsePrompt;
