import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { AppCommand } from './commands';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import PrivacyIndicator from './components/PrivacyIndicator';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { PrivacyProvider, usePrivacy } from './context/PrivacyContext';
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

  const cameraActive = !!videoRef.current && !!(videoRef.current as any).srcObject;

  return (
    <div>
      <video ref={videoRef} style={{ display: cameraActive ? 'block' : 'none' }} />
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
