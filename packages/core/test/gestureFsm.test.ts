import { describe, it, expect } from 'vitest';
import { GestureFSM } from '../src/vision/gestureFsm';

describe('GestureFSM', () => {
  it('detects draw gesture', () => {
    const fsm = new GestureFSM();
    const g = fsm.update({ pinch: 0.9, fingers: 2 });
    expect(g).toBe('draw');
  });

  it('uses custom thresholds', () => {
    const fsm = new GestureFSM({ drawPinch: 0.5, drawMaxFingers: 3 });
    const g = fsm.update({ pinch: 0.6, fingers: 3 });
    expect(g).toBe('draw');
  });

  it('detaches change handler', () => {
    const fsm = new GestureFSM();
    let calls = 0;
    const handler = () => {
      calls++;
    };
    fsm.onChange(handler);
    fsm.update({ pinch: 0.9, fingers: 2 });
    fsm.offChange(handler);
    fsm.reset();
    expect(calls).toBe(1);
  });
});
