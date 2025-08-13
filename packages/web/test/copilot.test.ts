// Tests for keyword-based copilot prompt parser
import { describe, it, expect } from 'vitest';
import { parsePrompt } from '../src/ai/copilot';
import type { AppCommand } from '../src/commands';

describe('parsePrompt', () => {
  const cases: Array<[string, AppCommand[]]> = [
    ['undo the last action', [{ id: 'undo', args: {} }]],
    ['make it red', [{ id: 'setColor', args: { hex: '#ff0000' } }]],
    ['switch to black', [{ id: 'setColor', args: { hex: '#000000' } }]],
    ['do something else', []],
  ];

  cases.forEach(([prompt, expected]) => {
    it(`parses "${prompt}"`, async () => {
      expect(await parsePrompt(prompt)).toEqual(expected);
    });
  });
});
