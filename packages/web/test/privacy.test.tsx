/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, screen, waitFor, cleanup } from '@testing-library/react';
import { CommandBus } from '@airdraw/core';
import type { AppCommands } from '../src/commands';
import { CommandBusProvider } from '../src/context/CommandBusContext';
import { PrivacyProvider } from '../src/context/PrivacyContext';
import { App } from '../src/main';
import { parsePrompt } from '../src/ai/copilot';
import { saveProject } from '../src/storage/indexedDb';
import { describe, it, afterEach, vi, expect, beforeAll } from 'vitest';

beforeAll(() => {
  (HTMLCanvasElement.prototype as any).getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn()
  }));
});

vi.mock('../src/hooks/useHandTracking', () => ({
  useHandTracking: () => ({ videoRef: { current: null }, gesture: 'idle', error: null })
}));

vi.mock('../src/ai/copilot', () => ({
  parsePrompt: vi.fn()
}));

describe('privacy and persistence', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('toggles privacy with spacebar and gates network calls', async () => {
    (parsePrompt as any).mockResolvedValue([]);
    const bus = new CommandBus<AppCommands>();
    render(
      <CommandBusProvider bus={bus}>
        <PrivacyProvider>
          <App />
        </PrivacyProvider>
      </CommandBusProvider>
    );

    const input = screen.getByPlaceholderText('prompt');
    fireEvent.change(input, { target: { value: 'cmd' } });
    fireEvent.submit(input.closest('form')!);
    expect(parsePrompt).not.toHaveBeenCalled();
    expect(screen.queryByTestId('camera-indicator')).toBeNull();

    fireEvent.keyDown(window, { key: ' ', code: 'Space' });
    expect(screen.getByTestId('camera-indicator')).not.toBeNull();

    fireEvent.change(input, { target: { value: 'cmd2' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => {
      expect(parsePrompt).toHaveBeenCalled();
    });
  });

  it('restores saved strokes on startup', async () => {
    await saveProject('default', { strokes: [{ color: '#000', points: [{ x: 1, y: 2 }] }], settings: { color: '#000' } });
    const bus = new CommandBus<AppCommands>();
    render(
      <CommandBusProvider bus={bus}>
        <PrivacyProvider>
          <App />
        </PrivacyProvider>
      </CommandBusProvider>
    );
    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes.length).toBe(1);
    });
  });
});
