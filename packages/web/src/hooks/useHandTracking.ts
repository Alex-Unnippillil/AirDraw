import { useEffect, useRef, useState } from 'react';
import { GestureFSM, HandInput, Gesture } from '@airdraw/core';
import { usePrivacy, isPrivacyEnabled } from '../context/PrivacyContext';
import type { Hands } from '@mediapipe/hands';

type Landmark = { x: number; y: number };

const dist = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);

function calcPinch(lm: Landmark[]): number {
  const thumb = lm[4];
  const index = lm[8];
  const scale = dist(lm[0], lm[5]) || 1;
  return Math.max(0, Math.min(1, 1 - dist(thumb, index) / scale));
}

function countFingers(lm: Landmark[]): number {
  const up = (tip: number, pip: number) => (lm[tip].y < lm[pip].y ? 1 : 0);
  let fingers = up(8, 6) + up(12, 10) + up(16, 14) + up(20, 18);
  if (lm[4].x < lm[3].x) fingers++;
  return fingers;
}

export interface HandTrackingConfig {
  baseUrl?: string;
}

export function useHandTracking(config?: HandTrackingConfig) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState<Gesture>('idle');
  const [error, setError] = useState<Error | null>(null);
  const { enabled } = usePrivacy();

  const fsmRef = useRef(new GestureFSM());
  const stopRef = useRef<() => void>(() => {});
  const swipeStartRef = useRef<Landmark | null>(null);

  useEffect(() => {
    if (enabled || isPrivacyEnabled()) return;
    const video = videoRef.current;
    if (!video) return;

    // keep video hidden - only used as input to mediapipe
    video.style.display = 'none';

    let raf = 0;
    let active = true;
      let hands: Hands | null = null;
    let stream: MediaStream | null = null;
    let cleanupMouse = () => {};

    const setupMouse = () => {
      const down = () => setGesture('draw');
      const up = () => setGesture('idle');
      window.addEventListener('pointerdown', down);
      window.addEventListener('pointerup', up);
      return () => {
        window.removeEventListener('pointerdown', down);
        window.removeEventListener('pointerup', up);
      };
    };

    const stop = () => {
      active = false;
      cancelAnimationFrame(raf);
        hands && hands.close && hands.close();
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
      }
      if (video.srcObject) {
        video.srcObject = null;
      }
      cleanupMouse();
    };
    stopRef.current = stop;

    const loop = async () => {
      try {
        await hands.send({ image: video });
      } catch (err) {
        if (active) {
          setError(err as Error);
          stop();
          cleanupMouse = setupMouse();
        }
        return;
      }
      if (active) raf = requestAnimationFrame(loop);
    };

    const start = async () => {
      try {
        const { Hands } = await import('@mediapipe/hands');
        hands = new Hands({
          locateFile: (file: string) => `${config?.baseUrl ?? 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/'}${file}`
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults(results => {
          if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            setGesture(fsmRef.current.update({ pinch: 0, fingers: 0 }));
            return;
          }
          const lm = results.multiHandLandmarks[0] as unknown as Landmark[];
          const pinch = calcPinch(lm);
          const fingers = countFingers(lm);
          let swipe: 'left' | 'right' | null = null;
          if (fingers === 2 && pinch < 0.5) {
            const index = lm[8];
            if (!swipeStartRef.current) {
              swipeStartRef.current = index;
            } else {
              const dx = index.x - swipeStartRef.current.x;
              if (Math.abs(dx) > 0.3) {
                swipe = dx > 0 ? 'right' : 'left';
                swipeStartRef.current = null;
              }
            }
          } else {
            swipeStartRef.current = null;
          }

          const input: HandInput = { pinch, fingers, swipe };
          const g = fsmRef.current.update(input);
          setGesture(g);
        });

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        video.srcObject = stream;
        await (video.play ? video.play() : Promise.resolve());
        raf = requestAnimationFrame(loop);
      } catch (err) {
        if (active) {
          setError(err as Error);
          cleanupMouse = setupMouse();
        }
      }
    };

    start();

    return stop;
  }, [config?.baseUrl, enabled]);

  return { videoRef, gesture, error, stop: stopRef.current };
}

