import { Command } from '@airdraw/core';

export async function parsePrompt(prompt: string): Promise<Command[]> {
  // Very small rule-based stub
  if (/undo/i.test(prompt)) return [{ id: 'undo', args: {} }];
  if (/red/i.test(prompt)) return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  return [];
}
