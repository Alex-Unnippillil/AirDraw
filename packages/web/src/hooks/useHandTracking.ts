import { useEffect, useRef, useState } from 'react';
import { GestureFSM, HandInput, Gesture } from '@airdraw/core';

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState<Gesture>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const fsmRef = useRef(new GestureFSM());
  const frameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        setHasPermission(true);
        streamRef.current = stream;
        video.srcObject = stream;
        video.play();
        const loop = () => {
          // Placeholder: real implementation would run model here
          const input: HandInput = { pinch: 0, fingers: 5 };
          const g = fsmRef.current.update(input);
          setGesture(g);
          frameRef.current = requestAnimationFrame(loop);
        };
        frameRef.current = requestAnimationFrame(loop);
      })
      .catch(err => {
        console.warn('camera error', err);
        setError(err);
        setHasPermission(false);
      });

    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return { videoRef, gesture, error, hasPermission };
}
