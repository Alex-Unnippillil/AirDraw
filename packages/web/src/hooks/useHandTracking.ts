import { useEffect, useRef, useState } from 'react';
import { GestureFSM, Gesture, HandInput } from '@airdraw/core';

export interface HandTrackingConfig {
  handedness?: 'left' | 'right' | 'both';
  modelPath?: string;
}

interface Landmark { x: number; y: number; z?: number }
interface HandsResults { multiHandLandmarks?: Landmark[][] }

export function useHandTracking(config: HandTrackingConfig = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState<Gesture>('idle');
  const fsmRef = useRef(new GestureFSM());

  useEffect(() => {
    let rafId: number;
    let stream: MediaStream | null = null;
    let hands: any;
    const video = videoRef.current;
    if (!video) return;

    const computePinch = (lm: Landmark[]) => {
      const thumb = lm[4];
      const index = lm[8];
      const dx = thumb.x - index.x;
      const dy = thumb.y - index.y;
      const dist = Math.hypot(dx, dy);
      return Math.max(0, 1 - dist * 4);
    };

    const countFingers = (lm: Landmark[]) => {
      const tips = [8, 12, 16, 20];
      const pips = [6, 10, 14, 18];
      let count = 0;
      for (let i = 0; i < tips.length; i++) {
        if (lm[tips[i]].y < lm[pips[i]].y) count++;
      }
      if (lm[4].x < lm[3].x) count++;
      return count;
    };

    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await video.play();

        const mod = await import('@mediapipe/hands');
        const Hands = (mod as any).Hands;
        hands = new Hands({
          locateFile: (f: string) =>
            config.modelPath ? `${config.modelPath}/${f}` : `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });
        hands.setOptions({
          maxNumHands: config.handedness === 'both' ? 2 : 1,
          modelComplexity: 1,
        });
        hands.onResults((results: HandsResults) => {
          const lm = results.multiHandLandmarks?.[0];
          if (!lm) return;
          const input: HandInput = {
            pinch: computePinch(lm),
            fingers: countFingers(lm),
          };
          const g = fsmRef.current.update(input);
          setGesture(g);
        });

        const loop = async () => {
          await hands.send({ image: video });
          rafId = requestAnimationFrame(loop);
        };
        loop();
      } catch (err) {
        console.warn('camera error', err);
      }
    };

    init();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (hands && hands.close) hands.close();
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [config.handedness, config.modelPath]);

  return { videoRef, gesture };
}
