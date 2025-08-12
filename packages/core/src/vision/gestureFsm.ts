export type Gesture = 'idle' | 'draw' | 'palette' | 'fist';

export interface HandInput {
  pinch: number; // 0-1
  fingers: number; // number of extended fingers
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
    },
  };
}

interface GestureFSMOptions {
  /** minimum pinch value considered a draw gesture */
  drawPinch?: number;
  /** maximum number of fingers extended while drawing */
  drawMaxFingers?: number;
  /** minimum fingers extended to show the palette */
  paletteMinFingers?: number;
  /** maximum fingers extended to count as a fist */
  fistMaxFingers?: number;
}

type GestureEvents = {
  idle: [];
  draw: [];
  palette: [];
  fist: [];
};

/**
 * Finite state machine mapping raw hand input to discrete gestures.
 * Emits events whenever the gesture changes.
 */
export class GestureFSM {
  private opts: Required<GestureFSMOptions>;
  private state: Gesture = 'idle';
  private emitter = createEmitter<GestureEvents>();

  constructor(opts: GestureFSMOptions = {}) {
    this.opts = {
      drawPinch: 0.8,
      drawMaxFingers: 2,
      paletteMinFingers: 4,
      fistMaxFingers: 0,
      ...opts,
    };
  }

  on<E extends keyof GestureEvents>(event: E, listener: Listener<GestureEvents[E]>) {
    return this.emitter.on(event, listener);
  }

  private emit<E extends keyof GestureEvents>(event: E) {
    this.emitter.emit(event);
  }

  reset() {
    this.state = 'idle';
  }

  getState(): Gesture {
    return this.state;
  }

  update(input: HandInput): Gesture {
    let next: Gesture = 'idle';

    if (input.pinch >= this.opts.drawPinch && input.fingers <= this.opts.drawMaxFingers) {
      next = 'draw';
    } else if (input.fingers >= this.opts.paletteMinFingers) {
      next = 'palette';
    } else if (input.fingers <= this.opts.fistMaxFingers) {
      next = 'fist';
    } else {
      next = 'idle';
    }

    if (next !== this.state) {
      this.state = next;
      this.emit(next);
    }
    return this.state;
  }
}

