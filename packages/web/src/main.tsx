import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RadialPalette from './components/RadialPalette';
import DrawingCanvas, { Stroke } from './components/DrawingCanvas';
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
  const redoStack = useRef<Stroke[]>([]);

  useEffect(() => {
    if (gesture === 'swipeLeft') {
      bus.dispatch({ id: 'undo', args: {} });
    } else if (gesture === 'swipeRight') {
      bus.dispatch({ id: 'redo', args: {} });
    }
  }, [gesture, bus]);

  useEffect(() => {
    const offSetColor = bus.register('setColor', async ({ hex }) => {
      setColor(hex);
    });
    const offUndo = bus.register('undo', async () => {
      setStrokes(s => {
        const next = s.slice();
        const popped = next.pop();
        if (popped) redoStack.current.push(popped);
        return next;
      });
    });
    const offRedo = bus.register('redo', async () => {
      const stroke = redoStack.current.pop();
      if (stroke) setStrokes(s => [...s, stroke]);
    });
    return () => {
      offSetColor();
      offUndo();
      offRedo();
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
      {error && <div role="alert">{error.message}</div>}
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
