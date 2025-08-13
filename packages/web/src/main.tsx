import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { AppCommand } from './commands';
import { parsePrompt } from './ai/copilot';
import { loadState, saveState } from './storage/indexedDb';

export function App() {

  const bus = useCommandBus();
  const [prompt, setPrompt] = useState('');
  const [color, setColor] = useState('#000000');
  const [strokes, setStrokes] = useState<Stroke[]>([]);



  };

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

      <form onSubmit={handleSubmit}>
        <input
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </form>
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
