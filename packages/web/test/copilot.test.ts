import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parsePrompt } from '../src/ai/copilot';

describe('parsePrompt', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('uses OpenAI when API key present', async () => {
    process.env.OPENAI_API_KEY = 'test';
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: JSON.stringify([{ id: 'undo', args: {} }]) } }],
      }),
    });
    const result = await parsePrompt('anything', mockFetch as any);
    expect(mockFetch).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'undo', args: {} }]);
  });

  describe('fallback', () => {
    beforeEach(() => {
      delete process.env.OPENAI_API_KEY;
    });

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

  it('falls back when OpenAI request fails', async () => {
    process.env.OPENAI_API_KEY = 'test';
    const mockFetch = vi.fn().mockRejectedValue(new Error('network'));
    const result = await parsePrompt('make it red', mockFetch as any);
    expect(result).toEqual([
      { id: 'setColor', args: { hex: '#ff0000' } },
    ]);
  });
});
