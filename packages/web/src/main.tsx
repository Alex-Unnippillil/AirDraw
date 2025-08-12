import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { parsePrompt } from './ai/copilot';
import { useHandTracking } from './hooks/useHandTracking';
import RadialPalette from './components/RadialPalette';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const bus = useCommandBus();
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds = await parsePrompt(prompt);
    for (const cmd of cmds) {
      bus.dispatch(cmd);
    }
    setPrompt('');
  };

  const handlePaletteSelect = (cmd: any) => bus.dispatch(cmd);

  return (
    <div>
      <video ref={videoRef} hidden />
      {error && <p role="alert">{error.message}</p>}
      {gesture === 'palette' && <RadialPalette onSelect={handlePaletteSelect} />}
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
