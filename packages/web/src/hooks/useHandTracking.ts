import { useEffect, useRef, useState } from 'react';
import { GestureFSM, HandInput, Gesture } from '@airdraw/core';

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState<Gesture>('idle');
  const fsmRef = useRef(new GestureFSM());

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const off = fsmRef.current.on('change', setGesture);
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      video.srcObject = stream;
      video.play();
      const loop = () => {
        // Placeholder: real implementation would run model here
        const input: HandInput = { pinch: 0, fingers: 5 };
        fsmRef.current.update(input);
        requestAnimationFrame(loop);
      };
      loop();
    }).catch(err => console.warn('camera error', err));
    return () => off();
  }, []);

  return { videoRef, gesture };
}
