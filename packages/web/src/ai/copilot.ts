import type { AppCommand } from '../commands';

interface KeywordMapping {
  regex: RegExp;
  command: AppCommand;
}

const mappings: KeywordMapping[] = [
  {
    regex: /undo/i,
    command: { id: 'undo', args: {} },
  },
  {
    regex: /red/i,
    command: { id: 'setColor', args: { hex: '#ff0000' } },
  },
  {
    regex: /black/i,
    command: { id: 'setColor', args: { hex: '#000000' } },
  },
];

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const cmds: AppCommand[] = [];
  for (const { regex, command } of mappings) {
    if (regex.test(prompt)) {
      cmds.push(command);
    }
  }
  return cmds;
}

