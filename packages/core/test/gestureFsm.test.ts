import { describe, it, expect } from 'vitest';
import { GestureFSM, Gesture } from '../src/vision/gestureFsm';

describe('GestureFSM', () => {
  it('emits change event for draw gesture', () => {
    const fsm = new GestureFSM();
    let emitted: Gesture | undefined;
    fsm.on('change', g => { emitted = g; });
    fsm.update({ pinch: 0.9, fingers: 2 });
    expect(emitted).toBe('draw');
  });

  it('supports custom thresholds', () => {
    const fsm = new GestureFSM({ pinchThreshold: 0.5, fingerThreshold: 3 });
    const g = fsm.update({ pinch: 0.6, fingers: 3 });
    expect(g).toBe('draw');
  });
});
