/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { RadialPalette } from '../src/components/RadialPalette';
import { defaultPaletteItems } from '../src/config/palette';

describe('RadialPalette', () => {
  it('renders palette items and handles selection', () => {
    const onSelect = vi.fn();
    render(<RadialPalette items={defaultPaletteItems} onSelect={onSelect} />);

    // Renders items
    defaultPaletteItems.forEach(item => {
      expect(screen.getByText(item.label)).toBeTruthy();
    });

    // Click selection
    fireEvent.click(screen.getByText(defaultPaletteItems[1].label));
    expect(onSelect).toHaveBeenNthCalledWith(1, defaultPaletteItems[1].command);

    // Keyboard selection
    const firstButton = screen.getByText(defaultPaletteItems[0].label);
    fireEvent.keyDown(firstButton, { key: 'Enter' });
    expect(onSelect).toHaveBeenNthCalledWith(2, defaultPaletteItems[0].command);
  });

  it('supports arrow key navigation through all items', () => {
    render(<RadialPalette items={defaultPaletteItems} />);
    const buttons = screen.getAllByRole('menuitem');

    // focus first item
    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);

    for (let i = 1; i < buttons.length; i++) {
      fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
      expect(document.activeElement?.textContent).toBe(buttons[i].textContent);
    }

    // Wrap around to first
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(document.activeElement?.textContent).toBe(buttons[0].textContent);

    // Navigate backwards from first to last
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowLeft' });
    expect(document.activeElement?.textContent).toBe(buttons[buttons.length - 1].textContent);
  });
});
