export type Gesture = 'idle' | 'draw' | 'palette' | 'fist';

export interface HandInput {
  pinch: number; // 0-1
  fingers: number; // number of extended fingers
}

export interface GestureFsmConfig {
  /** Pinch value above which a draw gesture is detected */
  pinchThreshold?: number;
  /** Maximum number of fingers extended for a draw gesture */
  fingerThreshold?: number;
}

export interface GestureFsmEvents {
  change: (g: Gesture) => void;
}

const DEFAULT_CONFIG: Required<GestureFsmConfig> = {
  pinchThreshold: 0.8,
  fingerThreshold: 2,
};

export class GestureFSM {
  private state: Gesture = 'idle';
  private config: Required<GestureFsmConfig>;
  private listeners: { [K in keyof GestureFsmEvents]?: GestureFsmEvents[K][] } = {};

  constructor(config: GestureFsmConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  on<K extends keyof GestureFsmEvents>(event: K, listener: GestureFsmEvents[K]): void {
    (this.listeners[event] ||= []).push(listener);
  }

  off<K extends keyof GestureFsmEvents>(event: K, listener: GestureFsmEvents[K]): void {
    const arr = this.listeners[event];
    if (!arr) return;
    const idx = arr.indexOf(listener);
    if (idx >= 0) arr.splice(idx, 1);
  }

  private emit<K extends keyof GestureFsmEvents>(event: K, ...args: Parameters<GestureFsmEvents[K]>): void {
    this.listeners[event]?.forEach(fn => fn(...args));
  }

  update(input: HandInput): Gesture {
    let next: Gesture = this.state;
    if (input.pinch > this.config.pinchThreshold && input.fingers <= this.config.fingerThreshold) next = 'draw';
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
