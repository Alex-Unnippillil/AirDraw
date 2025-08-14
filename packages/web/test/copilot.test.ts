import { describe, it, expect, vi, afterEach } from 'vitest';
import { parsePrompt } from '../src/ai/copilot';
import * as privacy from '../src/context/PrivacyContext';

const originalEnv = process.env.OPENAI_API_KEY;

afterEach(() => {
  process.env.OPENAI_API_KEY = originalEnv;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('parsePrompt', () => {
  it('returns keyword command when no api key', async () => {
    vi.spyOn(privacy, 'isPrivacyEnabled').mockReturnValue(false);
    delete process.env.OPENAI_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const cmds = await parsePrompt('undo the last action');
    expect(cmds).toEqual([{ id: 'undo', args: {} }]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls openai and parses response', async () => {
    vi.spyOn(privacy, 'isPrivacyEnabled').mockReturnValue(false);
    process.env.OPENAI_API_KEY = 'test';
    const response = [{ id: 'setColor', args: { hex: '#ff0000' } }];
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(response) } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const cmds = await parsePrompt('make it red');
    expect(cmds).toEqual(response);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('skips openai when privacy enabled', async () => {
    vi.spyOn(privacy, 'isPrivacyEnabled').mockReturnValue(true);
    process.env.OPENAI_API_KEY = 'test';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const cmds = await parsePrompt('undo');
    expect(cmds).toEqual([{ id: 'undo', args: {} }]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
