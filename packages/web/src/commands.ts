import { CommandOf } from '@airdraw/core';

export interface AppCommands {
  setColor: { hex: string };
  undo: {};
  redo: {};
}

export type AppCommand = CommandOf<AppCommands>;
