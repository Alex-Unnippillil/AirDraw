import React, { useEffect, useRef } from 'react';
import { BrushEngine, type Vec2 } from '@airdraw/core';
import { saveStrokes } from '../storage/indexedDb';

export interface Stroke {
  points: Vec2[];
  color: string;
}

export interface DrawingCanvasProps {
  gesture: string;
  color: string;
  strokes: Stroke[];
  projectId: string;
  onStrokeComplete: (stroke: Stroke) => void;
}

export function DrawingCanvas({ gesture, color, strokes, projectId, onStrokeComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef(new BrushEngine());
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes) {
      const pts = stroke.points;
      if (pts.length === 0) continue;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    }
  }, [strokes]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gesture !== 'draw') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = typeof e.clientX === 'number' ? e.clientX - rect.left : 0;
    const y = typeof e.clientY === 'number' ? e.clientY - rect.top : 0;
    const p = { x, y };
    engineRef.current.start({ type: 'basic', size: 4, opacity: 1, hardness: 1 });
    engineRef.current.addPoint(p, e.timeStamp);
    drawingRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || gesture !== 'draw') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = typeof e.clientX === 'number' ? e.clientX - rect.left : 0;
    const y = typeof e.clientY === 'number' ? e.clientY - rect.top : 0;
    const p = { x, y };
    engineRef.current.addPoint(p, e.timeStamp);
  };

  const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const stroke = engineRef.current.end();
    drawingRef.current = false;
    const s = { color, points: stroke.points };
    onStrokeComplete(s);
    saveStrokes(projectId, [...strokes, s]);
  };

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      data-testid="drawing-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endStroke}
      onPointerLeave={endStroke}
    />
  );
}

export default DrawingCanvas;
