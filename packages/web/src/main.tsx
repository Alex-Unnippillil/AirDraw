import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import { useHandTracking } from './hooks/useHandTracking';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const bus = useCommandBus();

  const [prompt, setPrompt] = useState('');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    const unregisterSetColor = bus.register('setColor', ({ hex }) => {
      setColor(hex);
    });
    const unregisterUndo = bus.register('undo', () => {
      setStrokes(s => s.slice(0, -1));
    });
    return () => {
      unregisterSetColor();
      unregisterUndo();
    };
  }, [bus]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(prev => [...prev, stroke]);
  };

  const handlePaletteSelect = async (cmd: AppCommand) => {
    await bus.dispatch(cmd);
  };

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
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        onStrokeComplete={handleStrokeComplete}
      />
      <video ref={videoRef} style={{ display: 'none' }} />
      {gesture === 'palette' && <RadialPalette onSelect={handlePaletteSelect} />}
      {error && <div role="alert">{error.message}</div>}
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
