import { describe, it, expect } from 'vitest';
import { CommandBus, CommandOf } from '../src/commands/commandBus';

interface CounterCommands {
  inc: {};
  'undo:inc': {};
}

describe('CommandBus', () => {

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
});
