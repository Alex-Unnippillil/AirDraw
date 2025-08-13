/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { PrivacyProvider, usePrivacy } from '../src/context/PrivacyContext';
import { PrivacyIndicator } from '../src/components/PrivacyIndicator';

function Status() {
  const { enabled } = usePrivacy();
  return <div data-testid="status">{String(enabled)}</div>;
}

describe('PrivacyContext', () => {
  it('toggles privacy mode with spacebar and controls indicator', () => {
    render(
      <PrivacyProvider>
        <PrivacyIndicator />
        <Status />
      </PrivacyProvider>
    );

    // initially camera active -> indicator visible
    expect(screen.getByTestId('privacy-indicator')).toBeTruthy();
    expect(screen.getByTestId('status').textContent).toBe('false');

    fireEvent.keyDown(window, { code: 'Space' });

    // privacy enabled -> indicator hidden
    expect(screen.queryByTestId('privacy-indicator')).toBeNull();
    expect(screen.getByTestId('status').textContent).toBe('true');
  });
});
