import { describe, it, expect } from 'vitest';
import { OneEuroFilter } from '../src/vision/oneEuro';

describe('OneEuroFilter', () => {
  it('smooths noisy data', () => {
    const f = new OneEuroFilter({ minCutoff: 1, beta: 0, dcutoff: 1 });
    const values = [0, 10, 0, 10];
    let t = 0;
    const res = values.map(v => f.filter(v, (t += 16)));
    expect(res[1]).toBeLessThan(10);
  });
});
