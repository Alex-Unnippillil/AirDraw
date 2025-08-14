import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';
import { loadState, saveState } from './storage/indexedDb';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { useHandTracking } from './hooks/useHandTracking';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';

export function App() {
  const bus = useCommandBus();
  const { videoRef, gesture, error } = useHandTracking();
  const [prompt, setPrompt] = useState('');
  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);

  useEffect(() => {
    (async () => {
      const state = await loadState();
      if (state) {
        setStrokes(state.strokes);
        setColor(state.color);
      }
    })();
  }, []);

  useEffect(() => {
    saveState({ strokes, color }).catch(() => {});
  }, [strokes, color]);

  useEffect(() => {
    const offSetColor = bus.register('setColor', ({ hex }) => {
      setColor(hex);
    });

    const offUndo = bus.register('undo', () => {
      setStrokes(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        setRedoStack(stack => [last, ...stack]);
        return prev.slice(0, -1);
      });
    });

    const offRedo = bus.register('redo', () => {
      setRedoStack(prev => {
        if (prev.length === 0) return prev;
        const [stroke, ...rest] = prev;
        setStrokes(s => [...s, stroke]);
        return rest;
      });
    });

    return () => {
      offSetColor();
      offUndo();
      offRedo();
    };
  }, [bus]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(prev => [...prev, stroke]);
    setRedoStack([]);
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
      <video ref={videoRef} hidden />
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
    <PrivacyProvider>
      <CommandBusProvider>
        <App />
      </CommandBusProvider>
    </PrivacyProvider>
  );
}

export default App;

