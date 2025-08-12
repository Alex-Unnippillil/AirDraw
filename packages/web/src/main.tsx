import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';
import { RadialPalette } from './components/RadialPalette';
import { CommandBus } from '@airdraw/core';
import { parsePrompt } from './ai/copilot';
import { AppCommand, AppCommands } from './commands';

const bus = new CommandBus<AppCommands>();
bus.register('setColor', async args => console.log('setColor', args));
bus.register('undo', () => console.log('undo'));

function App() {
  const { videoRef, gesture } = useHandTracking();
  const [palette, setPalette] = useState(false);

  const handleCommand = (cmd: AppCommand) => {
    bus.dispatch(cmd);
    setPalette(false);
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <RadialPalette visible={palette} onSelect={handleCommand} />
      <div>Gesture: {gesture}</div>
    </div>
  );
}

const el = document.getElementById('root');
if (el) createRoot(el).render(<App />);
