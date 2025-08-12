import React from 'react';
import styles from './RadialPalette.module.css';
import { defaultPaletteItems, PaletteItem } from '../config/palette';
import { Command } from '@airdraw/core';

export interface RadialPaletteProps {
  onSelect?: (command: Command) => void;
}

export function RadialPalette({ onSelect }: RadialPaletteProps) {
  const handleSelect = (item: PaletteItem) => {
    onSelect?.(item.command);
  };

  const handleKeyDown = (item: PaletteItem, e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(item);
    }
  };

  return (
    <ul className={styles.radialPalette}>
      {defaultPaletteItems.map(item => (
        <li key={item.label}>
          <button
            type="button"
            onClick={() => handleSelect(item)}
            onKeyDown={e => handleKeyDown(item, e)}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default RadialPalette;
