import React from 'react';
import { AppCommand } from '../commands';


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
