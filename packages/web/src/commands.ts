import { CommandOf } from '@airdraw/core';
import type { Stroke } from './types';

export interface AppCommands {
  setColor: { hex: string };
  addStroke: { stroke: Stroke };
  undo: {};
  redo: {};
}

export type AppCommand = CommandOf<AppCommands>;
