import { describe, it, expect, vi, afterEach } from 'vitest';
import { parsePrompt } from '../src/ai/copilot';

const originalFetch = global.fetch;
const originalKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  global.fetch = originalFetch;
  process.env.OPENAI_API_KEY = originalKey;
  vi.restoreAllMocks();
});

describe('parsePrompt', () => {
  it('returns commands from LLM API when available', async () => {
    process.env.OPENAI_API_KEY = 'test';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify([{ id: 'undo', args: {} }]),
              },
            },
          ],
        }),
    } as any);
    const cmds = await parsePrompt('undo the last action');
    expect(cmds).toEqual([{ id: 'undo', args: {} }]);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('falls back to rule-based parser on error', async () => {
    process.env.OPENAI_API_KEY = 'test';
    global.fetch = vi.fn().mockRejectedValue(new Error('network'));
    const cmds = await parsePrompt('make it red');
    expect(cmds).toEqual([{ id: 'setColor', args: { hex: '#ff0000' } }]);
  });
});

