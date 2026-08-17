import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';
import { Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface CoverPageProps {
  setView: (view: ViewState) => void;
}

export default function CoverPage({ setView }: CoverPageProps) {
  // Cover page background image stored in localStorage with default fallback
  const [bgImage, setBgImage] = useState<string | null>(() => {
    return localStorage.getItem('planner-cover-bg-image') || null;
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setBgImage(result);
          try {
            localStorage.setItem('planner-cover-bg-image', result);
          } catch (err) {
            console.warn('Image size exceeds localStorage quota, using in memory for session', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBg = () => {
    setBgImage(null);
    localStorage.removeItem('planner-cover-bg-image');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setView('nav');
  };

  return (
    <div className="h-full w-full bg-[#f0f6fc] flex items-center justify-center relative p-2 sm:p-3 select-none overflow-hidden">
      {/* Outer container matching planner frame design */}
      <div className="h-full w-full border-4 border-green-800 rounded-3xl bg-white shadow-md relative overflow-hidden flex flex-col justify-between p-3 sm:p-5">
        
        {/* Background Image Layer (Stretches width and height directly to match screen frame dimensions) */}
        {bgImage ? (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img 
              src={bgImage} 
              alt="Cover Background" 
              className="w-full h-full object-fill transition-all duration-200"
              referrerPolicy="no-referrer"
            />
            {/* Soft overlay gradient to ensure high readability and contrast for login form */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px]"></div>
          </div>
        ) : (
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none z-0" 
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #dbeafe 100%)'
            }}
          />
        )}

        {/* Top Bar: Right (배경이미지 Button) */}
        <div className="w-full flex items-center justify-end z-20 shrink-0">
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

        {/* Center Content: Title & Login Box */}
        <div className="relative z-10 w-full max-w-sm mx-auto flex-1 flex flex-col justify-center items-center px-4 sm:px-6">
          {/* Title */}
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-green-800 tracking-widest" style={{ textShadow: '0 0 12px rgba(100,180,255,0.85), 0 2px 4px rgba(0,0,0,0.1)' }}>
              LIFE
            </h1>
            <h1 className="text-4xl sm:text-5xl font-black text-green-800 tracking-widest mt-1.5" style={{ textShadow: '0 0 12px rgba(100,180,255,0.85), 0 2px 4px rgba(0,0,0,0.1)' }}>
              PLANNER
            </h1>
          </div>

          {/* Login Form */}
          <div className="w-full space-y-3.5 bg-white/80 backdrop-blur-xs p-4 sm:p-6 rounded-2xl border border-blue-200/80 shadow-lg">
            <div className="flex rounded overflow-hidden shadow-2xs">
              <div className="w-20 sm:w-24 bg-sky-50 border-2 border-slate-700 flex items-center justify-center font-bold text-blue-900 py-1.5 sm:py-2 text-xs sm:text-sm">
                사용자
              </div>
              <input 
                type="text" 
                defaultValue="user"
                className="flex-1 border-2 border-l-0 border-slate-700 px-3 py-1.5 sm:py-2 outline-none bg-white text-xs sm:text-sm font-medium" 
              />
            </div>
            
            <div className="flex rounded overflow-hidden shadow-2xs">
              <div className="w-20 sm:w-24 bg-sky-50 border-2 border-slate-700 flex items-center justify-center font-bold text-slate-700 py-1.5 sm:py-2 text-xs sm:text-sm">
                Password
              </div>
              <input 
                type="password" 
                defaultValue="••••••••"
                className="flex-1 border-2 border-l-0 border-slate-700 px-3 py-1.5 sm:py-2 outline-none bg-white text-xs sm:text-sm" 
              />
            </div>

            <div className="flex justify-end pt-1">
              <button 
                type="button" 
                onClick={() => setView('nav')}
                className="px-6 py-1.5 sm:py-2 bg-gradient-to-b from-white via-sky-50 to-slate-100 border-2 border-blue-400 hover:border-blue-600 rounded-lg shadow-md font-bold text-blue-900 text-sm active:translate-y-px cursor-pointer transition-all hover:shadow-lg"
              >
                Log In
              </button>
            </div>

            <div className="flex flex-col gap-2.5 pt-3 pl-1 sm:pl-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="w-5 h-5 border-2 border-slate-700 rounded-xs appearance-none checked:bg-blue-600 checked:border-blue-600 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 cursor-pointer" />
                <span className="font-bold text-blue-900 text-xs sm:text-sm">Password 기억</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="w-5 h-5 border-2 border-slate-700 rounded-xs appearance-none checked:bg-blue-600 checked:border-blue-600 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 cursor-pointer" />
                <span className="font-bold text-blue-900 text-xs sm:text-sm">자동 로그인</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Right (신규 생성 Button) */}
        <div className="w-full flex justify-end z-20 shrink-0 pb-1">
          <button 
            type="button"
            onClick={() => setView('nav')}
            className="px-6 sm:px-8 py-2 bg-gradient-to-b from-white via-sky-50 to-slate-100 border-2 border-blue-400 hover:border-blue-600 rounded-xl shadow-md font-bold text-blue-900 text-sm sm:text-base active:translate-y-px cursor-pointer transition-all hover:shadow-lg"
          >
            신규 생성
          </button>
        </div>

      </div>
    </div>
  );
}
