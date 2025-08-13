/**
 * @vitest-environment jsdom
 */
import 'fake-indexeddb/auto';
import React from 'react';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, afterEach, expect, vi } from 'vitest';
vi.mock('../src/hooks/useHandTracking', () => ({
  useHandTracking: () => ({ videoRef: { current: null }, gesture: 'palette', error: null })
}));
import { CommandBus } from '@airdraw/core';
import type { AppCommands } from '../src/commands';
import { CommandBusProvider } from '../src/context/CommandBusContext';
import { App } from '../src/main';

const deleteDb = () =>
  new Promise<void>(resolve => {
    const req = indexedDB.deleteDatabase('airdraw');
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });

describe('persistence', () => {
  afterEach(async () => {
    cleanup();
    await deleteDb();
  });

  it('persists strokes and palette across reloads', async () => {
    const bus = new CommandBus<AppCommands>();
    const renderApp = () =>
      render(
        <CommandBusProvider bus={bus}>
          <App projectId="p1" />
        </CommandBusProvider>
      );

    const { getByText, getByTestId, unmount } = renderApp();

    fireEvent.click(getByText('Red'));
    await bus.dispatch({ id: 'addStroke', args: { stroke: { points: [], color: '#ff0000' } } });
    await waitFor(() => {
      expect(getByTestId('stroke-count').textContent).toBe('1');
    });

    unmount();

    const { getByTestId: getByTestId2 } = renderApp();
    await waitFor(() => {
      expect(getByTestId2('stroke-count').textContent).toBe('1');
      expect(getByTestId2('selected-color').textContent).toBe('#ff0000');
    });
  });
});
