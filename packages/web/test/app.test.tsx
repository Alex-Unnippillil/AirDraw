/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '../src/main';
import { CommandBusProvider } from '../src/context/CommandBusContext';
import { CommandBus } from '@airdraw/core';
import type { AppCommands } from '../src/commands';
import { afterEach, describe, it, expect, vi } from 'vitest';

let mockGesture: string = 'idle';
vi.mock('../src/hooks/useHandTracking', () => ({
  useHandTracking: () => ({ videoRef: { current: null }, gesture: mockGesture })
}));

vi.mock('../src/ai/copilot', () => ({
  parsePrompt: vi.fn()
}));
import { parsePrompt } from '../src/ai/copilot';

describe('App', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockGesture = 'idle';
  });
    it('shows palette only when gesture is palette', () => {
      const bus = new CommandBus<AppCommands>();
      const { rerender } = render(
        <CommandBusProvider bus={bus}>
          <App />
        </CommandBusProvider>
      );
      expect(screen.queryByText('Black')).toBeNull();
      mockGesture = 'palette';
      rerender(
        <CommandBusProvider bus={bus}>
          <App />
        </CommandBusProvider>
      );
      expect(screen.queryByText('Black')).not.toBeNull();
    });

    it('dispatches commands from prompt', async () => {
      (parsePrompt as any).mockResolvedValue([{ id: 'undo', args: {} }]);
      const bus = new CommandBus<AppCommands>();
      const dispatchSpy = vi.spyOn(bus, 'dispatch');
      render(
        <CommandBusProvider bus={bus}>
          <App />
        </CommandBusProvider>
      );
      const input = screen.getByPlaceholderText('prompt');
      fireEvent.change(input, { target: { value: 'undo' } });
      fireEvent.submit(input.closest('form')!);
      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith({ id: 'undo', args: {} });
      });
    });
});
