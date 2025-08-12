import { Command } from '@airdraw/core';

export interface PaletteItem {
  label: string;
  command: Command;
}

export const defaultPaletteItems: PaletteItem[] = [
  { label: 'Black', command: { id: 'setColor', args: { hex: '#000000' } } },
  { label: 'Red', command: { id: 'setColor', args: { hex: '#ff0000' } } },
  { label: 'Undo', command: { id: 'undo', args: {} } }
];
