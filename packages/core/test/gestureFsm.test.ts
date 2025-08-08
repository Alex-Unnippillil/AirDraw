import { describe, it, expect } from 'vitest';
import { GestureFSM } from '../src/vision/gestureFsm';

describe('GestureFSM', () => {
  it('detects draw gesture', () => {
    const fsm = new GestureFSM();
    const g = fsm.update({ pinch: 0.9, fingers: 2 });
    expect(g).toBe('draw');
  });
});
