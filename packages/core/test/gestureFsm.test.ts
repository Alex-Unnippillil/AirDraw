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

  it('handles swipe gestures', () => {
    const fsm = new GestureFSM();
    const events: Gesture[] = [];
    fsm.on('change', g => events.push(g));
    fsm.update({ pinch: 0, fingers: 2, swipe: 'left' });
    expect(events.at(-1)).toBe('swipeLeft');
    fsm.update({ pinch: 0, fingers: 2 });
    fsm.update({ pinch: 0, fingers: 2, swipe: 'right' });
    expect(events.at(-1)).toBe('swipeRight');
  });

  it('resets to idle after swipe', () => {
    const fsm = new GestureFSM();
    fsm.update({ pinch: 0, fingers: 2, swipe: 'left' });
    const g = fsm.update({ pinch: 0, fingers: 2 });
    expect(g).toBe('idle');
  });
});
