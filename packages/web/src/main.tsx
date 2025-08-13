import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useHandTracking } from './hooks/useHandTracking';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import { PrivacyProvider, usePrivacy } from './context/PrivacyContext';
import RadialPalette from './components/RadialPalette';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import CameraIndicator from './components/CameraIndicator';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';

export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const bus = useCommandBus();
  const { enabled: privacyEnabled } = usePrivacy();
  const [prompt, setPrompt] = useState('');
  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  useEffect(() => {
    bus.register('setColor', ({ hex }) => setColor(hex));
    bus.register('undo', () => setStrokes(s => s.slice(0, -1)));
  }, [bus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (privacyEnabled) return;
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
  };

  const handlePaletteSelect = (cmd: AppCommand) => {
    bus.dispatch(cmd);
  };

  return (
    <div>
      {error && <div role="alert">{error.message}</div>}
      <video ref={videoRef} />
      <CameraIndicator active={!privacyEnabled} />
      <DrawingCanvas
        gesture={gesture}
        color={color}
        strokes={strokes}
        onStrokeComplete={s => setStrokes(strokes => [...strokes, s])}
      />
      {gesture === 'palette' && <RadialPalette onSelect={handlePaletteSelect} />}
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
