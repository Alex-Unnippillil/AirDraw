import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DrawingCanvas, { Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import PrivacyIndicator from './components/PrivacyIndicator';
import { useHandTracking } from './hooks/useHandTracking';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import { PrivacyProvider, usePrivacy } from './context/PrivacyContext';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const { enabled: privacyEnabled } = usePrivacy();
  const bus = useCommandBus();
  const [prompt, setPrompt] = useState('');
  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  useEffect(() => {
    const unsubColor = bus.register('setColor', cmd => setColor(cmd.hex));
    const unsubUndo = bus.register('undo', () => setStrokes(s => s.slice(0, -1)));
    return () => { unsubColor(); unsubUndo(); };
  }, [bus]);

  const handleStrokeComplete = (stroke: Stroke) => {
    setStrokes(s => [...s, stroke]);
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
      <video ref={videoRef} />
      {!privacyEnabled && <PrivacyIndicator />}
      {gesture === 'palette' && <RadialPalette onSelect={cmd => bus.dispatch(cmd)} />}
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        onStrokeComplete={handleStrokeComplete}
      />
      {error && <div role="alert">{error.message}</div>}
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
    <PrivacyProvider>
      <CommandBusProvider>
        <App />
      </CommandBusProvider>
    </PrivacyProvider>
  );
}

export default App;
