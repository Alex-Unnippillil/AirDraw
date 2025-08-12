import { describe, it, expect } from 'vitest';
import { app } from '../src/index';

describe('GET /health', () => {
  it('responds with ok', async () => {
    const server = app.listen(0);
    await new Promise(resolve => server.once('listening', resolve));
    const { port } = server.address() as any;
    const res = await fetch(`http://localhost:${port}/health`);
    const text = await res.text();
    expect(text).toBe('ok');
    await new Promise(resolve => server.close(resolve));
  });
});
