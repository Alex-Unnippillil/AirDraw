export interface OneEuroConfig {
  minCutoff: number;
  beta: number;
  dcutoff: number;
}

export class OneEuroFilter {
  private prev?: { value: number; timestamp: number };
  private dPrev?: number;
  constructor(private config: OneEuroConfig) {}

  reset() {
    this.prev = undefined;
    this.dPrev = undefined;
  }

  private alpha(t_e: number, cutoff: number) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / t_e);
  }

  filter(value: number, timestamp: number): number {
    if (!this.prev) {
      this.prev = { value, timestamp };
      return value;
    }
    const dt = (timestamp - this.prev.timestamp) || 1 / 60;
    const dx = (value - this.prev.value) / dt;
    const alphaD = this.alpha(dt, this.config.dcutoff);
    const d = this.dPrev === undefined ? dx : this.dPrev + alphaD * (dx - this.dPrev);
    const cutoff = this.config.minCutoff + this.config.beta * Math.abs(d);
    const alpha = this.alpha(dt, cutoff);
    const filtered = this.prev.value + alpha * (value - this.prev.value);
    this.prev = { value: filtered, timestamp };
    this.dPrev = d;
    return filtered;
  }
}
