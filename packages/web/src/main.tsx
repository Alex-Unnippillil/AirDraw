import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';
import { RadialPalette } from './components/RadialPalette';
import { CommandBus } from '@airdraw/core';
import { parsePrompt } from './ai/copilot';
import { AppCommand, AppCommands } from './commands';


bus.register('setColor', async args => console.log('setColor', args));
bus.register('undo', () => console.log('undo'));

export function App() {
  const { videoRef, gesture } = useHandTracking();
  const [palette, setPalette] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setPalette(gesture === 'palette');
  }, [gesture]);

  const handleCommand = (cmd: AppCommand) => {
    bus.dispatch(cmd);
    setPalette(false);
  };

  const handlePrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cmds = await parsePrompt(prompt);
    cmds.forEach(cmd => bus.dispatch(cmd));
    setPrompt('');
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <RadialPalette visible={palette} onSelect={handleCommand} />
      <form onSubmit={handlePrompt}>
        <input
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </form>
      <div>Gesture: {gesture}</div>
    </div>
  );
}

const el = document.getElementById('root');
if (el) createRoot(el).render(<App />);
