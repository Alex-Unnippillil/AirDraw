import { describe, it, expect, vi } from 'vitest';
import { BrushEngine } from '../src/draw/brushEngine';

const brush = { type: 'pencil', size: 1, opacity: 1, hardness: 1 };

describe('BrushEngine', () => {
  it('records a stroke between start and end', () => {
    const engine = new BrushEngine();
    const spy = vi.spyOn(performance, 'now').mockReturnValue(0);
    engine.start(brush);
    engine.addPoint({ x: 0, y: 0 });
    engine.addPoint({ x: 10, y: 0 }, 16);
    const stroke = engine.end();
    spy.mockRestore();
    expect(stroke.brush).toEqual(brush);
    expect(stroke.points.length).toBe(2);
  });

  it('smooths noisy input using one-euro filter', () => {
    const engine = new BrushEngine({ minCutoff: 1, beta: 0, dcutoff: 1 });
    engine.start(brush);
    const times = [0, 16, 32, 48];
    const values = [0, 10, 0, 10];
    values.forEach((v, i) => engine.addPoint({ x: v, y: 0 }, times[i]));
    const stroke = engine.end();
    expect(stroke.points[1].x).toBeLessThan(10);
  });

  it('can reset filters between strokes', () => {
    const engine = new BrushEngine();
    engine.start(brush);
    engine.addPoint({ x: 0, y: 0 }, 0);
    engine.addPoint({ x: 10, y: 0 }, 16);
    engine.end();
    engine.start(brush);
    engine.addPoint({ x: 10, y: 0 }, 32);
    const stroke1 = engine.end();
    expect(stroke1.points[0].x).toBeLessThan(10);
    engine.reset();
    engine.start(brush);
    engine.addPoint({ x: 10, y: 0 }, 0);
    const stroke2 = engine.end();
    expect(stroke2.points[0].x).toBe(10);
  });
});
