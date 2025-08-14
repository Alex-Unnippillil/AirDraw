import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import { useHandTracking } from './hooks/useHandTracking';
import { useCommandBus, CommandBusProvider } from './context/CommandBusContext';
import { PrivacyProvider } from './context/PrivacyContext';
import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';
import DrawingCanvas, { type Stroke } from './components/DrawingCanvas';
import RadialPalette from './components/RadialPalette';
import { CommandBusProvider, useCommandBus } from './context/CommandBusContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { useHandTracking } from './hooks/useHandTracking';
import { loadState, saveState } from './storage/indexedDb';

export function App() {
  const bus = useCommandBus();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
  };

  const handlePaletteSelect = async (cmd: any) => {
    await bus.dispatch(cmd as AppCommand);
  };


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

