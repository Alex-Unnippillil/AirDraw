import type { AppCommand } from '../commands';

/**
 * Very small prompt parser used in tests. In the real app this would call out to
 * an OpenAI endpoint but we keep it simple and deterministic for testing.
 */
export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
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
