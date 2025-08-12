import { OneEuroFilter, OneEuroConfig } from '../vision/oneEuro';

export interface Vec2 { x: number; y: number }
export interface BrushConfig { type: string; size: number; opacity: number; hardness: number }
export interface BrushStroke { points: Vec2[]; brush: BrushConfig }

export class BrushEngine {
  private points: Vec2[] = [];
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;
  private current?: BrushConfig;
  private baseCfg: OneEuroConfig;

  constructor(filterCfg: OneEuroConfig = { minCutoff: 1.0, beta: 0.0, dcutoff: 1.0 }) {
    this.baseCfg = filterCfg;
    this.filterX = new OneEuroFilter(filterCfg);
    this.filterY = new OneEuroFilter(filterCfg);
  }

  start(config: BrushConfig, filterCfg?: OneEuroConfig) {
    this.current = config;
    this.points = [];
    const cfg = filterCfg || this.baseCfg;
    this.filterX = new OneEuroFilter(cfg);
    this.filterY = new OneEuroFilter(cfg);
  }

  addPoint(p: Vec2, t: number) {
    const x = this.filterX.filter(p.x, t);
    const y = this.filterY.filter(p.y, t);
    this.points.push({ x, y });
  }

  private fitCatmull(points: Vec2[], segments = 8): Vec2[] {
    if (points.length < 2) return points.slice();
    const res: Vec2[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      for (let j = 0; j < segments; j++) {
        const t = j / segments;
        const t2 = t * t;
        const t3 = t2 * t;
        const x =
          0.5 *
          ((2 * p1.x) +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
        const y =
          0.5 *
          ((2 * p1.y) +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
        res.push({ x, y });
      }
    }
    res.push(points[points.length - 1]);
    return res;
  }

  end(): BrushStroke {
    if (!this.current) throw new Error('brush not started');
    const fitted = this.fitCatmull(this.points);
    const stroke = { points: fitted, brush: this.current };
    this.current = undefined;
    this.points = [];
    return stroke;
  }
}
