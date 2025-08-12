import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { describe, it, expect, vi } from 'vitest';

import { useHandTracking } from '../src/hooks/useHandTracking';

describe('useHandTracking', () => {
  it('stops media stream on cleanup', async () => {
    const stop = vi.fn();
    const stream = {
      getTracks: () => [{ stop }]
    } as unknown as MediaStream;

    let resolveStream: (s: MediaStream) => void = () => {};
    const getUserMedia = vi.fn(() => new Promise<MediaStream>(res => { resolveStream = res; }));
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const video = { play: vi.fn() } as any;

    function TestComponent() {
      const { videoRef } = useHandTracking();
      videoRef.current = video;
      return null;
    }

    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(React.createElement(TestComponent));
    });

    await act(async () => {
      resolveStream(stream);
    });

    await act(async () => {
      renderer.unmount();
    });

    expect(stop).toHaveBeenCalled();
  });
});

