import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';

import { parsePrompt } from './ai/copilot';
import { AppCommand, AppCommands } from './commands';


bus.register('setColor', async args => console.log('setColor', args));
bus.register('undo', () => console.log('undo'));


  const [palette, setPalette] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleCommand = (cmd: AppCommand) => {
    bus.dispatch(cmd);
    setPalette(false);
  };



  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />

      <div>Gesture: {gesture}</div>
      <input
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Ask the copilot"
      />
      <button onClick={handlePrompt} disabled={loading}>
        Send
      </button>
      {loading && <div>Parsing...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}

const el = document.getElementById('root');
if (el) createRoot(el).render(<App />);
