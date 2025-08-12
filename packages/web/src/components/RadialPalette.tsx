import React from 'react';
import { Command } from '@airdraw/core';

export interface PaletteItem {
  label: string;
  command: Command;
}

export interface RadialPaletteProps {
  visible: boolean;
  items: PaletteItem[];
  onSelect(cmd: Command): void;
}

export function RadialPalette({ visible, items, onSelect }: RadialPaletteProps) {
  if (!visible) return null;
  return (
    <ul className="radial-palette" role="menu" aria-label="Radial palette">
      {items.map(it => (
        <li key={it.label} role="none">
          <button role="menuitem" onClick={() => onSelect(it.command)}>
            {it.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
