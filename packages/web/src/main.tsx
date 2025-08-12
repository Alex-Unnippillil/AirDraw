import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CommandBus } from '@airdraw/core';
import { useHandTracking } from './hooks/useHandTracking';
import RadialPalette from './components/RadialPalette';
import { parsePrompt } from './ai/copilot';
import type { AppCommand, AppCommands } from './commands';

export const bus = new CommandBus<AppCommands>();

export function App() {
  const { videoRef, gesture } = useHandTracking();
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds = await parsePrompt(prompt);
    for (const cmd of cmds) {
      bus.dispatch(cmd);
    }
    setPrompt('');
  };

  const handleSelect = (cmd: AppCommand) => {
    bus.dispatch(cmd);
  };

  return (
    <div>
      <video ref={videoRef} hidden />
      <form onSubmit={handleSubmit}>
        <input
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </form>
      {gesture === 'palette' && <RadialPalette onSelect={handleSelect} />}
    </div>
  );
}

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(<App />);
}
