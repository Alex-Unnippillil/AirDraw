/* @vitest-environment jsdom */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RadialPalette, PaletteItem } from '../src/components/RadialPalette';

describe('RadialPalette', () => {
  it('renders items and triggers callbacks', () => {
    const onBlack = vi.fn();
    const onRed = vi.fn();
    const items: PaletteItem[] = [
      { label: 'Black', color: '#000000', onSelect: onBlack },
      { label: 'Red', color: '#ff0000', onSelect: onRed }
    ];
    const { getByText } = render(<RadialPalette visible={true} items={items} />);

    fireEvent.click(getByText('Black'));
    expect(onBlack).toHaveBeenCalled();

    fireEvent.click(getByText('Red'));
    expect(onRed).toHaveBeenCalled();
  });

  it('applies colors to buttons', () => {
    const items: PaletteItem[] = [
      { label: 'Blue', color: '#0000ff', onSelect: () => {} }
    ];
    const { getByText } = render(<RadialPalette visible={true} items={items} />);
    const btn = getByText('Blue');
    expect(btn.getAttribute('style')).toContain('background-color: rgb(0, 0, 255)');
  });

  it('returns null when not visible', () => {
    const { container } = render(<RadialPalette visible={false} items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
