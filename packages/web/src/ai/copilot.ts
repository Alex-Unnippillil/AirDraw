import type { Command } from '@airdraw/core';

export async function parsePrompt(prompt: string): Promise<Command[]> {
  const text = prompt.trim().toLowerCase();
  if (text.includes('undo')) return [{ id: 'undo', args: {} }];
  if (text.includes('red')) return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  if (text.includes('black')) return [{ id: 'setColor', args: { hex: '#000000' } }];
  return [];
}
