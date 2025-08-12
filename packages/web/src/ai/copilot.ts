import { Command } from '@airdraw/core';

export interface PlanResult {
  plan: string[];
  commands: Command[];
}

const COLORS: Record<string, string> = {
  red: '#ff0000',
  blue: '#0000ff',
  green: '#00ff00',
};

function describe(cmd: Command): string {
  switch (cmd.id) {
    case 'undo':
      return 'Undo last action';
    case 'setColor':
      switch (cmd.args.hex) {
        case '#ff0000':
          return 'Set color to red';
        case '#0000ff':
          return 'Set color to blue';
        case '#00ff00':
          return 'Set color to green';
        default:
          return `Set color to ${cmd.args.hex}`;
      }
    default:
      return cmd.id;
  }
}

export async function parsePrompt(prompt: string): Promise<PlanResult> {
  const segments = prompt
    .split(/\s*(?:and|then|,)\s*/i)
    .map(s => s.trim())
    .filter(Boolean);

  const commands: Command[] = [];
  for (const seg of segments) {
    if (/undo/i.test(seg)) {
      commands.push({ id: 'undo', args: {} });
      continue;
    }

    const colorMatch = seg.match(/\b(red|blue|green)\b/i);
    if (colorMatch) {
      const color = colorMatch[1].toLowerCase();
      commands.push({ id: 'setColor', args: { hex: COLORS[color] } });
    }
  }

  const plan = commands.map((cmd, idx) => `${idx + 1}. ${describe(cmd)}`);
  return { plan, commands };
}
