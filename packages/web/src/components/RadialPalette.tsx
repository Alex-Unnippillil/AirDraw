import React from 'react';
import styles from './RadialPalette.module.css';
import { defaultPaletteItems, PaletteItem } from '../config/palette';
import type { AppCommand } from '../commands';

export interface RadialPaletteProps {
  onSelect?: (command: AppCommand) => void;
}

export function RadialPalette({ onSelect }: RadialPaletteProps) {
  const handleSelect = (command: AppCommand) => {
    onSelect?.(command);
  };

  const handleKeyDown = (command: AppCommand, e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(command);
    }
  };

  return (
    <ul className={styles.radialPalette}>
      {defaultPaletteItems.map(item => (
        <li key={item.label}>
          <button
            type="button"
            onClick={() => handleSelect(item.command)}
            onKeyDown={e => handleKeyDown(item.command, e)}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default RadialPalette;
