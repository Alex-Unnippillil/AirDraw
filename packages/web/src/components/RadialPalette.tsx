import React from 'react';
import { Command } from '@airdraw/core';

interface PaletteItem { label: string; command: Command }
const items: PaletteItem[] = [
  { label: 'Black', command: { id: 'setColor', args: { hex: '#000000' } } },
  { label: 'Red', command: { id: 'setColor', args: { hex: '#ff0000' } } },
  { label: 'Undo', command: { id: 'undo', args: {} } }
];

export interface RadialPaletteProps {
  visible: boolean;
  onSelect(cmd: Command): void;
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
