// Tests for copilot prompt parser
import { describe, it, expect, vi, afterEach } from 'vitest';
import { parsePrompt } from '../src/ai/copilot';

const undoCommand = { id: 'undo', args: {} } as const;

describe('parsePrompt', () => {
  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    vi.restoreAllMocks();
  });

  it('uses OpenAI when api key is set', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [
          { message: { content: JSON.stringify([undoCommand]) } },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(parsePrompt('anything')).resolves.toEqual([undoCommand]);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('falls back to regex when request fails', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const fetchMock = vi.fn().mockRejectedValue(new Error('fail'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(parsePrompt('undo please')).resolves.toEqual([undoCommand]);
  });

  it('handles red intent', async () => {
    await expect(parsePrompt('make it red')).resolves.toEqual([
      { id: 'setColor', args: { hex: '#ff0000' } },
    ]);
  });

  it('handles black intent', async () => {
    await expect(parsePrompt('switch to black')).resolves.toEqual([
      { id: 'setColor', args: { hex: '#000000' } },
    ]);
  });

  it('returns empty array for unknown prompts', async () => {
    await expect(parsePrompt('do something else')).resolves.toEqual([]);
  });
});

