import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';
import defaultNavBg from '../assets/images/nav_pastel_blue_sketch_1786701219041.jpg';
import { Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface NavigationPageProps {
  setView: (view: ViewState) => void;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

export default function NavigationPage({ setView, setCurrentDate }: NavigationPageProps) {
  // Navigation background image stored in localStorage with default fallback
  const [bgImage, setBgImage] = useState<string>(() => {
    const saved = localStorage.getItem('planner-nav-bg-image');
    if (saved && !saved.includes('nav_rose_frame') && !saved.includes('nav_blue_pencil_frame')) {
      return saved;
    }
    return defaultNavBg;
  });

  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUploadMenu(false);
      }
    };
    if (showUploadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUploadMenu]);

  const handleYearClick = () => {
    setCurrentDate(new Date());
    setView('year');
  };

  const handleMonthClick = () => {
    setCurrentDate(new Date());
    setView('month');
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
    setView('day-plan');
  };

  const handleLastVisitedClick = () => {
    const savedView = localStorage.getItem('planner-last-visited-view') as ViewState | null;
    const savedDate = localStorage.getItem('planner-last-visited-date');

    if (savedDate) {
      const parsed = new Date(savedDate);
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(parsed);
      }
    }

    if (savedView && savedView !== 'cover' && savedView !== 'nav') {
      setView(savedView);
    } else {
      setCurrentDate(new Date());
      setView('month');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setBgImage(result);
          try {
            localStorage.setItem('planner-nav-bg-image', result);
          } catch (err) {
            console.warn('Image size exceeds localStorage quota, using in memory for session', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBg = () => {
    setBgImage(defaultNavBg);
    localStorage.removeItem('planner-nav-bg-image');
  };

  const handleCls = () => {
    window.dispatchEvent(new CustomEvent('app:save-all'));
    localStorage.setItem('app-view', 'cover');
    setView('cover');
  };

  const NavButton = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button 
      type="button"
      onClick={onClick}
      className="w-full max-w-[170px] sm:max-w-[190px] py-3.5 sm:py-4 bg-gradient-to-b from-white via-sky-50/70 to-slate-100 border-2 border-blue-400/90 rounded-xl shadow-md font-bold text-blue-950 text-base sm:text-lg active:translate-y-px hover:shadow-lg hover:border-blue-600 transition-all cursor-pointer select-none"
    >
      {label}
    </button>
  );

  return (
    <div className="h-full w-full bg-[#f0f6fc] flex items-center justify-center relative p-2 sm:p-3 select-none overflow-hidden">
      {/* Outer frame matching planner design */}
      <div className="h-full w-full border-4 border-green-800 rounded-3xl bg-white shadow-md relative overflow-hidden flex flex-col justify-between p-3 sm:p-5">
        
        {/* Background Image Layer (Stretches width and height directly to match screen frame dimensions) */}
        {bgImage && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img 
              src={bgImage} 
              alt="Navigation Background" 
              className="w-full h-full object-fill transition-all duration-200"
              referrerPolicy="no-referrer"
            />
            {/* Soft overlay gradient to ensure high readability and contrast */}
            <div className="absolute inset-0 bg-white/25 backdrop-blur-[0.5px]"></div>
          </div>
        )}

        {/* Top Bar: Left (CLS Button), Right (배경이미지 Button) */}
        <div className="w-full flex items-center justify-between z-20 shrink-0">
          {/* Top Left: CLS Button */}
          <button
            type="button"
            onClick={handleCls}
            className="px-2.5 sm:px-3 py-1 bg-gray-200 hover:bg-gray-300 border border-gray-300 shadow rounded text-[11px] sm:text-xs font-bold text-blue-700 active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5 flex items-center gap-1"
            title="저장 및 로그아웃 (Cover Page로 이동)"
          >
            <span>CLS</span>
          </button>

          {/* Top Right: 배경이미지 Button */}
          <div className="flex items-center gap-2" ref={menuRef}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUploadMenu(!showUploadMenu)}
                className="px-2.5 sm:px-3 py-1 bg-gray-200 hover:bg-gray-300 border border-gray-300 shadow rounded text-[11px] sm:text-xs font-bold text-blue-700 active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5 flex items-center gap-1.5"
                title="배경이미지 변경 및 설정"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                <span>배경이미지</span>
              </button>

              {showUploadMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-blue-200 py-1.5 z-50 flex flex-col text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowUploadMenu(false);
                    }}
                    className="px-3 py-2 text-left text-gray-800 hover:bg-blue-50 flex items-center gap-2 cursor-pointer font-semibold transition-colors"
                  >
                    <Upload className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>새 배경이미지 업로드</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleResetBg();
                      setShowUploadMenu(false);
                    }}
                    className="px-3 py-2 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer font-medium border-t border-gray-100 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>기본 배경으로 복원</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Content Section */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center flex-1 my-auto gap-6 sm:gap-10">
          
          {/* Banner Title with clean soft blue styling */}
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <div className="relative z-10 bg-white/90 backdrop-blur-xs border-2 border-blue-400/90 py-3 sm:py-3.5 px-6 sm:px-8 text-center rounded-lg shadow-md">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-blue-950 tracking-wide font-sans">
                Planner Navigation
              </h1>
            </div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6 w-full max-w-sm sm:max-w-md px-2">
            <div className="flex justify-center"><NavButton label="Year Page" onClick={handleYearClick} /></div>
            <div className="flex justify-center"><NavButton label="Month Page" onClick={handleMonthClick} /></div>
            <div className="flex justify-center"><NavButton label="Today Page" onClick={handleTodayClick} /></div>
            <div className="flex justify-center"><NavButton label="최종접속 Page" onClick={handleLastVisitedClick} /></div>
          </div>

        </div>

        {/* Bottom Setting Button */}
        <div className="relative z-20 pb-1 flex justify-center">
          <button 
            type="button"
            className="px-10 sm:px-12 py-2 sm:py-2.5 bg-white/90 backdrop-blur-xs border-2 border-blue-300 rounded-xl shadow-md font-bold text-blue-950 text-sm sm:text-base active:translate-y-px hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer select-none"
          >
            Setting
          </button>
        </div>

      </div>
    </div>
  );
}
