import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { useHandTracking } from './hooks/useHandTracking';
import { loadState, saveState } from './storage/indexedDb';

export function App() {
  const bus = useCommandBus();
  const { videoRef, gesture: trackedGesture, error: trackedError } = useHandTracking();

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState('#000000');
  const [gesture, setGesture] = useState<string>('idle');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setGesture(trackedGesture);
  }, [trackedGesture]);

  useEffect(() => {
    setError(trackedError);
  }, [trackedError]);

  useEffect(() => {
    (async () => {
      const state = await loadState();
      if (state) {
        setStrokes(state.strokes ?? []);
        setColor(state.color ?? '#000000');
      }
    })();
  }, []);

  useEffect(() => {
    saveState({ strokes, color }).catch(() => {});
  }, [strokes, color]);

  const redoStack = useRef<Stroke[]>([]);

  useEffect(() => {
    const unregisters = [
      bus.register('setColor', ({ hex }) => {
        setColor(hex);
      }),
      bus.register('undo', () => {
        setStrokes(s => {
          const newStrokes = s.slice(0, -1);
          const removed = s[s.length - 1];
          if (removed) redoStack.current.push(removed);
          return newStrokes;
        });
      }),
      bus.register('redo', () => {
        setStrokes(s => {
          const stroke = redoStack.current.pop();
          return stroke ? [...s, stroke] : s;
        });
      }),
    ];
    return () => unregisters.forEach(u => u());
  }, [bus]);

  const handleStrokeComplete = (stroke: Stroke) => {
    redoStack.current = [];
    setStrokes(s => [...s, stroke]);
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
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        onStrokeComplete={handleStrokeComplete}
      />
      <video ref={videoRef} style={{ display: 'none' }} />
      <form onSubmit={handleSubmit}>
        <input
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </form>
      {gesture === 'palette' && <RadialPalette onSelect={handlePaletteSelect} />}
      {error && <div role="alert">{error.message}</div>}
      <pre data-testid="strokes">{JSON.stringify(strokes)}</pre>
    </div>
  );
}

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <PrivacyProvider>
      <CommandBusProvider>
        <App />
      </CommandBusProvider>
    </PrivacyProvider>
  );
}

export default App;

