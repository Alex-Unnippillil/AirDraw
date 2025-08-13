import type { AppCommand } from '../commands';

interface KeywordMap {
  regex: RegExp;
  command: AppCommand;
}

const KEYWORDS: KeywordMap[] = [
  { regex: /undo/i, command: { id: 'undo', args: {} } },
  { regex: /red/i, command: { id: 'setColor', args: { hex: '#ff0000' } } },
  { regex: /black/i, command: { id: 'setColor', args: { hex: '#000000' } } },
];

export async function parsePrompt(prompt: string): Promise<AppCommand[]> {
  const commands: AppCommand[] = [];

  for (const { regex, command } of KEYWORDS) {
    if (regex.test(prompt)) {
      commands.push(command);
    }
  }

  return commands;
}

export type { AppCommand };
