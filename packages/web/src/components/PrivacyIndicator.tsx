import React from 'react';
import { usePrivacy } from '../context/PrivacyContext';

export function PrivacyIndicator() {
  const { enabled } = usePrivacy();
  if (enabled) return null;
  const style: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: 'red'
  };
  return <div data-testid="privacy-indicator" style={style} />;
}

export default PrivacyIndicator;
