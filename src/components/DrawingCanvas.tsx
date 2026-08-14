import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PenState } from '../types';
import { cn } from '../lib/utils';

export interface NormalizedPoint {
  x: number; // 0.0 to 1.0 (relative to canvas width)
  y: number; // 0.0 to 1.0 (relative to canvas height)
}

export interface Stroke {
  points: NormalizedPoint[];
  color: string;
  width: number; // base thickness: 1 (thin), 2 (normal), 4 (thick)
  isEraser: boolean;
}

interface DrawingCanvasProps {
  storageKey: string;
  penState: PenState;
}

export default function DrawingCanvas({ storageKey, penState }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // In-memory list of strokes for the active canvas
  const strokesRef = useRef<Stroke[]>([]);
  // In-progress stroke being actively drawn
  const currentStrokeRef = useRef<Stroke | null>(null);
  // Undo history stack of stroke arrays
  const historyRef = useRef<Stroke[][]>([]);
  // Legacy image fallback if old raster data is found
  const legacyImageRef = useRef<HTMLImageElement | null>(null);

  // Helper to determine pixel stroke properties
  const getStrokeProperties = useCallback(() => {
    let color = '#000000'; // black
    if (penState.color === 'blue') color = '#0000FF';
    if (penState.color === 'red') color = '#FF0000';
    if (penState.color === 'white') color = '#FFFFFF';
    
    let width = 2; // normal
    if (penState.width === 'thin') width = 1;
    if (penState.width === 'thick') width = 4;

    return { color, width, isEraser: penState.isEraser };
  }, [penState.color, penState.width, penState.isEraser]);

  // Master Redraw function: renders all strokes proportionally to current canvas dimensions
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (w === 0 || h === 0) return;

    // Adjust canvas buffer size for Retina/High-DPI display crispness
    const targetWidth = Math.round(w * dpr);
    const targetHeight = Math.round(h * dpr);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.save();
    // Scale context so drawing coordinates match CSS logical pixels (w, h)
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // If legacy raster image exists, draw it scaled to container
    if (legacyImageRef.current) {
      ctx.drawImage(legacyImageRef.current, 0, 0, w, h);
    }

    // Adaptive scale factor for stroke widths based on screen size (keeps strokes readable)
    const scale = Math.max(0.7, Math.min(w, h) / 750);

    const drawSingleStroke = (stroke: Stroke) => {
      const pts = stroke.points;
      if (!pts || pts.length === 0) return;

      ctx.save();
      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = Math.max(8, stroke.width * scale * 7);
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = Math.max(1, stroke.width * scale);
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (pts.length === 1) {
        // Single point tap/dot
        const px = pts[0].x * w;
        const py = pts[0].y * h;
        ctx.beginPath();
        ctx.arc(px, py, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.isEraser ? '#000000' : stroke.color;
        ctx.fill();
      } else {
        // Multiple points curve
        ctx.beginPath();
        ctx.moveTo(pts[0].x * w, pts[0].y * h);

        for (let i = 1; i < pts.length; i++) {
          // Mid-point smoothing for silky smooth handwriting
          const pPrev = pts[i - 1];
          const pCurr = pts[i];
          const midX = ((pPrev.x + pCurr.x) / 2) * w;
          const midY = ((pPrev.y + pCurr.y) / 2) * h;
          ctx.quadraticCurveTo(pPrev.x * w, pPrev.y * h, midX, midY);
        }

        // Draw line to final point
        const lastPt = pts[pts.length - 1];
        ctx.lineTo(lastPt.x * w, lastPt.y * h);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw all confirmed strokes
    for (const stroke of strokesRef.current) {
      drawSingleStroke(stroke);
    }

    // Draw active stroke in progress
    if (currentStrokeRef.current) {
      drawSingleStroke(currentStrokeRef.current);
    }

    ctx.restore();
  }, []);

  // Save current strokes to LocalStorage
  const saveStrokesToStorage = useCallback(() => {
    try {
      const data = JSON.stringify(strokesRef.current);
      localStorage.setItem(`drawing-vector-${storageKey}`, data);
      // Remove obsolete raster key if vector exists to avoid conflicts
      localStorage.removeItem(`drawing-${storageKey}`);
    } catch (e) {
      console.warn('Failed to save drawing strokes:', e);
    }
  }, [storageKey]);

  // Load strokes from LocalStorage whenever storageKey changes
  useEffect(() => {
    legacyImageRef.current = null;
    strokesRef.current = [];
    historyRef.current = [];

    const vectorKey = `drawing-vector-${storageKey}`;
    const legacyKey = `drawing-${storageKey}`;

    const vectorData = localStorage.getItem(vectorKey);
    const legacyData = localStorage.getItem(legacyKey);

    if (vectorData) {
      try {
        const parsed = JSON.parse(vectorData) as Stroke[];
        if (Array.isArray(parsed)) {
          strokesRef.current = parsed;
          historyRef.current = [parsed];
        }
      } catch {
        strokesRef.current = [];
      }
      redrawCanvas();
    } else if (legacyData && legacyData.startsWith('data:image')) {
      // Backward compatibility for legacy raster data
      const img = new Image();
      img.src = legacyData;
      img.onload = () => {
        legacyImageRef.current = img;
        redrawCanvas();
      };
    } else {
      redrawCanvas();
    }
  }, [storageKey, redrawCanvas]);

  // Setup ResizeObserver on the container to proportionally rescale on any window/container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        redrawCanvas();
      });
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Initial render
    handleResize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [redrawCanvas]);

  // Global Undo & Clear event listeners (connected to PenToolbar)
  useEffect(() => {
    const handleUndo = () => {
      if (strokesRef.current.length === 0) {
        if (legacyImageRef.current) {
          legacyImageRef.current = null;
          localStorage.removeItem(`drawing-${storageKey}`);
          redrawCanvas();
        }
        return;
      }

      // Pop the last stroke
      strokesRef.current.pop();
      historyRef.current.push([...strokesRef.current]);
      saveStrokesToStorage();
      redrawCanvas();
    };

    const handleClear = () => {
      strokesRef.current = [];
      historyRef.current = [];
      legacyImageRef.current = null;
      localStorage.removeItem(`drawing-vector-${storageKey}`);
      localStorage.removeItem(`drawing-${storageKey}`);
      redrawCanvas();
    };

    window.addEventListener('drawing-undo', handleUndo);
    window.addEventListener('drawing-clear', handleClear);

    const handleSaveAll = () => {
      saveStrokesToStorage();
    };
    window.addEventListener('app:save-all', handleSaveAll);

    return () => {
      window.removeEventListener('drawing-undo', handleUndo);
      window.removeEventListener('drawing-clear', handleClear);
      window.removeEventListener('app:save-all', handleSaveAll);
    };
  }, [storageKey, redrawCanvas, saveStrokesToStorage]);

  // Pointer event handlers for drawing
  const getNormalizedCoords = (e: React.PointerEvent<HTMLCanvasElement>): NormalizedPoint | null => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const nx = Math.max(0, Math.min(1, rawX / rect.width));
    const ny = Math.max(0, Math.min(1, rawY / rect.height));

    return { x: nx, y: ny };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!penState.isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getNormalizedCoords(e);
    if (!coords) return;

    const { color, width, isEraser } = getStrokeProperties();

    currentStrokeRef.current = {
      points: [coords],
      color,
      width,
      isEraser,
    };

    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);
    redrawCanvas();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;

    const coords = getNormalizedCoords(e);
    if (!coords) return;

    const pts = currentStrokeRef.current.points;
    const lastPt = pts[pts.length - 1];

    // Minimal distance check to prevent redundant clustered points
    const dx = coords.x - lastPt.x;
    const dy = coords.y - lastPt.y;
    if (Math.hypot(dx, dy) > 0.0008 || pts.length === 1) {
      pts.push(coords);
      redrawCanvas();
    }
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing && currentStrokeRef.current) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }

      // Add completed stroke to strokes collection
      if (currentStrokeRef.current.points.length > 0) {
        strokesRef.current.push(currentStrokeRef.current);
        historyRef.current.push([...strokesRef.current]);
        saveStrokesToStorage();
      }

      currentStrokeRef.current = null;
      redrawCanvas();
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "absolute inset-0 z-10 touch-none overflow-hidden select-none",
        penState.isEnabled ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={penState.isEnabled ? startDrawing : undefined}
        onPointerMove={penState.isEnabled ? draw : undefined}
        onPointerUp={penState.isEnabled ? stopDrawing : undefined}
        onPointerCancel={penState.isEnabled ? stopDrawing : undefined}
        className={cn(
          "w-full h-full block",
          penState.isEnabled 
            ? (penState.isEraser ? "cursor-cell" : "cursor-crosshair") 
            : "cursor-default"
        )}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
