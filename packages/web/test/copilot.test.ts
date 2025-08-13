// Tests for keyword-based copilot prompt parser
import { describe, it, expect } from 'vitest';
import { parsePrompt } from '../src/ai/copilot';

describe('parsePrompt', () => {
  it('handles undo intent', async () => {
    expect(await parsePrompt('undo the last action')).toEqual([
      { id: 'undo', args: {} },
    ]);
  });

  it('handles red intent', async () => {
    expect(await parsePrompt('make it red')).toEqual([
      { id: 'setColor', args: { hex: '#ff0000' } },
    ]);
  });

  it('handles black intent', async () => {
    expect(await parsePrompt('switch to black')).toEqual([
      { id: 'setColor', args: { hex: '#000000' } },
    ]);
  });

  it('returns empty array for unknown prompts', async () => {
    expect(await parsePrompt('do something else')).toEqual([]);
  });
});

