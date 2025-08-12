import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CommandBus, type AppCommand } from '@airdraw/core';
import { useHandTracking } from './hooks/useHandTracking';
import { RadialPalette } from './components/RadialPalette';
import { parsePrompt } from './ai/copilot';

export const bus = new CommandBus<AppCommand>();

bus.register('setColor', async args => console.log('setColor', args));
bus.register('undo', () => console.log('undo'));

export function App() {
  const { videoRef, gesture } = useHandTracking();
  const [prompt, setPrompt] = useState('');

  const handleCommand = (cmd: AppCommand) => {
    bus.dispatch(cmd);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cmds = await parsePrompt(prompt);
    cmds.forEach(handleCommand);
    setPrompt('');
  };

  return (
    <div>
      <video ref={videoRef} hidden />
      <div>Gesture: {gesture}</div>
      {gesture === 'palette' && <RadialPalette onSelect={handleCommand} />}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </form>
    </div>
  );
}

const el = document.getElementById('root');
if (el) createRoot(el).render(<App />);
