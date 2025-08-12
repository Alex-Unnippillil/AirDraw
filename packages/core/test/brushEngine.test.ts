import { describe, it, expect } from 'vitest';
import { BrushEngine, type BrushConfig } from '../src/draw/brushEngine';

const cfg: BrushConfig = { type: 'pen', size: 1, opacity: 1, hardness: 1 };

describe('BrushEngine', () => {
  it('enforces start/addPoint/end order', () => {
    const engine = new BrushEngine();
    expect(() => engine.addPoint({ x: 0, y: 0 }, 0)).toThrowError();
    expect(() => engine.end()).toThrowError();

    engine.start(cfg);
    engine.addPoint({ x: 1, y: 2 }, 16);
    const stroke = engine.end();
    expect(stroke.points.length).toBe(1);
  });

  it('resets without producing a stroke', () => {
    const engine = new BrushEngine();
    engine.start(cfg);
    engine.addPoint({ x: 0, y: 0 }, 0);
    engine.reset();

    expect(() => engine.end()).toThrowError();

    engine.start(cfg);
    engine.addPoint({ x: 1, y: 1 }, 16);
    const stroke = engine.end();
    expect(stroke.points.length).toBe(1);
  });
});

