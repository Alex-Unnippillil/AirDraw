import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import { useHandTracking } from './hooks/useHandTracking';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import { PrivacyProvider } from './context/PrivacyContext';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';
import { loadState, saveState } from './storage/indexedDb';

export function App() {
  const bus = useCommandBus();
  const { videoRef, gesture, error } = useHandTracking();
  const [prompt, setPrompt] = useState('');
  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const redoStack = useRef<Stroke[]>([]);
  const prevGesture = useRef<string>();

  // restore persisted state on mount
  useEffect(() => {
    loadState().then(state => {
      if (state) {
        setColor(state.color);
        setStrokes(state.strokes);
      }
    }).catch(() => {});
  }, []);

  // persist state whenever it changes
  useEffect(() => {
    saveState({ strokes, color }).catch(() => {});
  }, [strokes, color]);

  // register command handlers
  useEffect(() => {
    const offSetColor = bus.register('setColor', ({ hex }: { hex: string }) => {
      setColor(hex);
    });

    const offUndo = bus.register('undo', () => {
      setStrokes(prev => {
        if (prev.length === 0) return prev;
        const copy = prev.slice(0, -1);
        redoStack.current.push(prev[prev.length - 1]);
        return copy;
      });
    });

    const offRedo = bus.register('redo', () => {
      const stroke = redoStack.current.pop();
      if (!stroke) return;
      setStrokes(prev => [...prev, stroke]);
    });

    return () => {
      offSetColor();
      offUndo();
      offRedo();
    };
  }, [bus]);

  // react to swipe gestures
  useEffect(() => {
    if (gesture === prevGesture.current) return;
    prevGesture.current = gesture;
    if (gesture === 'swipeLeft') {
      bus.dispatch({ id: 'undo', args: {} });
    } else if (gesture === 'swipeRight') {
      bus.dispatch({ id: 'redo', args: {} });
    }
  }, [gesture, bus]);

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

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(prev => [...prev, stroke]);
    redoStack.current = [];
  };

  return (
    <div>
      <video ref={videoRef} />
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

