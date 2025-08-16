import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Command } from '@airdraw/core';

import type { AppCommand } from './commands';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { PrivacyProvider } from './context/PrivacyContext';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import { useHandTracking } from './hooks/useHandTracking';
import { parsePrompt } from './ai/copilot';
import { loadState, saveState } from './storage/indexedDb';

export function App() {
  const bus = useCommandBus();

  const { videoRef, gesture, error } = useHandTracking();
  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const undoneRef = useRef<Stroke[]>([]);
  const [prompt, setPrompt] = useState('');

  // refs to keep latest state inside command handlers
  const strokesRef = useRef<Stroke[]>(strokes);
  const colorRef = useRef<string>(color);
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  // load persisted state
  useEffect(() => {
    loadState()
      .then(state => {
        if (state) {
          setStrokes(state.strokes);
          setColor(state.color);
        }
      })
      .catch(() => {});
  }, []);

  // register command handlers
  useEffect(() => {
    const unregisters: Array<() => void> = [];
    unregisters.push(
      bus.register('setColor', ({ hex }) => {
        setColor(hex);
        saveState({ strokes: strokesRef.current, color: hex });
      }),
      bus.register('undo', () => {
        setStrokes(prev => {
          if (prev.length === 0) return prev;
          const newStrokes = prev.slice(0, -1);
          const undone = prev[prev.length - 1];
          if (undone) {
            undoneRef.current.push(undone);
          }
          saveState({ strokes: newStrokes, color: colorRef.current });
          return newStrokes;
        });
      }),
      bus.register('redo', () => {
        const stroke = undoneRef.current.pop();
        if (!stroke) return;
        setStrokes(prev => {
          const newStrokes = [...prev, stroke];
          saveState({ strokes: newStrokes, color: colorRef.current });
          return newStrokes;
        });
      })
    );
    return () => {
      unregisters.forEach(fn => fn());
    };
  }, [bus]);

  // gesture-based undo/redo
  useEffect(() => {
    if (gesture === 'swipeLeft') {
      void bus.dispatch({ id: 'undo', args: {} });
    } else if (gesture === 'swipeRight') {
      void bus.dispatch({ id: 'redo', args: {} });
    }
  }, [gesture, bus]);

  const handlePaletteSelect = (command: Command) => {
    void bus.dispatch(command as AppCommand);
  };

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(prev => {
      const newStrokes = [...prev, stroke];
      saveState({ strokes: newStrokes, color: colorRef.current });
      return newStrokes;
    });
    undoneRef.current = [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
  };

  const cameraActive = !!videoRef.current && !!(videoRef.current as any).srcObject;

  return (
    <div>
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        onStrokeComplete={handleStrokeComplete}
      />
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

