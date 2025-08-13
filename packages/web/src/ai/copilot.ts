import type { AppCommand } from '../commands';

/**
 * Very small keyword-based prompt parser used for tests.
 * Returns commands corresponding to recognized words in the prompt.
 */
export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const text = prompt.toLowerCase();
  const cmds: AppCommand[] = [];

  if (text.includes('undo')) {
    cmds.push({ id: 'undo', args: {} });
  }
  if (text.includes('red')) {
    cmds.push({ id: 'setColor', args: { hex: '#ff0000' } });
  }
  if (text.includes('black')) {
    cmds.push({ id: 'setColor', args: { hex: '#000000' } });
  }

  return cmds;
}

export default { parsePrompt };

