/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrivacyProvider, usePrivacy } from '../src/context/PrivacyContext';

describe('PrivacyContext', () => {
  function Display() {
    const { enabled } = usePrivacy();
    return <div data-testid="status">{enabled ? 'on' : 'off'}</div>;
  }

  it('toggles enabled with spacebar', () => {
    render(
      <PrivacyProvider>
        <Display />
      </PrivacyProvider>
    );
    const el = screen.getByTestId('status');
    expect(el.textContent).toBe('off');
    fireEvent.keyDown(window, { code: 'Space' });
    expect(el.textContent).toBe('on');
  });
});
