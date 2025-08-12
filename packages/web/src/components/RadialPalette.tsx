import React from 'react';
import { AppCommand } from '../commands';

interface PaletteItem { label: string; command: AppCommand }
const items: PaletteItem[] = [
  { label: 'Black', command: { id: 'setColor', args: { hex: '#000000' } } },
  { label: 'Red', command: { id: 'setColor', args: { hex: '#ff0000' } } },
  { label: 'Undo', command: { id: 'undo', args: {} } }
];

export interface RadialPaletteProps {
  visible: boolean;
  onSelect(cmd: AppCommand): void;
}

export function RadialPalette({ visible, onSelect }: RadialPaletteProps) {
  if (!visible) return null;
  return (
    <div className="radial-palette">
      {items.map(it => (
        <button key={it.label} onClick={() => onSelect(it.command)}>{it.label}</button>
      ))}
    </div>
  );
}
