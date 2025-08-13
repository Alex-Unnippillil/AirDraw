import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RadialPalette from './components/RadialPalette';
import DrawingCanvas, { Stroke } from './components/DrawingCanvas';
import { useHandTracking } from './hooks/useHandTracking';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import { PrivacyProvider, usePrivacy } from './context/PrivacyContext';
import { saveProject, loadProject } from './storage/indexedDb';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const bus = useCommandBus();
  const { enabled: cameraEnabled } = usePrivacy();
  const [prompt, setPrompt] = useState('');
  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  useEffect(() => {
    loadProject('default').then(data => {
      if (data) {
        setStrokes(data.strokes || []);
        if (data.settings?.color) setColor(data.settings.color);
      }
    });
  }, []);

  useEffect(() => {
    saveProject('default', { strokes, settings: { color } });
  }, [strokes, color]);

  useEffect(() => {
    const unregs = [
      bus.register('setColor', ({ hex }) => setColor(hex)),
      bus.register('undo', () => setStrokes(s => s.slice(0, -1)))
    ];
    return () => { unregs.forEach(u => u()); };
  }, [bus]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(s => [...s, stroke]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cameraEnabled) return;
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
  };

  return (
    <div>
      <video ref={videoRef} />
      {cameraEnabled && <div data-testid="camera-indicator">camera on</div>}
      {gesture === 'palette' && (
        <RadialPalette onSelect={cmd => bus.dispatch(cmd as AppCommand)} />
      )}
      {error && <div role="alert">{error.message}</div>}
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
      <pre data-testid="strokes">{JSON.stringify(strokes)}</pre>
    </div>
  );
}

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <CommandBusProvider>
      <PrivacyProvider>
        <App />
      </PrivacyProvider>
    </CommandBusProvider>
  );
}

export default App;
