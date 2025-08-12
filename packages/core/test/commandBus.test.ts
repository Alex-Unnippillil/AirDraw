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
    bus.undo();
    expect(count).toBe(0);
  });
});
