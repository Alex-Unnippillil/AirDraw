import React from 'react';
import styles from './RadialPalette.module.css';
import { defaultPaletteItems, PaletteItem } from '../config/palette';
import { Command } from '@airdraw/core';

export interface RadialPaletteProps {
  items?: PaletteItem[];
  onSelect?: (command: Command) => void;
}

export function RadialPalette({ items = defaultPaletteItems, onSelect }: RadialPaletteProps) {
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const itemRefs = React.useRef<HTMLButtonElement[]>([]);

  const handleSelect = (item: PaletteItem) => {
    onSelect?.(item.command);
  };

  const focusItem = (index: number) => {
    const count = items.length;
    const nextIndex = (index + count) % count;
    setFocusedIndex(nextIndex);
    itemRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (
    item: PaletteItem,
    index: number,
    e: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSelect(item);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        focusItem(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        focusItem(index - 1);
        break;
    }
  };

  return (
    <ul className={styles.radialPalette} role="menu" aria-orientation="horizontal">
      {items.map((item, index) => (
        <li key={item.label} role="none">
          <button
            type="button"
            role="menuitem"
            ref={el => (itemRefs.current[index] = el!)}
            tabIndex={index === focusedIndex ? 0 : -1}
            onClick={() => handleSelect(item)}
            onKeyDown={e => handleKeyDown(item, index, e)}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default RadialPalette;
