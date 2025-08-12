import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

  const [prompt, setPrompt] = useState('');
  const bus = useCommandBus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmds: AppCommand[] = await parsePrompt(prompt);
    for (const cmd of cmds) {
      bus.dispatch(cmd);
    }
    setPrompt('');
  };


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
