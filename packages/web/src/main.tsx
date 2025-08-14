import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { useHandTracking } from './hooks/useHandTracking';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import PrivacyIndicator from './components/PrivacyIndicator';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';
import { loadState, saveState } from './storage/indexedDb';

export function App() {
  const bus = useCommandBus();
  const { videoRef, gesture, error } = useHandTracking();

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState('#000000');
  const [prompt, setPrompt] = useState('');

  // keep refs of latest state for command handlers
  const strokesRef = useRef<Stroke[]>(strokes);
  const colorRef = useRef(color);
  const redoRef = useRef<Stroke[]>([]);

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  // load saved state on mount
  useEffect(() => {
    loadState().then(state => {
      if (state) {
        setStrokes(state.strokes ?? []);
        setColor(state.color ?? '#000000');
      }
    });
  }, []);

  // register command handlers
  useEffect(() => {
    const offSetColor = bus.register('setColor', async ({ hex }) => {
      setColor(hex);
      await saveState({ strokes: strokesRef.current, color: hex });
    });

    const offUndo = bus.register('undo', async () => {
      setStrokes(prev => {
        if (prev.length === 0) return prev;
        const next = prev.slice(0, -1);
        const removed = prev[prev.length - 1];
        redoRef.current.push(removed);
        saveState({ strokes: next, color: colorRef.current });
        return next;
      });
    });

    const offRedo = bus.register('redo', async () => {
      const stroke = redoRef.current.pop();
      if (!stroke) return;
      setStrokes(prev => {
        const next = [...prev, stroke];
        saveState({ strokes: next, color: colorRef.current });
        return next;
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
      redoRef.current = [];
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

  const cameraActive = !!videoRef.current && !!(videoRef.current as any).srcObject;

  return (
    <div>
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        onStrokeComplete={handleStrokeComplete}
      />
      <video ref={videoRef} hidden />
      {gesture === 'palette' && (
        <RadialPalette onSelect={cmd => bus.dispatch(cmd)} />
      )}
      {cameraActive && <PrivacyIndicator />}
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

