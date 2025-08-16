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
    render(<RadialPalette onSelect={onSelect} />);

    // Renders items
    defaultPaletteItems.forEach(item => {
      expect(screen.getByText(item.label)).toBeTruthy();
    });

    // Click selection
    fireEvent.click(screen.getByText(defaultPaletteItems[1].label));
    expect(onSelect).toHaveBeenNthCalledWith(1, defaultPaletteItems[1].command);

    // Click new item
    const lastItem = defaultPaletteItems[defaultPaletteItems.length - 1];
    fireEvent.click(screen.getByText(lastItem.label));
    expect(onSelect).toHaveBeenNthCalledWith(2, lastItem.command);

    // Keyboard selection
    const firstButton = screen.getByText(defaultPaletteItems[0].label);
    fireEvent.keyDown(firstButton, { key: 'Enter' });
    expect(onSelect).toHaveBeenNthCalledWith(3, defaultPaletteItems[0].command);
  });
});
