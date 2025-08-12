import request from 'supertest';
import { describe, it, beforeEach, afterEach } from 'vitest';
import { start, stop } from '../src/index';

describe('health endpoint', () => {
  let server: ReturnType<typeof start>;

  beforeEach(() => {
    server = start(0);
  });

  afterEach(() => {
    stop();
  });

  it('responds with ok', async () => {
    await request(server).get('/health').expect(200, 'ok');
  });
});
