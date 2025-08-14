import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { AppCommand } from './commands';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { PrivacyProvider } from './context/PrivacyContext';
import DrawingCanvas, { Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import { useHandTracking } from './hooks/useHandTracking';
import { parsePrompt } from './ai/copilot';
import { loadState, saveState } from './storage/indexedDb';

export function App() {
  const bus = useCommandBus();
  const { videoRef, gesture, error } = useHandTracking();
  const [prompt, setPrompt] = useState('');
  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);

  const strokesRef = useRef<Stroke[]>(strokes);
  const colorRef = useRef(color);

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    loadState().then(state => {
      if (state) {
        setStrokes(state.strokes);
        setColor(state.color);
      }
    });
  }, []);

  useEffect(() => {
    if (gesture === 'swipeLeft') {
      bus.dispatch({ id: 'undo', args: {} });
    } else if (gesture === 'swipeRight') {
      bus.dispatch({ id: 'redo', args: {} });
    }
  }, [gesture, bus]);

  useEffect(() => {
    const offSetColor = bus.register('setColor', ({ hex }) => {
      setColor(hex);
      saveState({ strokes: strokesRef.current, color: hex });
    });

    const offUndo = bus.register('undo', () => {
      setStrokes(prev => {
        if (prev.length === 0) return prev;
        const undone = prev[prev.length - 1];
        const newStrokes = prev.slice(0, -1);
        setRedoStack(r => [undone, ...r]);
        saveState({ strokes: newStrokes, color: colorRef.current });
        return newStrokes;
      });
    });

    const offRedo = bus.register('redo', () => {
      setRedoStack(prev => {
        if (prev.length === 0) return prev;
        const [redoStroke, ...rest] = prev;
        setStrokes(sPrev => {
          const newStrokes = [...sPrev, redoStroke];
          saveState({ strokes: newStrokes, color: colorRef.current });
          return newStrokes;
        });
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
    setStrokes(prev => {
      const next = [...prev, stroke];
      setRedoStack([]);
      saveState({ strokes: next, color: colorRef.current });
      return next;
    });
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
    <PrivacyProvider>
      <CommandBusProvider>
        <App />
      </CommandBusProvider>
    </PrivacyProvider>
  );
}

export default App;

