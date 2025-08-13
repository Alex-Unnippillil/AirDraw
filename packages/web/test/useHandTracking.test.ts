/**
 * @vitest-environment jsdom
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { GestureFSM } from '@airdraw/core';
import type { AppCommands } from '../src/commands';

vi.mock('@mediapipe/hands', () => ({ Hands: vi.fn() }));
vi.mock('@airdraw/core', async () => {
  const actual = await vi.importActual<typeof import('@airdraw/core')>('@airdraw/core');
  return { GestureFSM: actual.GestureFSM, CommandBus: actual.CommandBus };
});

import { Hands } from '@mediapipe/hands';
const HandsMock = Hands as unknown as any;

import { useHandTracking } from '../src/hooks/useHandTracking';

describe('useHandTracking', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

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

    const video = { play: vi.fn(), style: {} } as any;

    HandsMock.mockReturnValue({
      onResults: vi.fn(),
      setOptions: vi.fn(),
      send: vi.fn(),
      close: vi.fn()
    });

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

    await act(async () => { renderer.unmount(); });
  });

  it('detects swipe gestures', async () => {
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

    const makeLm = (indexX: number, middleX: number) => {
      const arr = Array.from({ length: 21 }, () => ({ x: 0, y: 2 }));
      // thumb not counted
      arr[3] = { x: 0.5, y: 1 };
      arr[4] = { x: 0.7, y: 1 };
      // index
      arr[6] = { x: indexX, y: 1 };
      arr[8] = { x: indexX, y: 0 };
      // middle
      arr[10] = { x: middleX, y: 1 };
      arr[12] = { x: middleX, y: 0 };
      // ring down
      arr[14] = { x: 2, y: 2 };
      arr[16] = { x: 2, y: 3 };
      // pinky down
      arr[18] = { x: 3, y: 2 };
      arr[20] = { x: 3, y: 3 };
      // points for calcPinch scale
      arr[0] = { x: 0, y: 0 };
      arr[5] = { x: 1, y: 0 };
      return arr;
    };

    // initial position
    await act(async () => {
      resultsCb({ multiHandLandmarks: [makeLm(0.2, 0.4)] });
    });

    // swipe right
    await act(async () => {
      resultsCb({ multiHandLandmarks: [makeLm(0.8, 1.0)] });
    });
    expect(currentGesture).toBe('swipeRight');

    await act(async () => { renderer.unmount(); });
  });
});

describe('gesture commands', () => {
  it('dispatches undo/redo on swipe gestures', async () => {
    vi.resetModules();
    let mockGesture: any = 'swipeLeft';
    vi.doMock('../src/hooks/useHandTracking', () => ({
      useHandTracking: () => ({ videoRef: { current: null }, gesture: mockGesture, error: null })
    }));
    const { App } = await import('../src/main');
    const { CommandBusProvider } = await import('../src/context/CommandBusContext');
    const { CommandBus } = await import('@airdraw/core');
    const bus = new CommandBus<AppCommands>();
    const dispatchSpy = vi.spyOn(bus, 'dispatch');

    const initial = React.createElement(
      CommandBusProvider,
      { bus },
      React.createElement(App)
    );
    const { rerender } = render(initial);

    expect(dispatchSpy).toHaveBeenCalledWith({ id: 'undo', args: {} });

    mockGesture = 'swipeRight';
    rerender(
      React.createElement(
        CommandBusProvider,
        { bus },
        React.createElement(App)
      )
    );

    expect(dispatchSpy).toHaveBeenCalledWith({ id: 'redo', args: {} });
  });
});

