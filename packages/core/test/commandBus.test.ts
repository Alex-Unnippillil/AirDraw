import { describe, it, expect } from 'vitest';
import { CommandBus, Command } from '../src/commands/commandBus';

describe('CommandBus', () => {
  it('dispatches and undoes commands', async () => {
    const bus = new CommandBus();
    let count = 0;
    bus.register('inc', () => { count++; });
    bus.register('undo:inc', () => { count--; });
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    bus.undo();
    expect(count).toBe(0);
  });
});
