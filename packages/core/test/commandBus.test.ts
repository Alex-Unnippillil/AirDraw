import { describe, it, expect } from 'vitest';
import { CommandBus } from '../src/commands';

describe('CommandBus', () => {
  it('dispatches and undoes commands', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    bus.register(
      'inc',
      async () => {
        await Promise.resolve();
        count++;
      },
      async () => {
        await Promise.resolve();
        count--;
      }
    );
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    await bus.undo();
    expect(count).toBe(0);
    await bus.redo();
    expect(count).toBe(1);
  });

  it('redos commands without losing handlers', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    bus.register(
      'inc',
      () => {
        count++;
      },
      () => {
        count--;
      }
    );
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    await bus.undo();
    expect(count).toBe(0);
    await bus.redo();
    expect(count).toBe(1);
    await bus.undo();
    expect(count).toBe(0);
  });

  it('restores undo state when no undo handler is registered', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    bus.register('inc', () => {
      count++;
    });
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    await bus.undo();
    expect(count).toBe(1);
    await bus.redo();
    expect(count).toBe(1);
  });

  it('returns unsubscribe function', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    const unsubscribe = bus.register('inc', () => {
      count++;
    });
    unsubscribe();
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(0);
  });

  it('does not mutate stacks when dispatch handler throws', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    bus.register(
      'inc',
      () => {
        count++;
        throw new Error('fail');
      },
      () => {
        count--;
      }
    );
    await expect(
      bus.dispatch({ id: 'inc', args: {} })
    ).rejects.toThrow();
    expect(count).toBe(1);
    await bus.undo();
    expect(count).toBe(1);
    await bus.redo();
    expect(count).toBe(1);
  });

  it('restores stack when undo handler throws', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    bus.register(
      'inc',
      () => {
        count++;
      },
      () => {
        throw new Error('fail');
      }
    );
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    await expect(bus.undo()).rejects.toThrow();
    expect(count).toBe(1);
    await expect(bus.undo()).rejects.toThrow();
    expect(count).toBe(1);
    await bus.redo();
    expect(count).toBe(1);
  });

  it('restores stack when redo handler throws', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    let shouldThrow = false;
    bus.register(
      'inc',
      () => {
        if (shouldThrow) {
          throw new Error('fail');
        }
        count++;
      },
      () => {
        count--;
      }
    );
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    await bus.undo();
    expect(count).toBe(0);
    shouldThrow = true;
    await expect(bus.redo()).rejects.toThrow();
    expect(count).toBe(0);
    await bus.undo();
    expect(count).toBe(0);
    await expect(bus.redo()).rejects.toThrow();
    expect(count).toBe(0);
  });

  it('ignores unregistered commands and empty stacks', async () => {
    type Cmds = { inc: {} };
    const bus = new CommandBus<Cmds>();
    const count = 0;
    // dispatching without registering should do nothing
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(0);
    // undo/redo with empty stacks should also do nothing
    await bus.undo();
    await bus.redo();
    expect(count).toBe(0);
  });

  it('clears redo stack on new dispatch after undo', async () => {
    type Cmds = { inc: {}; dec: {} };
    const bus = new CommandBus<Cmds>();
    let count = 0;
    bus.register(
      'inc',
      () => {
        count++;
      },
      () => {
        count--;
      }
    );
    bus.register(
      'dec',
      () => {
        count--;
      },
      () => {
        count++;
      }
    );
    await bus.dispatch({ id: 'inc', args: {} });
    expect(count).toBe(1);
    await bus.undo();
    expect(count).toBe(0);
    await bus.dispatch({ id: 'dec', args: {} });
    expect(count).toBe(-1);
    await bus.redo();
    // redo stack should be cleared after dispatching 'dec'
    expect(count).toBe(-1);
    await bus.undo();
    expect(count).toBe(0);
  });
});
