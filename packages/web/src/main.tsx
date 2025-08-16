import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useHandTracking } from './hooks/useHandTracking';
import { parsePrompt } from './ai/copilot';
import { loadState, saveState } from './storage/indexedDb';

export function App() {
  const bus = useCommandBus();
  const { videoRef, gesture, error } = useHandTracking();
  const { enabled } = usePrivacy();

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [color, setColor] = useState('#000000');
  const [prompt, setPrompt] = useState('');
  const hasLoaded = useRef(false);
  const strokesRef = useRef<Stroke[]>([]);
  const colorRef = useRef('#000000');

  useEffect(() => {
    (async () => {
      const state = await loadState();
      if (state) {
        setStrokes(state.strokes ?? []);
        if (state.color) setColor(state.color);
      }
      hasLoaded.current = true;
    })();
  }, []);

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

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

  useEffect(() => {
    const offSetColor = bus.register('setColor', ({ hex }: { hex: string }) => {
      setColor(hex);
      if (hasLoaded.current) {
        saveState({ strokes: strokesRef.current, color: hex });
      }
    });
    const offUndo = bus.register('undo', () => {
      setStrokes(s => {
        if (s.length === 0) return s;
        const copy = [...s];
        const last = copy.pop()!;
        setRedoStack(r => [last, ...r]);
        if (hasLoaded.current) {
          saveState({ strokes: copy, color: colorRef.current });
        }
        return copy;
      });
    });
    const offRedo = bus.register('redo', () => {
      setRedoStack(r => {
        if (r.length === 0) return r;
        const [stroke, ...rest] = r;
        setStrokes(s => {
          const next = [...s, stroke];
          if (hasLoaded.current) {
            saveState({ strokes: next, color: colorRef.current });
          }
          return next;
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

  useEffect(() => {
    if (gesture === 'swipeLeft') {
      bus.dispatch({ id: 'undo', args: {} } as AppCommand);
    } else if (gesture === 'swipeRight') {
      bus.dispatch({ id: 'redo', args: {} } as AppCommand);
    }
  }, [gesture, bus]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(s => {
      const next = [...s, stroke];
      if (hasLoaded.current) {
        saveState({ strokes: next, color: colorRef.current });
      }
      return next;
    });
    setRedoStack([]);
  };

  const handlePaletteSelect = (hex: string) => {
    setColor(hex);
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
