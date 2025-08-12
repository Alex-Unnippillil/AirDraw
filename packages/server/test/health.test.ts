import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src';

describe('GET /health', () => {
  it('responds with ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('ok');
  });
});
