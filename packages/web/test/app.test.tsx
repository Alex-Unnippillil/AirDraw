/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { App } from '../src/main';
import { CommandBusProvider } from '../src/context/CommandBusContext';
import { PrivacyProvider } from '../src/context/PrivacyContext';
import { CommandBus } from '@airdraw/core';
import type { AppCommands } from '../src/commands';
import { afterEach, describe, it, expect, vi } from 'vitest';

let mockGesture: string = 'idle';
let mockError: Error | null = null;
vi.mock('../src/hooks/useHandTracking', () => ({
  useHandTracking: () => ({ videoRef: { current: null }, gesture: mockGesture, error: mockError })
}));

vi.mock('../src/ai/copilot', () => ({
  parsePrompt: vi.fn()
}));
import { parsePrompt } from '../src/ai/copilot';

(HTMLCanvasElement.prototype as any).getContext = () => ({
  clearRect: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  stroke: () => {},
  closePath: () => {},
  lineJoin: '',
  strokeStyle: '',
  lineWidth: 0
});

describe('App', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockGesture = 'idle';
    mockError = null;
  });
    it('shows palette only when gesture is palette', () => {
      const bus = new CommandBus<AppCommands>();
      const { rerender } = render(
        <CommandBusProvider bus={bus}>
          <PrivacyProvider>
            <App />
          </PrivacyProvider>
        </CommandBusProvider>
      );
      expect(screen.queryByText('Black')).toBeNull();
      mockGesture = 'palette';
      rerender(
        <CommandBusProvider bus={bus}>
          <PrivacyProvider>
            <App />
          </PrivacyProvider>
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
          <PrivacyProvider>
            <App />
          </PrivacyProvider>
        </CommandBusProvider>
      );
      const input = screen.getByPlaceholderText('prompt');
      fireEvent.change(input, { target: { value: 'undo' } });
      fireEvent.submit(input.closest('form')!);
      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith({ id: 'undo', args: {} });
      });
    });

    it('renders error from hand tracking', () => {
      const bus = new CommandBus<AppCommands>();
      mockError = new Error('camera denied');
      render(
        <CommandBusProvider bus={bus}>
          <PrivacyProvider>
            <App />
          </PrivacyProvider>
        </CommandBusProvider>
      );
      expect(screen.getByRole('alert').textContent).toContain('camera denied');
    });

    it('skips network features when privacy enabled', async () => {
      (parsePrompt as any).mockResolvedValue([]);
      const bus = new CommandBus<AppCommands>();
      render(
        <CommandBusProvider bus={bus}>
          <PrivacyProvider>
            <App />
          </PrivacyProvider>
        </CommandBusProvider>
      );
      fireEvent.keyDown(window, { code: 'Space' });
      const input = screen.getByPlaceholderText('prompt');
      fireEvent.change(input, { target: { value: 'undo' } });
      fireEvent.submit(input.closest('form')!);
      await waitFor(() => {
        expect(parsePrompt).not.toHaveBeenCalled();
      });
    });
  });
