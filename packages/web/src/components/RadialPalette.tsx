import React, { useEffect, useRef, useState } from 'react';
import { Command } from '@airdraw/core';
import styles from './RadialPalette.module.css';
import { PaletteItem, defaultPaletteItems } from '../config/palette';

export interface RadialPaletteProps {
  visible: boolean;
  onSelect(cmd: Command): void;
  items?: PaletteItem[];
}

export function RadialPalette({ visible, onSelect, items = defaultPaletteItems }: RadialPaletteProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (visible) {
      setActiveIndex(0);
      buttonsRef.current[0]?.focus();
    }
  }, [visible]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const next = (activeIndex + 1) % items.length;
      setActiveIndex(next);
      buttonsRef.current[next]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const prev = (activeIndex - 1 + items.length) % items.length;
      setActiveIndex(prev);
      buttonsRef.current[prev]?.focus();
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      onSelect(items[activeIndex].command);
      e.preventDefault();
    }
  };

  if (!visible) return null;
  return (
    <div className={styles.radialPalette} role="menu" aria-label="Command palette" onKeyDown={handleKeyDown}>
      {items.map((it, idx) => (
        <button
          key={it.label}
          ref={el => (buttonsRef.current[idx] = el)}
          onClick={() => onSelect(it.command)}
          role="menuitem"
          tabIndex={idx === activeIndex ? 0 : -1}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
