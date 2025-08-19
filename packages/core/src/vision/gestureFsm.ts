export type Gesture =
  | 'idle'
  | 'draw'
  | 'palette'
  | 'fist'
  | 'swipeLeft'
  | 'swipeRight';

export interface HandInput {
  pinch: number; // 0-1
  fingers: number; // number of extended fingers
  swipe?: 'left' | 'right' | null;
}

export interface Landmark {
  x: number;
  y: number;
}

const dist = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);

function calcPinch(lm: Landmark[]): number {
  const thumb = lm[4];
  const index = lm[8];
  const scale = dist(lm[0], lm[5]) || 1;
  return Math.max(0, Math.min(1, 1 - dist(thumb, index) / scale));
}

function countFingers(lm: Landmark[]): number {
  const up = (tip: number, pip: number) => (lm[tip].y < lm[pip].y ? 1 : 0);
  let fingers = up(8, 6) + up(12, 10) + up(16, 14) + up(20, 18);
  if (lm[4].x < lm[3].x) fingers++;
  return fingers;
}

type Listener<Args extends unknown[]> = (...args: Args) => void;

interface Emitter<Events extends Record<string, unknown[]>> {
  on<E extends keyof Events>(event: E, listener: Listener<Events[E]>): () => void;
  emit<E extends keyof Events>(event: E, ...args: Events[E]): void;
}

function createEmitter<Events extends Record<string, unknown[]>>(): Emitter<Events> {
  const listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};
  return {
    on(event, listener) {
      (listeners[event] ||= []).push(listener);
      return () => {
        const arr = listeners[event];
        if (!arr) return;
        listeners[event] = arr.filter(l => l !== listener);
      };
    },
    emit(event, ...args) {
      listeners[event]?.forEach(l => l(...args));
    }
  };
}

interface Options {
  drawPinch: number;
  drawMaxFingers: number;
  paletteMinFingers: number;
  fistMaxFingers: number;
}

type Events = { change: [Gesture] };

export class GestureFSM {
  private emitter = createEmitter<Events>();
  private offMap = new Map<Listener<[Gesture]>, () => void>();
  private opts: Options;
  public state: Gesture = 'idle';
  private swipeStart: Landmark | null = null;

  constructor(opts: Partial<Options & { pinchThreshold: number; fingerThreshold: number }> = {}) {
    const drawPinch = opts.drawPinch ?? opts.pinchThreshold ?? 0.8;
    const drawMaxFingers = opts.drawMaxFingers ?? opts.fingerThreshold ?? 2;
    const paletteMinFingers = opts.paletteMinFingers ?? 4;
    const fistMaxFingers = opts.fistMaxFingers ?? 0;
    this.opts = { drawPinch, drawMaxFingers, paletteMinFingers, fistMaxFingers };
  }

  on(event: 'change', listener: Listener<[Gesture]>) {
    return this.emitter.on(event, listener);
  }

  onChange(listener: Listener<[Gesture]>) {
    const off = this.emitter.on('change', listener);
    this.offMap.set(listener, off);
  }

  offChange(listener: Listener<[Gesture]>) {
    const off = this.offMap.get(listener);
    off?.();
    this.offMap.delete(listener);
  }

  reset() {
    this.state = 'idle';
    this.swipeStart = null;
    this.emitter.emit('change', this.state);
  }

  private transition(input: HandInput): Gesture {
    let next: Gesture;

    if (input.swipe === 'left') {
      next = 'swipeLeft';
    } else if (input.swipe === 'right') {
      next = 'swipeRight';
    } else if (input.fingers <= this.opts.fistMaxFingers) {
      next = 'fist';
    } else if (input.pinch >= this.opts.drawPinch && input.fingers <= this.opts.drawMaxFingers) {
      next = 'draw';
    } else if (input.fingers >= this.opts.paletteMinFingers) {
      next = 'palette';
    } else {
      next = 'idle';
    }

    if (next !== this.state) {
      this.state = next;
      this.emitter.emit('change', next);
    }
    return this.state;
  }

  update(input: HandInput | Landmark[] | null = null): Gesture {
    if (Array.isArray(input)) {
      const pinch = calcPinch(input);
      const fingers = countFingers(input);
      let swipe: 'left' | 'right' | null = null;
      if (fingers === 2 && pinch < 0.5) {
        const index = input[8];
        if (!this.swipeStart) {
          this.swipeStart = index;
        } else {
          const dx = index.x - this.swipeStart.x;
          if (Math.abs(dx) > 0.3) {
            swipe = dx > 0 ? 'right' : 'left';
            this.swipeStart = null;
          }
        }
      } else {
        this.swipeStart = null;
      }
      return this.transition({ pinch, fingers, swipe });
    }

    if (!input) {
      return this.transition({ pinch: 0, fingers: 0, swipe: null });
    }
    return this.transition(input);
  }
}

