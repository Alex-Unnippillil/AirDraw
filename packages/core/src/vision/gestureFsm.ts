import { EventEmitter } from 'events';

export type Gesture = 'idle' | 'draw' | 'palette' | 'fist';

export interface HandInput {
  pinch: number; // 0-1
  fingers: number; // number of extended fingers
}

export class GestureFSM extends EventEmitter {
  private state: Gesture = 'idle';

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
