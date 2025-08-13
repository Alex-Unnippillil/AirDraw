import React from 'react';

export interface CameraIndicatorProps {
  active: boolean;
}

export default function CameraIndicator({ active }: CameraIndicatorProps) {
  if (!active) return null;
  return (
    <div
      data-testid="camera-indicator"
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: 'red'
      }}
    />
  );
}
