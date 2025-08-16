import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Command } from '@airdraw/core';

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

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState('#000000');
  const [prompt, setPrompt] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { gesture, error } = useHandTracking();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const redoRef = useRef<Stroke[]>([]);

  useEffect(() => {
    setPaletteOpen(gesture === 'palette');
  }, [gesture]);

  useEffect(() => {
    const unsubColor = bus.register('setColor', ({ hex }) => {
      setColor(hex);
    });
    const unsubUndo = bus.register('undo', () => {
      setStrokes(prev => {
        if (prev.length === 0) return prev;
        const newStrokes = prev.slice(0, -1);
        redoRef.current.push(prev[prev.length - 1]);
        return newStrokes;
      });
    });
    const unsubRedo = bus.register('redo', () => {
      setStrokes(prev => {
        const stroke = redoRef.current.pop();
        return stroke ? [...prev, stroke] : prev;
      });
    });
    return () => {
      unsubColor();
      unsubUndo();
      unsubRedo();
    };
  }, [bus]);

  const readyRef = useRef(false);
  const initializedRef = useRef(false);
  useEffect(() => {
    (async () => {
      const state = await loadState();
      if (state) {
        setStrokes(state.strokes ?? []);
        setColor(state.color ?? '#000000');
      }
      readyRef.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!readyRef.current) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    void saveState({ strokes, color });
  }, [color]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(prev => {
      const updated = [...prev, stroke];
      redoRef.current = [];
      void saveState({ strokes: updated, color });
      return updated;
    });
  };

  const handlePaletteSelect = async (command: Command) => {
    await bus.dispatch(command as AppCommand);
    setPaletteOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
  };

  useEffect(() => {
    if (gesture === 'swipeLeft') {
      bus.dispatch({ id: 'undo', args: {} });
    } else if (gesture === 'swipeRight') {
      bus.dispatch({ id: 'redo', args: {} });
    }
  }, [gesture, bus]);

  const cameraActive = !!videoRef.current && !!(videoRef.current as any).srcObject;

  return (
    <div>
      <video ref={videoRef} hidden={!cameraActive} />
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
      {paletteOpen && <RadialPalette onSelect={handlePaletteSelect} />}
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

