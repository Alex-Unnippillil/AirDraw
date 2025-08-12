import { describe, it, expect } from 'vitest';
import { GestureFSM } from '../src/vision/gestureFsm';

describe('GestureFSM transitions', () => {
  it('transitions idle -> draw and emits event', () => {
    const fsm = new GestureFSM();
    let emitted = false;
    fsm.on('draw', () => {
      emitted = true;
    });
    const g = fsm.update({ pinch: 0.9, fingers: 1 });
    expect(g).toBe('draw');
    expect(emitted).toBe(true);
  });

  it('transitions draw -> palette and emits event', () => {
    const fsm = new GestureFSM();
    fsm.update({ pinch: 0.9, fingers: 1 }); // move to draw first
    let emitted = false;
    fsm.on('palette', () => {
      emitted = true;
    });
    const g = fsm.update({ pinch: 0, fingers: 5 });
    expect(g).toBe('palette');
    expect(emitted).toBe(true);
  });

  it('transitions palette -> fist and emits event', () => {
    const fsm = new GestureFSM();
    fsm.update({ pinch: 0, fingers: 5 }); // move to palette first
    let emitted = false;
    fsm.on('fist', () => {
      emitted = true;
    });
    const g = fsm.update({ pinch: 0, fingers: 0 });
    expect(g).toBe('fist');
    expect(emitted).toBe(true);
  });

  it('transitions fist -> idle and emits event', () => {
    const fsm = new GestureFSM();
    fsm.update({ pinch: 0, fingers: 0 }); // move to fist first
    let emitted = false;
    fsm.on('idle', () => {
      emitted = true;
    });
    const g = fsm.update({ pinch: 0, fingers: 2 });
    expect(g).toBe('idle');
    expect(emitted).toBe(true);
  });
});

