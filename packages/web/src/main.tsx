import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import { useHandTracking } from './hooks/useHandTracking';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';

export function App() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState('#000000');
  const { videoRef, gesture, error } = useHandTracking();
  const bus = useCommandBus();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const unsubColor = bus.register('setColor', ({ hex }: { hex: string }) => {
      setColor(hex);
    });
    const unsubUndo = bus.register('undo', () => {
      setStrokes(prev => prev.slice(0, -1));
    });
    return () => {
      unsubColor();
      unsubUndo();
    };
  }, [bus]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(prev => [...prev, stroke]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
  };

  const handlePaletteSelect = async (cmd: any) => {
    await bus.dispatch(cmd as AppCommand);
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        onStrokeComplete={handleStrokeComplete}
      />
      {gesture === 'palette' && <RadialPalette onSelect={handlePaletteSelect} />}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </form>
      {error && <div role="alert">{error.message}</div>}
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
