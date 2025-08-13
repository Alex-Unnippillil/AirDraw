import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import RadialPalette from './components/RadialPalette';
import { useHandTracking } from './hooks/useHandTracking';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const [prompt, setPrompt] = useState('');
  const bus = useCommandBus();

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
      <video ref={videoRef} />
      {gesture === 'palette' && <RadialPalette onSelect={cmd => bus.dispatch(cmd)} />}
      {error && <div role="alert">{error.message}</div>}
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
