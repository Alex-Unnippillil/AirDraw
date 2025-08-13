import type { AppCommand } from '../commands';

const colorMap: Record<string, string> = {
  red: '#ff0000',
  black: '#000000',
};

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const p = prompt.toLowerCase();
  const cmds: AppCommand[] = [];

  if (p.includes('undo')) {
    cmds.push({ id: 'undo', args: {} });
  }

  for (const [name, hex] of Object.entries(colorMap)) {
    if (p.includes(name)) {
      cmds.push({ id: 'setColor', args: { hex } });
      break;
    }
  }

  return cmds;
}
