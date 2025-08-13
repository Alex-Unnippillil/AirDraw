/**
 * @vitest-environment jsdom
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { GestureFSM } from '@airdraw/core';

vi.mock('@mediapipe/hands', () => ({ Hands: vi.fn() }));
vi.mock('@airdraw/core', async () => {
  const actual = await vi.importActual<typeof import('@airdraw/core')>('@airdraw/core');
  return { GestureFSM: actual.GestureFSM };
});

import { Hands } from '@mediapipe/hands';
const HandsMock = Hands as unknown as any;

import { useHandTracking } from '../src/hooks/useHandTracking';

describe('useHandTracking', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('stops media stream when stop is called', async () => {
    const stopTrack = vi.fn();
    const stream = {
      getTracks: () => [{ stop: stopTrack }]
    } as unknown as MediaStream;

    let resolveStream: (s: MediaStream) => void = () => {};
    const getUserMedia = vi.fn(() => new Promise<MediaStream>(res => { resolveStream = res; }));
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const video = { play: vi.fn(), style: {} } as any;

    HandsMock.mockReturnValue({
      onResults: vi.fn(),
      setOptions: vi.fn(),
      send: vi.fn(),
      close: vi.fn()
    });

    let stopFn: () => void = () => {};
    function TestComponent() {
      const { videoRef, stop } = useHandTracking();
      videoRef.current = video;
      stopFn = stop;
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
      stopFn();
      renderer.unmount();
    });

    expect(stopTrack).toHaveBeenCalled();
  });

  it('updates gesture from mediapipe results', async () => {
    let resultsCb: any = null;
    HandsMock.mockReturnValue({
      onResults: (cb: any) => { resultsCb = cb; },
      setOptions: vi.fn(),
      send: vi.fn(),
      close: vi.fn()
    });

    const stop = vi.fn();
    const stream = {
      getTracks: () => [{ stop }]
    } as unknown as MediaStream;

    let resolveStream: (s: MediaStream) => void = () => {};
    const getUserMedia = vi.fn(() => new Promise<MediaStream>(res => { resolveStream = res; }));
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const video = { play: vi.fn(), style: {} } as any;

    let currentGesture: any;
    function TestComponent() {
      const { videoRef, gesture } = useHandTracking();
      videoRef.current = video;
      currentGesture = gesture;
      return null;
    }

    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(React.createElement(TestComponent));
    });

    await act(async () => { resolveStream(stream); });
    await act(async () => {});

    // open palm -> palette
    const makeLm = (overrides: Record<number, {x:number;y:number}>) => {
      const arr = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
      for (const i in overrides) arr[Number(i)] = overrides[i];
      return arr;
    };
    const openPalm = makeLm({0:{x:0,y:0},5:{x:1,y:0},3:{x:0.5,y:1},4:{x:0,y:1},6:{x:1,y:1},8:{x:1,y:0},10:{x:2,y:1},12:{x:2,y:0},14:{x:3,y:1},16:{x:3,y:0},18:{x:4,y:1},20:{x:4,y:0}});
    await act(async () => { resultsCb({ multiHandLandmarks: [openPalm] }); });
    expect(currentGesture).toBe('palette');

    // pinch -> draw
    const drawLm = makeLm({0:{x:0,y:0},5:{x:1,y:0},3:{x:0.5,y:1},4:{x:0.6,y:0},6:{x:0.6,y:1},8:{x:0.6,y:0},10:{x:1.5,y:1},12:{x:1.5,y:0},14:{x:2,y:0},16:{x:2,y:1},18:{x:3,y:0},20:{x:3,y:1}});
    await act(async () => { resultsCb({ multiHandLandmarks: [drawLm] }); });
    expect(currentGesture).toBe('draw');

    await act(async () => {
      renderer.unmount();
    });
  });

  it('falls back to mouse when camera fails', async () => {
    HandsMock.mockReturnValue({
      onResults: vi.fn(),
      setOptions: vi.fn(),
      send: vi.fn(),
      close: vi.fn()
    });

    const getUserMedia = vi.fn(() => Promise.reject(new Error('denied')));
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    vi.stubGlobal('requestAnimationFrame', vi.fn());
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const video = { style: {} } as any;

    let currentGesture: any = 'idle';
    let currentError: any = null;
    let stopFn: () => void = () => {};
    function TestComponent() {
      const { videoRef, gesture, error, stop } = useHandTracking();
      videoRef.current = video;
      currentGesture = gesture;
      currentError = error;
      stopFn = stop;
      return null;
    }

    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });

    // allow async catch to run
    await act(async () => {});

    expect(currentError).toBeInstanceOf(Error);

    await act(async () => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    expect(currentGesture).toBe('draw');

    await act(async () => {
      window.dispatchEvent(new Event('pointerup'));
    });
    expect(currentGesture).toBe('idle');

    await act(async () => {
      stopFn();
    });

    await act(async () => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    expect(currentGesture).toBe('idle');
  });

  it('falls back to mouse when mediapipe send fails', async () => {
    const send = vi.fn(() => Promise.reject(new Error('mp fail')));
    HandsMock.mockReturnValue({
      onResults: vi.fn(),
      setOptions: vi.fn(),
      send,
      close: vi.fn()
    });

    const stopTrack = vi.fn();
    const stream = {
      getTracks: () => [{ stop: stopTrack }]
    } as unknown as MediaStream;
    const getUserMedia = vi.fn(() => Promise.resolve(stream));
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });

    vi.stubGlobal('requestAnimationFrame', (cb: any) => {
      cb();
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const video = { play: vi.fn(() => Promise.resolve()), style: {} } as any;

    let currentGesture: any = 'idle';
    let currentError: any = null;
    let stopFn: () => void = () => {};
    function TestComponent() {
      const { videoRef, gesture, error, stop } = useHandTracking();
      videoRef.current = video;
      currentGesture = gesture;
      currentError = error;
      stopFn = stop;
      return null;
    }

    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });

    // allow async catch to run
    await act(async () => {});

    expect(currentError).toBeInstanceOf(Error);

    await act(async () => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    expect(currentGesture).toBe('draw');

    await act(async () => {
      window.dispatchEvent(new Event('pointerup'));
    });
    expect(currentGesture).toBe('idle');

    await act(async () => {
      stopFn();
    });

    await act(async () => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    expect(currentGesture).toBe('idle');
  });
});

