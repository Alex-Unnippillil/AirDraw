/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, screen, waitFor, cleanup } from '@testing-library/react';
import { CommandBus } from '@airdraw/core';
import { CommandBusProvider } from '../src/context/CommandBusContext';
import type { AppCommands } from '../src/commands';
import { App } from '../src/main';
import { clearDb } from '../src/storage/indexedDb';
import { afterEach, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';

let mockGesture = 'draw';
vi.mock('../src/hooks/useHandTracking', () => ({
  useHandTracking: () => ({ videoRef: { current: null }, gesture: mockGesture, error: null })
}));

describe('persistence', () => {
  const projectId = 'test-project';

  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn();
  });

  beforeEach(async () => {
    await clearDb();
  });

  afterEach(() => {
    cleanup();
    mockGesture = 'draw';
  });

  it('restores strokes and color across reloads', async () => {
    const bus = new CommandBus<AppCommands>();
    const { unmount } = render(
      <CommandBusProvider bus={bus}>
        <App projectId={projectId} />
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

    unmount();

    const bus2 = new CommandBus<AppCommands>();
    render(
      <CommandBusProvider bus={bus2}>
        <App projectId={projectId} />
      </CommandBusProvider>
    );

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes.length).toBe(2);
      expect(strokes[1].color).toBe('#ff0000');
    });

    const canvas2 = screen.getByTestId('drawing-canvas');
    fireEvent.pointerDown(canvas2, { clientX: 50, clientY: 50 });
    fireEvent.pointerMove(canvas2, { clientX: 60, clientY: 60 });
    fireEvent.pointerUp(canvas2, { clientX: 60, clientY: 60 });

    await waitFor(() => {
      const strokes = JSON.parse(screen.getByTestId('strokes').textContent!);
      expect(strokes.length).toBe(3);
      expect(strokes[2].color).toBe('#ff0000');
    });
  });
});
