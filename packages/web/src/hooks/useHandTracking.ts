import { useEffect, useRef, useState } from 'react';
import { GestureFSM, HandInput, Gesture } from '@airdraw/core';

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

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState<Gesture>('idle');
  const [error, setError] = useState<Error | null>(null);
  const fsmRef = useRef(new GestureFSM());

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    let stream: MediaStream | null = null;
    let hands: any;
    let active = true;

    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!active) return;
        video.srcObject = stream;
        await video.play();

        const m = await import('@mediapipe/hands');
        hands = new m.Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({ maxNumHands: 1, selfieMode: true });

        hands.onResults((res: any) => {
          if (!res.multiHandLandmarks || !res.multiHandLandmarks.length) {
            const g = fsmRef.current.update({ pinch: 0, fingers: 0 });
            setGesture(g);
            return;
          }
          const lm = res.multiHandLandmarks[0] as Landmark[];
          const input: HandInput = {
            pinch: calcPinch(lm),
            fingers: countFingers(lm)
          };
          const g = fsmRef.current.update(input);
          setGesture(g);
        });

        const loop = async () => {
          if (!active) return;
          if (video.readyState >= 2) {
            await hands.send({ image: video });
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch (err) {
        console.error('camera error', err);
        if (active) setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
    init();

    return () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (hands?.close) hands.close();
    };
  }, []);

  return { videoRef, gesture, error };
}

