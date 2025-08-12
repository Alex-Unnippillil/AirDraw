import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';

import { parsePrompt } from './ai/copilot';
import { AppCommand, AppCommands } from './commands';


bus.register('setColor', async args => console.log('setColor', args));
bus.register('undo', () => console.log('undo'));


  const [palette, setPalette] = useState(false);
  const [prompt, setPrompt] = useState('');


  const handleCommand = (cmd: AppCommand) => {
    bus.dispatch(cmd);
    setPalette(false);
  };



  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />

      <div>Gesture: {gesture}</div>

    </div>
  );
}

const el = document.getElementById('root');
if (el) createRoot(el).render(<App />);
