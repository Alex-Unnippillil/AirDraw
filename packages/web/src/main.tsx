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

  const handleCommand = (cmd: Command) => {
    bus.dispatch(cmd);
    setPalette(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const commands = await parsePrompt(prompt);
    for (const cmd of commands) {
      bus.dispatch(cmd);
    }
    setPrompt('');
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <RadialPalette visible={palette} onSelect={handleCommand} />
      <div>Gesture: {gesture}</div>
      <form onSubmit={handleSubmit}>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Enter command"
        />
      </form>
    </div>
  );
}

const el = document.getElementById('root');
if (el) createRoot(el).render(<App />);
