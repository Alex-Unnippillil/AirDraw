export type Gesture = 'idle' | 'draw' | 'palette' | 'fist' | 'swipeLeft' | 'swipeRight';

export interface HandInput {
  pinch: number; // 0-1
  fingers: number; // number of extended fingers
  swipe?: 'left' | 'right';
}

type Listener<Args extends any[]> = (...args: Args) => void;

interface Emitter<Events extends Record<string, any[]>> {
  on<E extends keyof Events>(event: E, listener: Listener<Events[E]>): () => void;
  emit<E extends keyof Events>(event: E, ...args: Events[E]): void;
}

function createEmitter<Events extends Record<string, any[]>>(): Emitter<Events> {
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
    this.emitter.emit('change', this.state);
  }

  update(input: HandInput): Gesture {
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
}

