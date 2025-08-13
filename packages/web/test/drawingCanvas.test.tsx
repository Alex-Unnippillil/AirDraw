/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, screen, waitFor, cleanup } from '@testing-library/react';
import { CommandBus } from '@airdraw/core';
import { CommandBusProvider } from '../src/context/CommandBusContext';
import type { AppCommands } from '../src/commands';
import { App } from '../src/main';
import { PrivacyProvider } from '../src/context/PrivacyContext';
import { afterEach, describe, it, vi, expect, beforeAll } from 'vitest';

beforeAll(() => {
  (HTMLCanvasElement.prototype as any).getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  }));
});

let mockGesture = 'draw';

vi.mock('../src/hooks/useHandTracking', () => ({
  useHandTracking: () => ({ videoRef: { current: null }, gesture: mockGesture, error: null })
}));

describe('DrawingCanvas integration', () => {
  afterEach(() => {
    cleanup();
    mockGesture = 'draw';
    localStorage.clear();
  });

  it('applies color changes to new strokes', async () => {
    const bus = new CommandBus<AppCommands>();
    render(
      <CommandBusProvider bus={bus}>
        <PrivacyProvider>
          <App />
        </PrivacyProvider>
      </CommandBusProvider>
    );
    const canvas = screen.getByTestId('drawing-canvas');

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20 });

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes.length).toBe(1);
      expect(strokes[0].color).toBe('#000000');
    });

    await bus.dispatch({ id: 'setColor', args: { hex: '#ff0000' } });

    fireEvent.pointerDown(canvas, { clientX: 30, clientY: 30 });
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 40 });
    fireEvent.pointerUp(canvas, { clientX: 40, clientY: 40 });

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes.length).toBe(2);
      expect(strokes[1].color).toBe('#ff0000');
    });
  });

  it('removes the last stroke on undo command', async () => {
    const bus = new CommandBus<AppCommands>();
    render(
      <CommandBusProvider bus={bus}>
        <PrivacyProvider>
          <App />
        </PrivacyProvider>
      </CommandBusProvider>
    );
    const canvas = screen.getByTestId('drawing-canvas');

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20 });

    fireEvent.pointerDown(canvas, { clientX: 30, clientY: 30 });
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 40 });
    fireEvent.pointerUp(canvas, { clientX: 40, clientY: 40 });

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes.length).toBe(2);
    });

    await bus.dispatch({ id: 'undo', args: {} });

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes.length).toBe(1);
    });
  });
});
