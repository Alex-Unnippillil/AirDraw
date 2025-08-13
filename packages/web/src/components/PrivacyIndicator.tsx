import React from 'react';

export function PrivacyIndicator() {
  return (
    <div
      data-testid="privacy-indicator"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        background: 'red',
        borderRadius: '50%'
      }}
    />
  );
}

export default PrivacyIndicator;
