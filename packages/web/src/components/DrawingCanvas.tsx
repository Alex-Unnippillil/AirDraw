import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useCommandBus } from '../context/CommandBusContext';
import type { Stroke } from '../types';
import { saveProjectState } from '../storage/indexedDb';

export interface DrawingCanvasProps {
  projectId: string;
  initialStrokes?: Stroke[];
  palette: string;
}

export interface DrawingCanvasHandle {
  completeStroke(stroke: Stroke): void;
  undo(): void;
  redo(): void;
  readonly strokes: Stroke[];
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  ({ projectId, initialStrokes = [], palette }, ref) => {
    const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes);
    const [redoStack, setRedoStack] = useState<Stroke[]>([]);
    const strokesRef = useRef<Stroke[]>(strokes);
    const redoRef = useRef<Stroke[]>(redoStack);
    const bus = useCommandBus();

    useEffect(() => {
      setStrokes(initialStrokes);
      strokesRef.current = initialStrokes;
    }, [initialStrokes]);

    useEffect(() => {
      strokesRef.current = strokes;
    }, [strokes]);

    useEffect(() => {
      redoRef.current = redoStack;
    }, [redoStack]);

    const persist = (newStrokes: Stroke[]) => {
      saveProjectState(projectId, { strokes: newStrokes, palette });
    };

    const completeStroke = (stroke: Stroke) => {
      const newStrokes = [...strokesRef.current, stroke];
      setStrokes(newStrokes);
      setRedoStack([]);
      strokesRef.current = newStrokes;
      redoRef.current = [];
      persist(newStrokes);
    };

    const undo = () => {
      if (strokesRef.current.length === 0) return;
      const newRedo = [strokesRef.current[strokesRef.current.length - 1], ...redoRef.current];
      const newStrokes = strokesRef.current.slice(0, -1);
      setStrokes(newStrokes);
      setRedoStack(newRedo);
      strokesRef.current = newStrokes;
      redoRef.current = newRedo;
      persist(newStrokes);
    };

    const redo = () => {
      if (redoRef.current.length === 0) return;
      const [next, ...rest] = redoRef.current;
      const newStrokes = [...strokesRef.current, next];
      setStrokes(newStrokes);
      setRedoStack(rest);
      strokesRef.current = newStrokes;
      redoRef.current = rest;
      persist(newStrokes);
    };

    useEffect(() => {
      bus.register('addStroke', ({ stroke }) => completeStroke(stroke));
      bus.register('undo', () => undo());
      bus.register('redo', () => redo());
    }, [bus, palette]);

    useImperativeHandle(
      ref,
      () => ({
        completeStroke,
        undo,
        redo,
        get strokes() {
          return strokesRef.current;
        },
      }),
      [palette]
    );

    return (
      <div>
        <canvas data-testid="canvas" />
        <div data-testid="stroke-count">{strokes.length}</div>
      </div>
    );
  }
);

export default DrawingCanvas;
