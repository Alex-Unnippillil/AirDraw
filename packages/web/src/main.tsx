import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { RadialPalette } from './components/RadialPalette';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';
import type { AppCommand } from './commands';
import type { Stroke } from './types';
import { parsePrompt } from './ai/copilot';
import { loadProjectState, saveProjectState } from './storage/indexedDb';
import { useHandTracking } from './hooks/useHandTracking';

export interface AppProps {
  projectId?: string;
}

export function App({ projectId = 'default' }: AppProps) {
  const [prompt, setPrompt] = useState('');
  const [color, setColor] = useState('#000000');
  const [initialStrokes, setInitialStrokes] = useState<Stroke[]>([]);
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const bus = useCommandBus();
  const { videoRef, gesture, error } = useHandTracking();

  useEffect(() => {
    loadProjectState<Stroke>(projectId).then(state => {
      if (state) {
        setColor(state.palette);
        setInitialStrokes(state.strokes);
      }
    });
  }, [projectId]);

  const handlePaletteSelect = (cmd: AppCommand) => {
    bus.dispatch(cmd);
    if (cmd.id === 'setColor') {
      const hex = cmd.args.hex;
      setColor(hex);
      saveProjectState(projectId, {
        strokes: canvasRef.current ? canvasRef.current.strokes : [],
        palette: hex,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      handlePaletteSelect(cmd);
    }
    setPrompt('');
  };

  return (
    <div>
      <video ref={videoRef} />
      <DrawingCanvas
        ref={canvasRef}
        projectId={projectId}
        initialStrokes={initialStrokes}
        palette={color}
      />
      <div data-testid="selected-color">{color}</div>
      {gesture === 'palette' && <RadialPalette onSelect={handlePaletteSelect} />}
      {error && <div role='alert'>{error.message}</div>}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </form>
    </div>
  );
}

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <CommandBusProvider>
      <App />
    </CommandBusProvider>
  );
}
