import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';
import { RadialPalette, PaletteItem } from './components/RadialPalette';
import { CommandBus, Command } from '@airdraw/core';
import { parsePrompt } from './ai/copilot';

const bus = new CommandBus();
bus.register('setColor', async args => console.log('setColor', args));
bus.register('undo', () => console.log('undo'));

function App() {
  const { videoRef, gesture } = useHandTracking();
  const [palette, setPalette] = useState(false);
  /**
   * Palette items passed to the RadialPalette component. Consumers can
   * customize the palette by supplying a different array.
   */
  const items: PaletteItem[] = [
    { label: 'Black', command: { id: 'setColor', args: { hex: '#000000' } } },
    { label: 'Red', command: { id: 'setColor', args: { hex: '#ff0000' } } },
    { label: 'Undo', command: { id: 'undo', args: {} } }
  ];

  const handleCommand = (cmd: Command) => {
    bus.dispatch(cmd);
    setPalette(false);
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <RadialPalette visible={palette} items={items} onSelect={handleCommand} />
      <div>Gesture: {gesture}</div>
    </div>
  );
}

const el = document.getElementById('root');
if (el) createRoot(el).render(<App />);
