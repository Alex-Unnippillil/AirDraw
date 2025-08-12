import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';
import { RadialPalette, PaletteItem } from './components/RadialPalette';
import { CommandBus } from '@airdraw/core';
import { parsePrompt } from './ai/copilot';

const bus = new CommandBus();
bus.register('setColor', async args => console.log('setColor', args));
bus.register('undo', () => console.log('undo'));

function App() {
  const { videoRef, gesture } = useHandTracking();
  const [palette, setPalette] = useState(false);

  const makeCommand = (cmd: { id: string; args: Record<string, any> }) => () => {
    bus.dispatch(cmd);
    setPalette(false);
  };

  const items: PaletteItem[] = [
    { label: 'Black', color: '#000000', onSelect: makeCommand({ id: 'setColor', args: { hex: '#000000' } }) },
    { label: 'Red', color: '#ff0000', onSelect: makeCommand({ id: 'setColor', args: { hex: '#ff0000' } }) },
    { label: 'Undo', color: '#cccccc', onSelect: makeCommand({ id: 'undo', args: {} }) }
  ];

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <RadialPalette visible={palette} items={items} />
      <div>Gesture: {gesture}</div>
    </div>
  );
}

const el = document.getElementById('root');
if (el) createRoot(el).render(<App />);
