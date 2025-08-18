import type { AppCommand } from '../commands';

export interface PaletteItem {
  label: string;
  command: AppCommand;
}

export const defaultPaletteItems: PaletteItem[] = [
  { label: 'Black', command: { id: 'setColor', args: { hex: '#000000' } } },
  { label: 'Red', command: { id: 'setColor', args: { hex: '#ff0000' } } },
  { label: 'Undo', command: { id: 'undo', args: {} } },
  { label: 'Redo', command: { id: 'redo', args: {} } }
];
