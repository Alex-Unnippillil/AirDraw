import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';


export function App() {
  const { videoRef, gesture, error } = useHandTracking();
  const bus = useCommandBus();
  const [prompt, setPrompt] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      await bus.dispatch(cmd);
    }
    setPrompt('');
  };


  };

  return (
    <div>

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
      <App />
    </CommandBusProvider>
  );
}

export default App;

