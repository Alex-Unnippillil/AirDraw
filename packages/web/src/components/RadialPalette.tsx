import React from 'react';
import styles from './RadialPalette.module.css';
import { defaultPaletteItems, type PaletteItem } from '../config/palette';
import type { AppCommand } from '../commands';

export interface RadialPaletteProps {
  onSelect?: (command: AppCommand) => void | Promise<void>;
}

export function RadialPalette({ onSelect }: RadialPaletteProps) {
  const handleSelect = (item: PaletteItem) => {
    void onSelect?.(item.command);
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
