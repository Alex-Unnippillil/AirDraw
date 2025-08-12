import { OneEuroFilter } from '../vision/oneEuro';

export interface Vec2 { x: number; y: number }
export interface BrushConfig { type: string; size: number; opacity: number; hardness: number }
export interface BrushStroke { points: Vec2[]; brush: BrushConfig }

export class BrushEngine {
  private points: Vec2[] = [];
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;
  private current?: BrushConfig;
  private filterCfg: { minCutoff: number; beta: number; dcutoff: number };

  constructor(filterCfg = { minCutoff: 1.0, beta: 0.0, dcutoff: 1.0 }) {
    this.filterCfg = filterCfg;
    this.filterX = new OneEuroFilter(filterCfg);
    this.filterY = new OneEuroFilter(filterCfg);
  }

  start(config: BrushConfig) {
    this.current = config;
    this.points = [];
  }

  addPoint(p: Vec2, t = performance.now()) {
    const x = this.filterX.filter(p.x, t);
    const y = this.filterY.filter(p.y, t);
    this.points.push({ x, y });
  }

  end(): BrushStroke {
    if (!this.current) throw new Error('brush not started');
    const stroke = { points: this.points, brush: this.current };
    this.current = undefined;
    this.points = [];
    return stroke;
  }

  reset() {
    this.filterX = new OneEuroFilter(this.filterCfg);
    this.filterY = new OneEuroFilter(this.filterCfg);
    this.points = [];
    this.current = undefined;
  }
}
