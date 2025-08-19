import { useEffect, useRef, useState } from 'react';
import { GestureFSM, Gesture, Landmark } from '@airdraw/core';
import { usePrivacy } from '../context/PrivacyContext';
import type { Hands } from '@mediapipe/hands';


export interface HandTrackingConfig {
  baseUrl?: string;
}

export function useHandTracking(config?: HandTrackingConfig) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState<Gesture>('idle');
  const [keypoints, setKeypoints] = useState<Landmark[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { enabled } = usePrivacy();

  const fsmRef = useRef(new GestureFSM());
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (enabled) return;
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
            setKeypoints(null);
            setGesture(fsmRef.current.update(null));
            return;
          }
          const lm = results.multiHandLandmarks[0] as unknown as Landmark[];
          setKeypoints(lm);
          const g = fsmRef.current.update(lm);
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

  return { videoRef, keypoints, gesture, error, stop: stopRef.current };
}

