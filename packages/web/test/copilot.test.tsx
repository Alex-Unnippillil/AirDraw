/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { parsePrompt } from '../src/ai/copilot';
import { PrivacyProvider, isPrivacyEnabled } from '../src/context/PrivacyContext';

describe('parsePrompt', () => {
  beforeEach(() => {
    vi.stubGlobal('isPrivacyEnabled', isPrivacyEnabled);
  });
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


  it('bypasses network when privacy mode is enabled', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);
    process.env.OPENAI_API_KEY = 'test';
    render(<PrivacyProvider><div /></PrivacyProvider>);
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    });
    expect(await parsePrompt('do something else')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

});
