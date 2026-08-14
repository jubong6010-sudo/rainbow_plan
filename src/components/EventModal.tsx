import React, { useState, useEffect } from 'react';
import { 
  EventColor, 
  EVENT_COLOR_OPTIONS, 
  setCustomHoliday, 
  deleteCustomHoliday, 
  getCustomHolidays 
} from '../utils/holidays';
import { cn } from '../lib/utils';

export interface EventModalTarget {
  dateStr: string; // YYYY-MM-DD
  date: Date;
  initialName?: string;
  initialColor?: EventColor;
}

interface EventModalProps {
  target: EventModalTarget | null;
  onClose: () => void;
}

export default function EventModal({ target, onClose }: EventModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<EventColor>('red');

  useEffect(() => {
    if (target) {
      const customMap = getCustomHolidays();
      const existing = customMap[target.dateStr];
      if (existing) {
        setName(existing.name || '');
        setSelectedColor(existing.color || 'red');
      } else {
        setName(target.initialName || '');
        setSelectedColor(target.initialColor || 'red');
      }
    }
  }, [target]);

  if (!target) return null;

  const handleSave = () => {
    const trimmed = name.trim() || '일정';
    setCustomHoliday(target.dateStr, trimmed, selectedColor);
    onClose();
  };

  const handleDelete = () => {
    deleteCustomHoliday(target.dateStr);
    onClose();
  };

  const customMap = getCustomHolidays();
  const hasExisting = Boolean(customMap[target.dateStr]);

  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border-2 border-blue-400 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2.5 mb-3.5">
          <h3 className="font-black text-base sm:text-lg text-gray-900 flex items-center gap-1.5">
            <span>📅</span> 일정 추가 / 관리
          </h3>
          <span className="text-xs sm:text-sm font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
            {target.dateStr}
          </span>
        </div>

        {/* Input: Event Name */}
        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
            일정 / 기념일 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="예: 프로젝트 마감, 생일, 여름휴가, 회의"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Color Palette Selector (5 Colors: Red, Blue, Purple, Black, Yellow) */}
        <div className="mb-5">
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
            표시 색상 선택 (날짜 & 텍스트)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {EVENT_COLOR_OPTIONS.map((opt) => {
              const isSelected = selectedColor === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedColor(opt.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-1.5 rounded-lg border-2 transition-all cursor-pointer",
                    isSelected 
                      ? "border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-300 scale-105" 
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  )}
                >
                  <span 
                    className="w-5 h-5 rounded-full shadow-2xs mb-1 block"
                    style={{ backgroundColor: opt.preview }}
                  />
                  <span className={cn("text-[10px] font-bold", isSelected ? "text-blue-900 font-black" : "text-gray-600")}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
          {hasExisting && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 mr-auto cursor-pointer transition-colors"
            >
              삭제
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow cursor-pointer transition-all active:translate-y-0.5"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
