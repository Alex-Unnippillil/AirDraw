import { describe, it, expect } from 'vitest';
import { CommandBus, CommandOf } from '../src/commands/commandBus';

interface CounterCommands {
  inc: {};
  'undo:inc': {};
}

describe('CommandBus', () => {
  it('dispatches and undoes commands', async () => {
    const bus = new CommandBus<CounterCommands>();
    let count = 0;
    bus.register('inc', () => {
      count++;
    });
    bus.register('undo:inc', () => {
      count--;
    });
    const cmd: CommandOf<CounterCommands> = { id: 'inc', args: {} };
    await bus.dispatch(cmd);
    expect(count).toBe(1);
    await bus.undo();
    expect(count).toBe(0);
  });

  it('handles async handlers', async () => {
    const bus = new CommandBus();
    let count = 0;
    bus.register('inc', async () => { await Promise.resolve(); count++; });
    bus.register('undo:inc', async () => { await Promise.resolve(); count--; });
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    await bus.undo();
    expect(count).toBe(0);
    await bus.redo();
    expect(count).toBe(1);
  });

  it('propagates errors from dispatch', async () => {
    const bus = new CommandBus();
    bus.register('boom', () => { throw new Error('boom'); });
    await expect(bus.dispatch({ id: 'boom', args: {} })).rejects.toThrow('boom');
  });

  it('propagates errors from undo', async () => {
    const bus = new CommandBus();
    bus.register('ok', () => {});
    bus.register('undo:ok', () => { throw new Error('fail'); });
    await bus.dispatch({ id: 'ok', args: {} });
    await expect(bus.undo()).rejects.toThrow('fail');
  });

  it('propagates errors from redo', async () => {
    const bus = new CommandBus();
    bus.register('ok', () => {});
    bus.register('undo:ok', () => {});
    await bus.dispatch({ id: 'ok', args: {} });
    await bus.undo();
    bus.register('ok', () => { throw new Error('fail'); });
    await expect(bus.redo()).rejects.toThrow('fail');
  });
});
