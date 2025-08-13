import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { useHandTracking } from './hooks/useHandTracking';
import RadialPalette from './components/RadialPalette';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';
import { loadState, saveState } from './storage/indexedDb';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const bus = useCommandBus();
  const [prompt, setPrompt] = useState('');
  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  useEffect(() => {
    loadState().then(state => {
      if (state) {
        setColor(state.color);
        setStrokes(state.strokes);
      }
    });
  }, []);

  useEffect(() => {
    bus.register('setColor', ({ hex }) => setColor(hex));
    bus.register('undo', () => setStrokes(s => s.slice(0, -1)));
  }, [bus]);

  useEffect(() => {
    saveState({ strokes, color }).catch(() => {
      /* ignore */
    });
  }, [strokes, color]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
  };

  const handlePaletteSelect = (cmd: any) => {
    bus.dispatch(cmd as AppCommand);
  };

  return (
    <div>
      {error && <div role="alert">{error.message}</div>}
      <video ref={videoRef} />
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        onStrokeComplete={s => setStrokes(strks => [...strks, s])}
      />
      {gesture === 'palette' && <RadialPalette onSelect={handlePaletteSelect} />}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </form>
      <pre data-testid="strokes">{JSON.stringify(strokes)}</pre>
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
