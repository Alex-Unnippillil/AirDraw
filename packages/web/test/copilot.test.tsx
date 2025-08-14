/**
 * @vitest-environment jsdom
 */
// Tests for keyword-based copilot prompt parser
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { parsePrompt } from '../src/ai/copilot';
import { PrivacyProvider } from '../src/context/PrivacyContext';
import { render, cleanup, act } from '@testing-library/react';

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

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete process.env.OPENAI_API_KEY;
  });

  it('skips openai when privacy is enabled', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);
    process.env.OPENAI_API_KEY = 'test';
    render(<PrivacyProvider><div /></PrivacyProvider>);
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    });
    await parsePrompt('unknown');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls openai when privacy is disabled', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [
          { message: { content: '[{"id":"undo","args":{}}]' } },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    process.env.OPENAI_API_KEY = 'test';
    render(<PrivacyProvider><div /></PrivacyProvider>);
    const result = await parsePrompt('unknown');
    expect(fetchMock).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'undo', args: {} }]);
  });
});

