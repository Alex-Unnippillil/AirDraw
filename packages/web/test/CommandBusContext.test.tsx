/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { CommandBus } from '@airdraw/core';
import type { AppCommands } from '../src/commands';
import { CommandBusProvider, useCommandBus } from '../src/context/CommandBusContext';

describe('CommandBusContext', () => {
  it('provides the given bus and dispatches commands', async () => {
    const bus = new CommandBus<AppCommands>();
    const dispatchSpy = vi.spyOn(bus, 'dispatch');
    let hookBus: CommandBus<AppCommands> | null = null;

    function TestComponent() {
      const b = useCommandBus();
      hookBus = b;
      React.useEffect(() => {
        b.dispatch({ id: 'undo', args: {} });
      }, [b]);
      return null;
    }

    render(
      <CommandBusProvider bus={bus}>
        <TestComponent />
      </CommandBusProvider>
    );

    expect(hookBus).toBe(bus);
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith({ id: 'undo', args: {} });
    });
  });
});

