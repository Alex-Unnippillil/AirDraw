import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import RadialPalette from './components/RadialPalette';
import { useHandTracking } from './hooks/useHandTracking';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const bus = useCommandBus();
  const [prompt, setPrompt] = useState('');
  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  useEffect(() => {
    const offColor = bus.register('setColor', ({ hex }) => setColor(hex));
    const offUndo = bus.register('undo', () =>
      setStrokes(s => s.slice(0, -1))
    );
    return () => {
      offColor();
      offUndo();
    };
  }, [bus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      {gesture === 'palette' && (
        <RadialPalette onSelect={cmd => bus.dispatch(cmd as AppCommand)} />
      )}
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        onStrokeComplete={s => setStrokes(prev => [...prev, s])}
      />
      <form onSubmit={handleSubmit}>
        <input
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </form>
      <pre data-testid="strokes">{JSON.stringify(strokes)}</pre>
      {error && <div role="alert">{error.message}</div>}
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
