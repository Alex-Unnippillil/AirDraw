export type Gesture = 'idle' | 'draw' | 'palette' | 'fist';

export interface HandInput {
  pinch: number; // 0-1
  fingers: number; // number of extended fingers
}

export interface GestureFSMOptions {
  drawPinch?: number;
  drawMaxFingers?: number;
  paletteFingers?: number;
  fistFingers?: number;
}

type ChangeHandler = (g: Gesture) => void;

export class GestureFSM {
  private state: Gesture = 'idle';
  private readonly drawPinch: number;
  private readonly drawMaxFingers: number;
  private readonly paletteFingers: number;
  private readonly fistFingers: number;
  private listeners = new Set<ChangeHandler>();

  constructor(opts: GestureFSMOptions = {}) {
    const {
      drawPinch = 0.8,
      drawMaxFingers = 2,
      paletteFingers = 5,
      fistFingers = 0,
    } = opts;
    this.drawPinch = drawPinch;
    this.drawMaxFingers = drawMaxFingers;
    this.paletteFingers = paletteFingers;
    this.fistFingers = fistFingers;
  }

  onChange(fn: ChangeHandler) {
    this.listeners.add(fn);
  }

  offChange(fn: ChangeHandler) {
    this.listeners.delete(fn);
  }

  private emit(next: Gesture) {
    for (const fn of this.listeners) fn(next);
  }

  reset() {
    if (this.state !== 'idle') {
      this.state = 'idle';
      this.emit(this.state);
    }
  }

  update(input: HandInput): Gesture {
    let next: Gesture = this.state;
    if (input.pinch > this.drawPinch && input.fingers <= this.drawMaxFingers)
      next = 'draw';
    else if (input.fingers === this.paletteFingers) next = 'palette';
    else if (input.fingers === this.fistFingers) next = 'fist';
    else next = 'idle';

    if (next !== this.state) {
      this.state = next;
      this.emit(next);
    }
    return this.state;
  }
}
