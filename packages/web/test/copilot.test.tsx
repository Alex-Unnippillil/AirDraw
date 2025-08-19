/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { CommandBus } from '@airdraw/core';
import { parsePrompt, runPrompt } from '../src/ai/copilot';
import { PrivacyProvider, isPrivacyEnabled } from '../src/context/PrivacyContext';
import type { AppCommands } from '../src/commands';

describe('copilot', () => {
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

  it('dispatches commands through the command bus', async () => {
    const bus = new CommandBus<AppCommands>();
    const spy = vi.spyOn(bus, 'dispatch');
    await runPrompt(bus, 'undo the last action');
    expect(spy).toHaveBeenCalledWith({ id: 'undo', args: {} });
  });

  it('supports dry-run preview without dispatching', async () => {
    const bus = new CommandBus<AppCommands>();
    const spy = vi.spyOn(bus, 'dispatch');
    const cmds = await runPrompt(bus, 'make it red', { dryRun: true });
    expect(cmds).toEqual([{ id: 'setColor', args: { hex: '#ff0000' } }]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('parses commands from API responses', async () => {
    process.env.OPENAI_API_KEY = 'test';
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [
          { message: { content: '[{"id":"undo","args":{}}]' } }
        ]
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const bus = new CommandBus<AppCommands>();
    expect(await runPrompt(bus, 'anything')).toEqual([
      { id: 'undo', args: {} },
    ]);
    expect(fetchMock).toHaveBeenCalled();
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
