import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';
import { RadialPalette } from './components/RadialPalette';
import { parsePrompt } from './ai/copilot';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import type { AppCommands } from './commands';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const [prompt, setPrompt] = useState('');
  const bus = useCommandBus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds = await parsePrompt(prompt);
    for (const cmd of cmds) {
      bus.dispatch(cmd);
    }
    setPrompt('');
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
      {gesture === 'palette' && (
        <RadialPalette onSelect={cmd => bus.dispatch(cmd)} />
      )}
      {error && <p role="alert">{error.message}</p>}
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
