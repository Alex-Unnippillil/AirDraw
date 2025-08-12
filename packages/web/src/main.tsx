import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CommandBus } from '@airdraw/core';
import type { AppCommands, AppCommand } from './commands';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { useHandTracking } from './hooks/useHandTracking';
import { RadialPalette } from './components/RadialPalette';
import { parsePrompt } from './ai/copilot';

export const bus = new CommandBus<AppCommands>();

export function App() {
  const { videoRef, gesture } = useHandTracking();
  const bus = useCommandBus();
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      bus.dispatch(cmd);
    }
    setPrompt('');
  };

  return (
    <div>
      <video ref={videoRef} hidden />
      {gesture === 'palette' && (
        <RadialPalette onSelect={cmd => bus.dispatch(cmd)} />
      )}
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
if (el) {
  createRoot(el).render(
    <CommandBusProvider>
      <App />
    </CommandBusProvider>
  );
}
