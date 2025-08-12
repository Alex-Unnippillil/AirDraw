import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

vi.mock('@mediapipe/hands', () => {
  const setOptionsMock = vi.fn();
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 1 }));
  landmarks[4] = { x: 0.6, y: 0.5 }; // thumb tip
  landmarks[3] = { x: 0.5, y: 0.5 }; // thumb ip
  landmarks[8] = { x: 0.6, y: 0.5 }; // index tip close to thumb
  landmarks[6] = { x: 0.6, y: 1 }; // index pip below tip => extended

  class Hands {
    onResultsCb: any;
    constructor(public opts: any) {}
    setOptions = setOptionsMock;
    onResults(cb: any) { this.onResultsCb = cb; }
    async send() { this.onResultsCb({ multiHandLandmarks: [landmarks] }); }
    close() {}
  }
  return { Hands, setOptionsMock };
});

import { useHandTracking } from '../src/hooks/useHandTracking';
import { setOptionsMock } from '@mediapipe/hands';

describe('useHandTracking', () => {
  let stop: any;

  beforeEach(() => {
    stop = vi.fn();
    Object.assign(navigator, {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] }),
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    let calls = 0;
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      if (calls++ < 1) cb(0);
      return 1;
    };
    globalThis.cancelAnimationFrame = vi.fn();
  });

  it('processes keypoints and stops tracks on cleanup', async () => {
    const onGesture = vi.fn();
    function TestComp() {
      const { videoRef, gesture } = useHandTracking({ handedness: 'both' });
      useEffect(() => onGesture(gesture), [gesture]);
      return React.createElement('video', { ref: videoRef });
    }

    const div = document.createElement('div');
    const root = createRoot(div);
    await act(async () => {
      root.render(React.createElement(TestComp));
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(onGesture).toHaveBeenCalledWith('draw');
    expect(setOptionsMock).toHaveBeenCalledWith(expect.objectContaining({ maxNumHands: 2 }));

    await act(async () => {
      root.unmount();
    });
    expect(stop).toHaveBeenCalled();
  });
});
