import { CommandOf } from '@airdraw/core';

export interface AppCommands {
  setColor: { hex: string };
  undo: Record<string, never>;
  redo: Record<string, never>;
}

export type AppCommand = CommandOf<AppCommands>;
