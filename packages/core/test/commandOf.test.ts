import { describe, it, expectTypeOf } from 'vitest';
import { CommandOf } from '../src/commands';

describe('CommandOf', () => {
  it('infers union of command objects from map', () => {
    type CmdMap = {
      setColor: { hex: string };
      undo: {};
    };

    expectTypeOf<CommandOf<CmdMap>>().toEqualTypeOf<
      | { id: 'setColor'; args: { hex: string } }
      | { id: 'undo'; args: {} }
    >();
  });
});
