import { useEffect, useRef, useState } from 'react';
import { GestureFSM, HandInput, Gesture } from '@airdraw/core';

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState<Gesture>('idle');
  const fsmRef = useRef(new GestureFSM());
  const rafRef = useRef<number>();
  const streamRef = useRef<MediaStream>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      console.warn('mediaDevices.getUserMedia not supported');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        streamRef.current = stream;
        video.srcObject = stream;
        video.play();
        const loop = () => {
          // Placeholder: real implementation would run model here
          const input: HandInput = { pinch: 0, fingers: 5 };
          const g = fsmRef.current.update(input);
          setGesture(g);
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      })
      .catch(err => console.warn('camera error', err));

    return () => {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return { videoRef, gesture };
}
