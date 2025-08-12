import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CommandBus, AppCommand } from '@airdraw/core';

import RadialPalette from './components/RadialPalette';
import { useHandTracking } from './hooks/useHandTracking';

const bus = new CommandBus<AppCommand>();

bus.register('setColor', async args => console.log('setColor', args));
bus.register('undo', () => console.log('undo'));

function App() {
  const { videoRef, gesture } = useHandTracking();
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    setPalette(gesture === 'palette');
  }, [gesture]);

  const handleCommand = (cmd: AppCommand) => {
    bus.dispatch(cmd);
    setPalette(false);
  };

  return (
    <div>
      <video ref={videoRef} hidden />
      <div>Gesture: {gesture}</div>
      {palette && <RadialPalette onSelect={handleCommand} />}
    </div>
  );
}

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(<App />);
}
