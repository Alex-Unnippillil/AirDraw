import { describe, it, expect } from 'vitest';
import { CommandBus, Command } from '../src/commands/commandBus';

describe('CommandBus', () => {
  it('dispatches, undoes, and redoes commands', async () => {
    const bus = new CommandBus();
    let count = 0;
    bus.register('inc', () => { count++; });
    bus.register('undo:inc', () => { count--; });
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    await bus.undo();
    expect(count).toBe(0);
    await bus.redo();
    expect(count).toBe(1);
  });
});
