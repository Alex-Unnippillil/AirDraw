/**
 * @vitest-environment jsdom
 */
import 'fake-indexeddb/auto';
import React from 'react';
import { render, fireEvent, screen, waitFor, cleanup } from '@testing-library/react';
import { CommandBus } from '@airdraw/core';
import { CommandBusProvider } from '../src/context/CommandBusContext';
import type { AppCommands } from '../src/commands';
import { App } from '../src/main';
import { afterEach, describe, it, vi, expect } from 'vitest';

const mockCtx = { clearRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {} };
(HTMLCanvasElement.prototype as any).getContext = () => mockCtx;

const mockGesture = 'draw';

vi.mock('../src/hooks/useHandTracking', () => ({
  useHandTracking: () => ({ videoRef: { current: null }, gesture: mockGesture, error: null })
}));

  // Ensures saved strokes and color persist between reloads
  describe('storage persistence', () => {
  afterEach(() => {
    cleanup();
  });

  it('restores strokes and color after reload', async () => {
    const bus = new CommandBus<AppCommands>();
    render(
      <CommandBusProvider bus={bus}>
        <App />
      </CommandBusProvider>
    );
    const canvas = screen.getByTestId('drawing-canvas');

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20 });

    await bus.dispatch({ id: 'setColor', args: { hex: '#ff0000' } });

    fireEvent.pointerDown(canvas, { clientX: 30, clientY: 30 });
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 40 });
    fireEvent.pointerUp(canvas, { clientX: 40, clientY: 40 });

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes).toHaveLength(2);
    });

    cleanup();

    const bus2 = new CommandBus<AppCommands>();
    render(
      <CommandBusProvider bus={bus2}>
        <App />
      </CommandBusProvider>
    );

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes).toHaveLength(2);
      expect(strokes[1].color).toBe('#ff0000');
    });

    const canvas2 = screen.getByTestId('drawing-canvas');
    fireEvent.pointerDown(canvas2, { clientX: 50, clientY: 50 });
    fireEvent.pointerMove(canvas2, { clientX: 60, clientY: 60 });
    fireEvent.pointerUp(canvas2, { clientX: 60, clientY: 60 });

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes).toHaveLength(3);
      expect(strokes[2].color).toBe('#ff0000');
    });
  });
});
