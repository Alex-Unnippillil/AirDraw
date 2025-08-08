import express from 'express';
const app = express();
app.get('/health', (_req, res) => res.send('ok'));
export function start(port = 3000) {
  app.listen(port, () => console.log('server running on', port));
}
