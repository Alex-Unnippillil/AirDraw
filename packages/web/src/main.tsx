import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Command } from '@airdraw/core';


import { useHandTracking } from './hooks/useHandTracking';
import { parsePrompt } from './ai/copilot';
import { loadState, saveState } from './storage/indexedDb';

export function App() {
  const bus = useCommandBus();
  const { videoRef, gesture, error } = useHandTracking();


  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
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
