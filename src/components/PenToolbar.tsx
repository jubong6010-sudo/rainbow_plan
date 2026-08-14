import React from 'react';
import { PenState } from '../types';
import { cn } from '../lib/utils';

interface PenToolbarProps {
  penState: PenState;
  setPenState: React.Dispatch<React.SetStateAction<PenState>>;
}

export default function PenToolbar({ penState, setPenState }: PenToolbarProps) {
  
  const togglePen = () => {
    setPenState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  };

  const handleUndo = () => {
    window.dispatchEvent(new Event('drawing-undo'));
  };

  const handleClear = () => {
    window.dispatchEvent(new Event('drawing-clear'));
  };

  return (
    <div className="bg-white border-t border-gray-300 px-3 py-1.5 flex items-center justify-between flex-wrap gap-x-3 gap-y-1.5 z-30 shrink-0 select-none shadow-xs text-xs sm:text-sm">
      {/* 1. Title & On/Off Toggle */}
      <div className="flex items-center gap-2">
        <span className="font-black text-blue-700 text-sm sm:text-base underline decoration-2 underline-offset-3">
          펜 사용도구
        </span>
        <button
          onClick={togglePen}
          type="button"
          className={cn(
            "px-2.5 py-0.5 rounded shadow-2xs text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 active:translate-y-0.5",
            penState.isEnabled 
              ? "bg-blue-100 border-blue-400 text-blue-800 ring-1 ring-blue-400" 
              : "bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-300"
          )}
          title="펜 드로잉 활성화/비활성화 (OFF 시 달력 클릭 전용)"
        >
          <span>펜 도구 on/off</span>
          <span className={cn(
            "px-1.5 py-0.2 rounded text-[10px] font-black",
            penState.isEnabled ? "bg-blue-600 text-white" : "bg-gray-400 text-white"
          )}>
            {penState.isEnabled ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      {/* 2. Color Selection */}
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-gray-700 shrink-0">팬색 :</span>
        <div className="flex gap-1">
          {(['blue', 'black', 'red', 'white'] as const).map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setPenState(prev => ({ ...prev, color, isEraser: false, isEnabled: true }))}
              className={cn(
                "px-2.5 py-0.5 rounded shadow-2xs text-xs font-bold transition-all cursor-pointer border",
                color === 'blue' && "bg-gray-200 border-gray-300 text-blue-600 hover:bg-blue-50",
                color === 'black' && "bg-gray-200 border-gray-300 text-black hover:bg-gray-300",
                color === 'red' && "bg-gray-200 border-gray-300 text-red-600 hover:bg-red-50",
                color === 'white' && "bg-gray-400 border-gray-500 text-white hover:bg-gray-500",
                penState.color === color && !penState.isEraser && penState.isEnabled
                  ? "ring-2 ring-blue-600 border-blue-500 font-black shadow-xs bg-white"
                  : ""
              )}
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Width Selection */}
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-gray-700 shrink-0">두께 :</span>
        <div className="flex gap-1">
          {(['thin', 'normal', 'thick'] as const).map((width) => (
            <button
              key={width}
              type="button"
              onClick={() => setPenState(prev => ({ ...prev, width, isEraser: false, isEnabled: true }))}
              className={cn(
                "px-2.5 py-0.5 rounded shadow-2xs text-xs font-bold bg-gray-200 border border-gray-300 text-gray-800 transition-all cursor-pointer hover:bg-gray-300",
                penState.width === width && !penState.isEraser && penState.isEnabled
                  ? "ring-2 ring-blue-600 border-blue-500 font-black shadow-xs bg-white"
                  : ""
              )}
            >
              {width.charAt(0).toUpperCase() + width.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Action Buttons (Eraser, Undo, Clear) */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          onClick={() => setPenState(prev => ({ ...prev, isEraser: !prev.isEraser, isEnabled: true }))}
          className={cn(
            "px-2.5 py-0.5 rounded shadow-2xs text-xs font-bold bg-gray-200 border border-gray-300 text-gray-800 cursor-pointer hover:bg-gray-300 transition-all",
            penState.isEraser && penState.isEnabled 
              ? "ring-2 ring-blue-600 border-blue-500 bg-blue-100 text-blue-900 font-black" 
              : ""
          )}
        >
          Eraser
        </button>
        <button
          type="button"
          onClick={handleUndo}
          className="px-2.5 py-0.5 rounded shadow-2xs text-xs font-bold bg-gray-200 border border-gray-300 text-gray-800 cursor-pointer hover:bg-gray-300 active:bg-gray-400 transition-all"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-2.5 py-0.5 rounded shadow-2xs text-xs font-bold bg-gray-200 border border-gray-300 text-gray-800 cursor-pointer hover:bg-red-100 hover:text-red-700 active:bg-gray-400 transition-all"
          title="현재 화면의 모든 필기 삭제"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
