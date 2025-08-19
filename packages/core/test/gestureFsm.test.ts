import { describe, it, expect } from 'vitest';
import { GestureFSM, Gesture, Landmark } from '../src/vision/gestureFsm';

function createDrawLandmarks(): Landmark[] {
  const lm: Landmark[] = Array(21)
    .fill(0)
    .map(() => ({ x: 0, y: 2 }));
  lm[0] = { x: 0, y: 0 };
  lm[5] = { x: 1, y: 0 };
  lm[3] = { x: -1, y: 1 };
  lm[4] = { x: 0, y: 0 };
  lm[6] = { x: 0, y: 1 };
  lm[8] = { x: 0.1, y: 0 }; // index finger extended
  lm[10] = { x: 0, y: 1 };
  lm[12] = { x: 0, y: 2 };
  lm[14] = { x: 0, y: 1 };
  lm[16] = { x: 0, y: 2 };
  lm[18] = { x: 0, y: 1 };
  lm[20] = { x: 0, y: 2 };
  return lm;
}

function createThreeFingerLandmarks(): Landmark[] {
  const lm = createDrawLandmarks();
  lm[8] = { x: 0.4, y: 0 }; // pinch = 0.6
  lm[12] = { x: 0, y: 0 }; // middle finger extended
  lm[16] = { x: 0, y: 0 }; // ring finger extended
  return lm;
}

function createSwipeLandmarks(x: number): Landmark[] {
  const lm: Landmark[] = Array(21)
    .fill(0)
    .map(() => ({ x: 0, y: 2 }));
  lm[0] = { x: 0, y: 0 };
  lm[5] = { x: 1, y: 0 };
  lm[3] = { x: -1, y: 1 };
  lm[4] = { x: 0, y: 0 };
  lm[6] = { x: 0, y: 1 };
  lm[8] = { x, y: 0 }; // index tip position controls swipe
  lm[10] = { x: 0, y: 1 };
  lm[12] = { x: 0, y: 0 }; // middle finger extended
  lm[14] = { x: 0, y: 1 };
  lm[16] = { x: 0, y: 2 };
  lm[18] = { x: 0, y: 1 };
  lm[20] = { x: 0, y: 2 };
  return lm;
}

describe('GestureFSM', () => {
  it('emits change event for draw gesture', () => {
    const fsm = new GestureFSM();
    let emitted: Gesture | undefined;
    fsm.on('change', g => {
      emitted = g;
    });
    fsm.update(createDrawLandmarks());
    expect(emitted).toBe('draw');
  });

  it('supports custom thresholds', () => {
    const fsm = new GestureFSM({ pinchThreshold: 0.5, fingerThreshold: 3 });
    const g = fsm.update(createThreeFingerLandmarks());
    expect(g).toBe('draw');
  });

  it('uses custom thresholds', () => {
    const fsm = new GestureFSM({ drawPinch: 0.5, drawMaxFingers: 3 });
    const g = fsm.update(createThreeFingerLandmarks());
    expect(g).toBe('draw');
  });

  it('detaches change handler', () => {
    const fsm = new GestureFSM();
    let calls = 0;
    const handler = () => {
      calls++;
    };
    fsm.onChange(handler);
    fsm.update(createDrawLandmarks());
    fsm.offChange(handler);
    fsm.reset();
    expect(calls).toBe(1);
  });

  it('handles swipe gestures', () => {
    const fsm = new GestureFSM();
    const events: Gesture[] = [];
    fsm.on('change', g => events.push(g));
    fsm.update(createSwipeLandmarks(0.95));
    fsm.update(createSwipeLandmarks(0.55));
    expect(events.at(-1)).toBe('swipeLeft');
    fsm.update(createSwipeLandmarks(0.6));
    fsm.update(createSwipeLandmarks(1.0));
    expect(events.at(-1)).toBe('swipeRight');
  });

  it('resets to idle after swipe', () => {
    const fsm = new GestureFSM();
    fsm.update(createSwipeLandmarks(0.95));
    fsm.update(createSwipeLandmarks(0.55));
    const g = fsm.update(createSwipeLandmarks(0.95));
    expect(g).toBe('idle');
  });
});

