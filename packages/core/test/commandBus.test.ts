import { describe, it, expect } from 'vitest';
import { CommandBus } from '../src/commands/commandBus';

describe('CommandBus', () => {
  it('dispatches and undoes commands', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    bus.register('inc', () => { count++; });
    bus.register('undo:inc', () => { count--; });
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    bus.undo();
    expect(count).toBe(0);
  });

  it('redos commands without losing handlers', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    bus.register('inc', () => { count++; });
    bus.register('undo:inc', () => { count--; });
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    bus.undo();
    expect(count).toBe(0);
    await bus.redo();
    expect(count).toBe(1);
    bus.undo();
    expect(count).toBe(0);
  });

  it('restores undo state when no undo handler is registered', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    bus.register('inc', () => { count++; });
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    bus.undo();
    expect(count).toBe(1);
    await bus.redo();
    expect(count).toBe(1);
  });
});
