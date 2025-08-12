import { describe, it, expect } from 'vitest';
import { parsePrompt } from '../src/ai/copilot';

describe('parsePrompt', () => {
  it('translates a single command', async () => {
    const res = await parsePrompt('make it red');
    expect(res.commands).toEqual([{ id: 'setColor', args: { hex: '#ff0000' } }]);
    expect(res.plan).toEqual(['1. Set color to red']);
  });

  it('supports multi-command macros', async () => {
    const res = await parsePrompt('make it red and undo');
    expect(res.commands).toEqual([
      { id: 'setColor', args: { hex: '#ff0000' } },
      { id: 'undo', args: {} }
    ]);
    expect(res.plan).toEqual(['1. Set color to red', '2. Undo last action']);
  });
});
