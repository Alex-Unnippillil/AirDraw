import express from 'express';
export const app = express();
app.get('/health', (_req, res) => res.send('ok'));
export function start(port = 3000) {
  return app.listen(port, () => console.log('server running on', port));
}
