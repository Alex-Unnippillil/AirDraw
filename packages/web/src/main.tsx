import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { RadialPalette } from './components/RadialPalette';
import { parsePrompt } from './ai/copilot';
import type { AppCommand } from './commands';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
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

  const handlePaletteSelect = (cmd: AppCommand) => {
    bus.dispatch(cmd);
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      {gesture === 'palette' && <RadialPalette onSelect={handlePaletteSelect} />}
      {error && (
        <div role="alert">
          {error.message}
        </div>
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

export default App;

