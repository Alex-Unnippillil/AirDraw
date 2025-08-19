import React from 'react';
import { usePrivacy } from '../context/PrivacyContext';

export function PrivacyToggle() {
  const { enabled, toggle } = usePrivacy();
  return (
    <button data-testid="privacy-toggle" onClick={toggle}>
      {enabled ? 'Disable Privacy' : 'Enable Privacy'}
    </button>
  );
}

export default PrivacyToggle;
