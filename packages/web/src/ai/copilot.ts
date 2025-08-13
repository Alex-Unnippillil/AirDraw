import type { AppCommand } from '../commands';

interface KeywordMapping {
  regex: RegExp;
  create: () => AppCommand;
}

const mappings: KeywordMapping[] = [
  { regex: /undo/i, create: () => ({ id: 'undo', args: {} }) },
  { regex: /red/i, create: () => ({ id: 'setColor', args: { hex: '#ff0000' } }) },
  { regex: /black/i, create: () => ({ id: 'setColor', args: { hex: '#000000' } }) },
];

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const commands: AppCommand[] = [];

  for (const { regex, create } of mappings) {
    if (regex.test(prompt)) {
      commands.push(create());
    }
  }

  return commands;
}

