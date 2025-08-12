import { useEffect, useRef, useState } from 'react';
import { GestureFSM, HandInput, Gesture } from '@airdraw/core';
import { Hands } from '@mediapipe/hands';

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

    // keep video hidden - only used as input to mediapipe
    video.style.display = 'none';

    let raf = 0;
    let active = true;

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
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
      const input: HandInput = {
        pinch: calcPinch(lm),
        fingers: countFingers(lm)
      };
      const g = fsmRef.current.update(input);
      setGesture(g);
    });

    const loop = async () => {
      try {
        await hands.send({ image: video });
      } catch (err) {
        if (active) setError(err as Error);
      }
      if (active) raf = requestAnimationFrame(loop);
    };

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        video.srcObject = stream;
        return (video.play ? video.play() : Promise.resolve()).then(() => loop());
      })
      .catch(err => {
        if (active) setError(err);
      });

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      hands.close && hands.close();
      const stream = video.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        video.srcObject = null;
      }
    };
  }, []);

  return { videoRef, gesture, error };
}

