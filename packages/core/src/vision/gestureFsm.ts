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

type GestureEvents = {
  change: [Gesture];
};

export class GestureFSM {
  private state: Gesture = 'idle';
  private emitter = createEmitter<GestureEvents>();

  on<E extends keyof GestureEvents>(event: E, listener: Listener<GestureEvents[E]>): () => void {
    return this.emitter.on(event, listener);
  }

  private emit<E extends keyof GestureEvents>(event: E, ...args: GestureEvents[E]): void {
    this.emitter.emit(event, ...args);
  }

  update(input: HandInput): Gesture {
    let next: Gesture = this.state;
    if (input.pinch > 0.8 && input.fingers <= 2) next = 'draw';
    else if (input.fingers === 5) next = 'palette';
    else if (input.fingers === 0) next = 'fist';
    else next = 'idle';

    if (next !== this.state) {
      this.state = next;
      this.emit('change', next);
    }
    return this.state;
  }
}
