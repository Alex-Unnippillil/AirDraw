/**
 * @vitest-environment jsdom
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';


vi.mock('@mediapipe/hands', () => ({ Hands: vi.fn() }));
vi.mock('@airdraw/core', async () => {
  const actual = await vi.importActual<typeof import('@airdraw/core')>('@airdraw/core');
  return { GestureFSM: actual.GestureFSM };
});

import { Hands } from '@mediapipe/hands';
const HandsMock = Hands as unknown as any;

import { useHandTracking } from '../src/hooks/useHandTracking';
import { PrivacyProvider } from '../src/context/PrivacyContext';

describe('useHandTracking', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    cleanup();
  });

  it('does not start tracking when privacy mode is enabled', () => {
    const getUserMedia = vi.fn();
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });

    function TestComponent() {
      useHandTracking();
      return null;
    }

    render(
      React.createElement(
        PrivacyProvider,
        { initialEnabled: true },
        React.createElement(TestComponent)
      )
    );

    expect(getUserMedia).not.toHaveBeenCalled();
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

  it('detects swipes and dispatches commands', async () => {
    let resultsCb: any = null;
    HandsMock.mockReturnValue({
      onResults: (cb: any) => {
        resultsCb = cb;
      },
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

    const bus = { dispatch: vi.fn() };

    function TestComponent() {
      const { videoRef, gesture } = useHandTracking();
      videoRef.current = video;
      React.useEffect(() => {
        if (gesture === 'swipeLeft') bus.dispatch({ id: 'undo', args: {} });
        if (gesture === 'swipeRight') bus.dispatch({ id: 'redo', args: {} });
      }, [gesture]);
      return null;
    }

    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(React.createElement(TestComponent));
    });

    await act(async () => { resolveStream(stream); });
    await act(async () => {});

    const baseLm = Array.from({ length: 21 }, () => ({ x: 0, y: 1 }));
    baseLm[0] = { x: 0, y: 0 }; // wrist for scale
    baseLm[5] = { x: 1, y: 0 }; // index mcp for scale
    baseLm[3] = { x: 0, y: 1 }; // thumb base
    baseLm[4] = { x: 1, y: 1 }; // thumb tip (not counted)

    const makeLm = (x: number) => {
      const lm = baseLm.map(p => ({ ...p }));
      lm[6] = { x, y: 1 }; // index pip
      lm[8] = { x, y: 0 }; // index tip up
      lm[10] = { x, y: 1 }; // middle pip
      lm[12] = { x, y: 0 }; // middle tip up
      lm[14] = { x, y: 2 }; // ring pip (down)
      lm[16] = { x, y: 3 }; // ring tip down
      lm[18] = { x, y: 2 }; // pinky pip (down)
      lm[20] = { x, y: 3 }; // pinky tip down
      return lm;
    };

    await act(async () => { resultsCb({ multiHandLandmarks: [makeLm(0.8)] }); });
    await act(async () => { resultsCb({ multiHandLandmarks: [makeLm(0.2)] }); });
    expect(bus.dispatch).toHaveBeenCalledWith({ id: 'undo', args: {} });

    bus.dispatch.mockClear();

    await act(async () => { resultsCb({ multiHandLandmarks: [makeLm(0.2)] }); });
    await act(async () => { resultsCb({ multiHandLandmarks: [makeLm(0.8)] }); });
    expect(bus.dispatch).toHaveBeenCalledWith({ id: 'redo', args: {} });

    await act(async () => { renderer.unmount(); });
  });

  it('persists strokes and color', async () => {
    vi.resetModules();
    vi.doUnmock('@airdraw/core');
    const saveState = vi.fn();
    const loadState = vi.fn().mockResolvedValue({ strokes: [], color: '#123456' });
    vi.doMock('../src/hooks/useHandTracking', () => ({
      useHandTracking: () => ({ videoRef: { current: null }, gesture: 'draw', error: null })
    }));
    vi.doMock('../src/storage/indexedDb', () => ({ saveState, loadState }));
    const { App } = await import('../src/main');
    const { CommandBusProvider } = await import('../src/context/CommandBusContext');
    const core = await vi.importActual<typeof import('@airdraw/core')>('@airdraw/core');
    const bus = new core.CommandBus<any>();
    render(
      React.createElement(
        CommandBusProvider,
        { bus },
        React.createElement(App)
      )
    );
    await waitFor(() => {
      expect(loadState).toHaveBeenCalled();
    });
    const canvas = screen.getByTestId('drawing-canvas');
    fireEvent.pointerDown(canvas, { clientX: 1, clientY: 1 });
    fireEvent.pointerMove(canvas, { clientX: 2, clientY: 2 });
    fireEvent.pointerUp(canvas, { clientX: 2, clientY: 2 });
    await waitFor(() => {
      expect(saveState).toHaveBeenCalledTimes(1);
    });
    await bus.dispatch({ id: 'setColor', args: { hex: '#ff0000' } });
    await waitFor(() => {
      expect(saveState).toHaveBeenCalledTimes(2);
    });
  });
});

