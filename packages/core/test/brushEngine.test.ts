import { describe, it, expect } from 'vitest';
import { BrushEngine } from '../src/draw/brushEngine';

const baseConfig = { type: 'pen', size: 1, opacity: 1, hardness: 1 };

describe('BrushEngine', () => {
  it('applies smoothing via OneEuro filter', () => {
    const engine = new BrushEngine();
    engine.start(baseConfig);
    let t = 0;
    engine.addPoint({ x: 0, y: 0 }, (t += 16));
    engine.addPoint({ x: 10, y: 10 }, (t += 16));
    const pts = (engine as any).points as { x: number; y: number }[];
    expect(pts[1].x).toBeLessThan(10);
  });

  it('returns Catmull-Rom interpolated stroke', () => {
    const engine = new BrushEngine();
    engine.start(baseConfig, { minCutoff: 1e6, beta: 0, dcutoff: 1e6 });
    let t = 0;
    const raw = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 }
    ];
    for (const p of raw) engine.addPoint(p, (t += 16));
    const stroke = engine.end();
    const expected = [
      { x: 0, y: 0 },
      { x: 0.0771484375, y: 0.0908203125 },
      { x: 0.1796875, y: 0.2265625 },
      { x: 0.3017578125, y: 0.3896484375 },
      { x: 0.4375, y: 0.5625 },
      { x: 0.5810546875, y: 0.7275390625 },
      { x: 0.7265625, y: 0.8671875 },
      { x: 0.8681640625, y: 0.9638671875 },
      { x: 1, y: 1 },
      { x: 1.1318359375, y: 0.9638671875 },
      { x: 1.2734375, y: 0.8671875 },
      { x: 1.4189453125, y: 0.7275390625 },
      { x: 1.5625, y: 0.5625 },
      { x: 1.6982421875, y: 0.3896484375 },
      { x: 1.8203125, y: 0.2265625 },
      { x: 1.9228515625, y: 0.0908203125 },
      { x: 2, y: 0 }
    ];
    expect(stroke.points.length).toBe(expected.length);
    expected.forEach((p, i) => {
      expect(stroke.points[i].x).toBeCloseTo(p.x, 6);
      expect(stroke.points[i].y).toBeCloseTo(p.y, 6);
    });
  });
});
