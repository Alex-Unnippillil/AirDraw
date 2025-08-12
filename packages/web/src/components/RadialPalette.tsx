import React from 'react';
export interface PaletteItem {
  label: string;
  color: string;
  onSelect(): void;
}

export interface RadialPaletteProps {
  visible: boolean;
  items: PaletteItem[];
}

export function RadialPalette({ visible, items }: RadialPaletteProps) {
  if (!visible) return null;
  return (
    <div className="radial-palette">
      {items.map(it => (
        <button
          key={it.label}
          style={{ backgroundColor: it.color }}
          onClick={it.onSelect}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
