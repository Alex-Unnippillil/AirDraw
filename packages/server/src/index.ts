import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

export const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.send('ok'));

let server: ReturnType<typeof app.listen> | undefined;

export function start(port = 3000) {
  server = app.listen(port, () => console.log('server running on', port));
  return server;
}

export function stop() {
  server?.close();
  server = undefined;
}
