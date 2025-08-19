import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import PrivacyIndicator from './components/PrivacyIndicator';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { PrivacyProvider, usePrivacy } from './context/PrivacyContext';
import type { AppCommand } from './commands';
import { useHandTracking } from './hooks/useHandTracking';
import { parsePrompt } from './ai/copilot';
import { loadState, saveState } from './storage/indexedDb';

export function App() {
  const bus = useCommandBus();
  const { videoRef, gesture, error } = useHandTracking();
  const { enabled } = usePrivacy();

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState('#000000');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);

  useEffect(() => {
    loadState().then(state => {
      if (state) {
        setStrokes(state.strokes);
        setColor(state.color);
      }
    });
  }, []);

  useEffect(() => {
    saveState({ strokes, color });
  }, [strokes, color]);

  useEffect(() => {
    const unsubs = [
      bus.register('setColor', async ({ hex }) => {
        setColor(hex);
        setRedoStack([]);
      }),
      bus.register('undo', async () => {
        setStrokes(s => {
          if (s.length === 0) return s;
          const copy = s.slice(0, -1);
          const last = s[s.length - 1];
          setRedoStack(r => [last, ...r]);
          return copy;
        });
      }),
      bus.register('redo', async () => {
        setRedoStack(r => {
          if (r.length === 0) return r;
          const [first, ...rest] = r;
          setStrokes(s => [...s, first]);
          return rest;
        });
      })
    ];
    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [bus]);

  useEffect(() => {
    if (gesture === 'palette') {
      setPaletteOpen(true);
    } else {
      setPaletteOpen(false);
    }
    if (gesture === 'swipeLeft') {
      void bus.dispatch({ id: 'undo', args: {} });
    }
    if (gesture === 'swipeRight') {
      void bus.dispatch({ id: 'redo', args: {} });
    }
  }, [gesture, bus]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(s => [...s, stroke]);
    setRedoStack([]);
  };

  const handlePaletteSelect = async (cmd: AppCommand) => {
    await bus.dispatch(cmd);
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

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
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
      {enabled && <PrivacyIndicator />}
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
