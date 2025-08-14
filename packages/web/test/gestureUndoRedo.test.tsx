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
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockCtx = { clearRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {} };
(HTMLCanvasElement.prototype as any).getContext = () => mockCtx;

let mockGesture = 'draw';

vi.mock('../src/hooks/useHandTracking', () => ({
  useHandTracking: () => ({ videoRef: { current: null }, gesture: mockGesture, error: null })
}));

describe('gesture undo/redo', () => {
  afterEach(() => {
    cleanup();
    mockGesture = 'draw';
  });

  it('dispatches undo and redo when swiping', async () => {
    const bus = new CommandBus<AppCommands>();
    const { rerender } = render(
      <CommandBusProvider bus={bus}>
        <App />
      </CommandBusProvider>
    );

    const canvas = screen.getByTestId('drawing-canvas');

    // draw two strokes
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas, { clientX: 20, clientY: 20 });

    fireEvent.pointerDown(canvas, { clientX: 30, clientY: 30 });
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 40 });
    fireEvent.pointerUp(canvas, { clientX: 40, clientY: 40 });

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes).toHaveLength(2);
    });

    // swipe left -> undo
    mockGesture = 'swipeLeft';
    rerender(
      <CommandBusProvider bus={bus}>
        <App />
      </CommandBusProvider>
    );

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes).toHaveLength(1);
    });

    // swipe right -> redo
    mockGesture = 'swipeRight';
    rerender(
      <CommandBusProvider bus={bus}>
        <App />
      </CommandBusProvider>
    );

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes).toHaveLength(2);
    });
  });
});

