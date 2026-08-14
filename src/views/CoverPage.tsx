import React from 'react';
import { ViewState } from '../types';

interface CoverPageProps {
  setView: (view: ViewState) => void;
}

export default function CoverPage({ setView }: CoverPageProps) {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setView('nav');
  };

  return (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Background decoration representing snowflakes/paper cutouts loosely */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #e2e8f0 100%)'
           }}>
        {/* Placeholder for complex background */}
      </div>
      
      {/* Green Border Frame */}
      <div className="absolute inset-2 border-4 border-green-800 rounded-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-green-800 tracking-widest" style={{ textShadow: '0 0 10px rgba(100,180,255,0.8)' }}>
            LIFE
          </h1>
          <h1 className="text-5xl font-black text-green-800 tracking-widest mt-2" style={{ textShadow: '0 0 10px rgba(100,180,255,0.8)' }}>
            PLANNER
          </h1>
        </div>

        {/* Login Form */}
        <div className="w-full space-y-4">
          <div className="flex">
            <div className="w-24 bg-white border-2 border-slate-700 flex items-center justify-center font-bold text-blue-800 py-2">
              사용자
            </div>
            <input type="text" className="flex-1 border-2 border-l-0 border-slate-700 px-3 py-2 outline-none" required />
          </div>
          
          <div className="flex">
            <div className="w-24 bg-white border-2 border-slate-700 flex items-center justify-center font-bold text-slate-600 py-2">
              Password
            </div>
            <input type="password" className="flex-1 border-2 border-l-0 border-slate-700 px-3 py-2 outline-none" required />
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setView('nav')}
              className="px-6 py-2 bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded shadow-md font-bold text-blue-700 active:translate-y-px"
            >
              Log In
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-6 pl-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-6 h-6 border-2 border-slate-700 rounded-none appearance-none checked:bg-blue-600 checked:border-blue-600 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[7px] after:top-[3px] after:w-[6px] after:h-[12px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45" />
              <span className="font-bold text-blue-800">Password 기억</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-6 h-6 border-2 border-slate-700 rounded-none appearance-none checked:bg-blue-600 checked:border-blue-600 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[7px] after:top-[3px] after:w-[6px] after:h-[12px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45" />
              <span className="font-bold text-blue-800">자동 로그인</span>
            </label>
          </div>
        </div>

        <div className="absolute -bottom-32 right-0">
           <button className="px-8 py-3 bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded shadow-md font-bold text-blue-700 text-lg active:translate-y-px">
             신규 생성
           </button>
        </div>

      </div>
    </div>
  );
}
