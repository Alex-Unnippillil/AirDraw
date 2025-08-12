import { describe, it, expect } from 'vitest';
import { parsePrompt } from '../src/ai/copilot';

describe('parsePrompt', () => {
  it('handles undo intent', () => {
    expect(parsePrompt('undo the last action')).toEqual([
      { id: 'undo', args: {} },
    ]);
  });

  it('handles red intent', () => {
    expect(parsePrompt('make it red')).toEqual([
      { id: 'setColor', args: { hex: '#ff0000' } },
    ]);
  });

  it('handles black intent', () => {
    expect(parsePrompt('switch to black')).toEqual([
      { id: 'setColor', args: { hex: '#000000' } },
    ]);
  });

  it('returns empty array for unknown prompts', () => {
    expect(parsePrompt('do something else')).toEqual([]);
  });
});

