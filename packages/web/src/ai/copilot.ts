import type { AppCommand } from '../commands';

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
