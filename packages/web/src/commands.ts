import { CommandOf } from '@airdraw/core';

export interface AppCommands {
  setColor: { hex: string };
  undo: {};
}

export type AppCommand = CommandOf<AppCommands>;
