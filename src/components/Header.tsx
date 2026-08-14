import React from 'react';
import { ViewState } from '../types';

interface HeaderProps {
  title: string;
  setView: (view: ViewState) => void;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  showNavButtons?: boolean;
}

export default function Header({ 
  title, 
  setView, 
  onPrev, 
  onNext, 
  prevLabel, 
  nextLabel,
  showNavButtons = true
}: HeaderProps) {
  const handleCls = () => {
    window.dispatchEvent(new CustomEvent('app:save-all'));
    localStorage.setItem('app-view', 'cover');
    setView('cover');
  };

  return (
    <div className="flex flex-col gap-2 p-2 bg-white z-20 shrink-0 select-none border-b-2 border-green-800">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setView('nav')}
            className="px-3 py-1 bg-gray-200 shadow rounded font-bold text-blue-700 text-sm active:bg-gray-300"
            title="Planner Navigation으로 이동"
          >
            HOME
          </button>
          <button 
            onClick={handleCls}
            className="px-3 py-1 bg-gray-200 shadow rounded font-bold text-blue-700 text-sm active:bg-gray-300"
            title="저장 및 로그아웃 (Cover Page로 이동)"
          >
            CLS
          </button>
        </div>

        <div className="flex-1 flex justify-center">
           {/* Barcode stylized header */}
           <div className="border-t-2 border-b-2 border-black flex flex-col items-center justify-center px-4 py-1 relative">
             <div className="absolute inset-0 flex items-center justify-between opacity-20 pointer-events-none">
                {/* Fake barcode lines */}
                {Array.from({length: 40}).map((_, i) => (
                  <div key={i} className="h-full bg-black" style={{ width: Math.random() * 3 + 1 + 'px', marginRight: '1px' }}></div>
                ))}
             </div>
             <h1 className="text-xl md:text-2xl font-black tracking-wider text-black bg-white px-2 z-10 font-serif">
               {title}
             </h1>
           </div>
        </div>

        <div className="flex flex-col gap-1">
          {showNavButtons && (
            <>
              <button onClick={() => setView('month')} className="px-3 py-1 bg-gray-200 shadow rounded font-bold text-blue-700 text-sm active:bg-gray-300">Month</button>
              <button onClick={() => setView('week')} className="px-3 py-1 bg-gray-200 shadow rounded font-bold text-blue-700 text-sm active:bg-gray-300">Week</button>
            </>
          )}
          <button onClick={() => setView('nav')} className="px-3 py-1 bg-gray-200 shadow rounded font-bold text-blue-700 text-sm active:bg-gray-300">Back</button>
        </div>
      </div>

      {/* Date Controllers */}
      {(onPrev || onNext) && (
        <div className="flex items-center gap-4 mt-2">
           <div className="text-xl font-bold text-blue-700 flex-1">
             § {title.replace('Page', '').trim()} §
           </div>
           <div className="flex gap-2">
              <button onClick={onPrev} className="px-3 py-1 bg-gray-200 shadow rounded font-bold text-blue-700 text-sm active:bg-gray-300">
                - {prevLabel || 'Prev'}
              </button>
              <button onClick={onNext} className="px-3 py-1 bg-gray-200 shadow rounded font-bold text-blue-700 text-sm active:bg-gray-300">
                + {nextLabel || 'Next'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
