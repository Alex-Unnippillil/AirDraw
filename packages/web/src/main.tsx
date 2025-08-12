import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';
import { RadialPalette } from './components/RadialPalette';
import { CommandBus, Command } from '@airdraw/core';
import { parsePrompt } from './ai/copilot';

const bus = new CommandBus();
bus.register('setColor', async args => console.log('setColor', args));
bus.register('undo', () => console.log('undo'));

function App() {
  const { videoRef, gesture } = useHandTracking();
  const [palette, setPalette] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCommand = (cmd: Command) => {
    bus.dispatch(cmd);
    setPalette(false);
  };

  const handlePrompt = async () => {
    setLoading(true);
    setError(null);
    try {
      const cmds = await parsePrompt(prompt);
      cmds.forEach(cmd => bus.dispatch(cmd));
      setPrompt('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <RadialPalette visible={palette} onSelect={handleCommand} />
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
