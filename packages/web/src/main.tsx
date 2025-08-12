import { useState } from 'react';
import { createRoot } from 'react-dom/client';
bus.register('setColor', async args => console.log('setColor', args));
bus.register('undo', () => console.log('undo'));

  const handleCommand = (cmd: AppCommand) => {
    bus.dispatch(cmd);
  };


  return (
    <div>
      <video ref={videoRef} hidden />
      <div>Gesture: {gesture}</div>

    </div>
  );
}

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(<App />);
}
