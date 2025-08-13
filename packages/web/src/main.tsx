import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';
import RadialPalette from './components/RadialPalette';
import { parsePrompt } from './ai/copilot';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import type { AppCommand } from './commands';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const [prompt, setPrompt] = useState('');
  const bus = useCommandBus();

  useEffect(() => {
    if (gesture === 'swipeLeft') {
      bus.dispatch({ id: 'undo', args: {} });
    } else if (gesture === 'swipeRight') {
      bus.dispatch({ id: 'redo', args: {} });
    }
  }, [gesture, bus]);

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
      {gesture === 'palette' && (
        <RadialPalette onSelect={cmd => bus.dispatch(cmd)} />
      )}
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

const el = typeof document !== 'undefined' ? document.getElementById('root') : null;
if (el) {
  createRoot(el).render(
    <CommandBusProvider>
      <App />
    </CommandBusProvider>
  );
}

