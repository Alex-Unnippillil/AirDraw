import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import { useHandTracking } from './hooks/useHandTracking';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';
import { loadProject, saveColor, saveStrokes } from './storage/indexedDb';

export interface AppProps {
  projectId?: string;
}

export function App({ projectId = 'default' }: AppProps) {
  const { gesture, error } = useHandTracking();
  const bus = useCommandBus();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState('#000000');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    loadProject(projectId).then(data => {
      if (data) {
        setStrokes(data.strokes ?? []);
        setColor(data.color ?? '#000000');
      }
    });
  }, [projectId]);

  useEffect(() => {
    const unregisterSetColor = bus.register('setColor', ({ hex }) => {
      setColor(hex);
      saveColor(projectId, hex);
    });
    const unregisterUndo = bus.register('undo', () => {
      setStrokes(prev => {
        const next = prev.slice(0, -1);
        saveStrokes(projectId, next);
        return next;
      });
    });
    return () => {
      unregisterSetColor();
      unregisterUndo();
    };
  }, [bus, projectId]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(prev => {
      const next = [...prev, stroke];
      saveStrokes(projectId, next);
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

  return (
    <div>
      {gesture === 'palette' && (
        <RadialPalette onSelect={cmd => bus.dispatch(cmd as AppCommand)} />
      )}
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        projectId={projectId}
        onStrokeComplete={handleStrokeComplete}
      />
      <form onSubmit={handleSubmit}>
        <input
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </form>
      <pre data-testid="strokes">{JSON.stringify(strokes)}</pre>
      {error && <div role="alert">{error.message}</div>}
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

export default App;
