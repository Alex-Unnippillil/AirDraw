/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { parsePrompt } from '../src/ai/copilot';
import { PrivacyProvider } from '../src/context/PrivacyContext';

describe('parsePrompt', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete process.env.OPENAI_API_KEY;
  });

  it('handles keyword intents', async () => {
    expect(await parsePrompt('undo the last action')).toEqual([
      { id: 'undo', args: {} },
    ]);
    expect(await parsePrompt('make it red')).toEqual([
      { id: 'setColor', args: { hex: '#ff0000' } },
    ]);
    expect(await parsePrompt('switch to black')).toEqual([
      { id: 'setColor', args: { hex: '#000000' } },
    ]);
    expect(await parsePrompt('do something else')).toEqual([]);
  });

  it('calls openai when api key is present', async () => {
    process.env.OPENAI_API_KEY = 'key';
    const commands = [{ id: 'undo', args: {} }];
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(commands) } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    expect(await parsePrompt('anything')).toEqual(commands);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('bypasses openai when privacy is enabled', async () => {
    process.env.OPENAI_API_KEY = 'key';
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);
    render(<PrivacyProvider><div /></PrivacyProvider>);
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    });
    expect(await parsePrompt('undo the last action')).toEqual([
      { id: 'undo', args: {} },
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
