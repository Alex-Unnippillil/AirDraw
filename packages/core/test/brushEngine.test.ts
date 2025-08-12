import { describe, it, expect } from 'vitest';
import { BrushEngine } from '../src/draw/brushEngine';

const brush = { type: 'basic', size: 1, opacity: 1, hardness: 1 };

describe('BrushEngine', () => {
  it('starts new strokes from unfiltered positions', () => {
    const engine = new BrushEngine();

    engine.start(brush);
    engine.addPoint({ x: 0, y: 0 }, 0);
    engine.addPoint({ x: 10, y: 10 }, 1);
    engine.end();

    engine.start(brush);
    engine.addPoint({ x: 100, y: 100 }, 2);
    const stroke = engine.end();

    expect(stroke.points[0]).toEqual({ x: 100, y: 100 });
  });
});
