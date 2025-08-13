import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RadialPalette from './components/RadialPalette';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import { useHandTracking } from './hooks/useHandTracking';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const bus = useCommandBus();

  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const unregisterSetColor = bus.register('setColor', ({ hex }) => {
      setColor(hex);
    });
    const unregisterUndo = bus.register('undo', () => {
      setStrokes(prev => prev.slice(0, -1));
    });
    return () => {
      unregisterSetColor();
      unregisterUndo();
    };
  }, [bus]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(prev => [...prev, stroke]);
  };

  const handleSelect = (cmd: AppCommand) => {
    bus.dispatch(cmd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
  };

  return (
    <div>
      {gesture === 'palette' && <RadialPalette onSelect={handleSelect} />}
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        onStrokeComplete={handleStrokeComplete}
      />
      <video ref={videoRef} />
      {error && (
        <div role="alert">{error.message}</div>
      )}
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
