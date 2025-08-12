import { describe, it, expect } from 'vitest';
import { BrushEngine, DEFAULT_CONFIG } from '../src/draw/brushEngine';

const brush = { type: 'basic', size: 1, opacity: 1, hardness: 1 };

describe('BrushEngine', () => {
  it('uses default filter config when none provided', () => {
    const engine = new BrushEngine();
    expect((engine as any).filterCfg).toEqual(DEFAULT_CONFIG);
  });

  it('filters added points', () => {
    const engine = new BrushEngine();
    engine.start(brush);
    engine.addPoint({ x: 0, y: 0 }, 0);
    engine.addPoint({ x: 10, y: 10 }, 16);
    const stroke = engine.end();
    expect(stroke.points[0]).toEqual({ x: 0, y: 0 });
    expect(stroke.points[1].x).toBeLessThan(10);
    expect(stroke.points[1].y).toBeLessThan(10);
  });

  it('resets filter state and points', () => {
    const engine = new BrushEngine();
    engine.start(brush);
    engine.addPoint({ x: 0, y: 0 }, 0);
    engine.addPoint({ x: 10, y: 10 }, 16);
    engine.end();

    engine.reset();
    engine.start(brush);
    engine.addPoint({ x: 100, y: 100 }, 32);
    const stroke = engine.end();
    expect(stroke.points).toEqual([{ x: 100, y: 100 }]);
  });
});

