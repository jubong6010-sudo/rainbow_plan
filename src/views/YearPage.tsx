import React, { useState, useEffect } from 'react';
import { 
  addYears, 
  subYears, 
  addDays,
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';
import { ViewState, PenState } from '../types';
import DrawingCanvas from '../components/DrawingCanvas';
import EventModal, { EventModalTarget } from '../components/EventModal';
import { cn } from '../lib/utils';
import { getHolidayInfo, getCustomHolidays, getEventColorClasses, CustomEventItem } from '../utils/holidays';

interface YearPageProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  setView: (view: ViewState) => void;
  penState: PenState;
  setPenState: React.Dispatch<React.SetStateAction<PenState>>;
}

const MONTH_DATA = [
  { name: 'January', color: 'text-purple-800', monthIndex: 0 },
  { name: 'February', color: 'text-fuchsia-600', monthIndex: 1 },
  { name: 'March', color: 'text-emerald-600', monthIndex: 2 },
  { name: 'April', color: 'text-green-600', monthIndex: 3 },
  { name: 'May', color: 'text-emerald-800', monthIndex: 4 },
  { name: 'June', color: 'text-cyan-600', monthIndex: 5 },
  { name: 'July', color: 'text-teal-600', monthIndex: 6 },
  { name: 'August', color: 'text-teal-800', monthIndex: 7 },
  { name: 'September', color: 'text-blue-800', monthIndex: 8 },
  { name: 'October', color: 'text-amber-700', monthIndex: 9 },
  { name: 'November', color: 'text-orange-900', monthIndex: 10 },
  { name: 'December', color: 'text-stone-800', monthIndex: 11 },
];

export default function YearPage({ currentDate, setCurrentDate, setView, penState, setPenState }: YearPageProps) {
  const currentYear = currentDate.getFullYear();
  
  // Custom holidays/schedules state to trigger re-renders
  const [customHolidays, setCustomHolidays] = useState<Record<string, CustomEventItem>>(getCustomHolidays());
  const [isEventAddMode, setIsEventAddMode] = useState<boolean>(false);
  const [selectedEventTarget, setSelectedEventTarget] = useState<EventModalTarget | null>(null);

  const toggleEventAddMode = () => {
    setIsEventAddMode(prev => {
      const next = !prev;
      if (next) {
        // Rule 1: 일정추가 ON 시 펜도구는 자동으로 OFF
        setPenState(p => ({ ...p, isEnabled: false }));
      }
      // Rule 2: 일정추가 OFF 되어도 펜도구는 그대로 유지(OFF 상태 유지)
      return next;
    });
  };

  useEffect(() => {
    const handleUpdate = () => {
      setCustomHolidays(getCustomHolidays());
    };
    window.addEventListener('holidays-updated', handleUpdate);
    return () => window.removeEventListener('holidays-updated', handleUpdate);
  }, []);

  const handlePrevYear = () => {
    setCurrentDate(subYears(currentDate, 1));
  };

  const handleNextYear = () => {
    setCurrentDate(addYears(currentDate, 1));
  };

  const handleThisYear = () => {
    setCurrentDate(new Date());
  };

  const handleMonthClick = (monthIdx: number) => {
    const targetDate = new Date(currentYear, monthIdx, 1);
    setCurrentDate(targetDate);
    setView('month');
  };

  const handleDayClick = (day: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    const dateStr = format(day, 'yyyy-MM-dd');
    
    if (isEventAddMode) {
      const info = getHolidayInfo(day, customHolidays);
      setSelectedEventTarget({
        dateStr,
        date: day,
        initialName: info.name || '',
        initialColor: info.color || 'red',
      });
      setIsEventAddMode(false);
    } else {
      // Normal mode: navigate to day-plan
      setCurrentDate(day);
      setView('day-plan');
    }
  };

  const weekDays = [
    { label: '일', color: 'text-pink-600 font-bold' },
    { label: '월', color: 'text-gray-800 font-semibold' },
    { label: '화', color: 'text-gray-800 font-semibold' },
    { label: '수', color: 'text-gray-800 font-semibold' },
    { label: '목', color: 'text-gray-800 font-semibold' },
    { label: '금', color: 'text-gray-800 font-semibold' },
    { label: '토', color: 'text-blue-600 font-bold' },
  ];

  const handleCls = () => {
    window.dispatchEvent(new CustomEvent('app:save-all'));
    localStorage.setItem('app-view', 'cover');
    setView('cover');
  };

  return (
    <div className="h-full flex flex-col relative border-4 border-green-800 rounded-3xl bg-white shadow-md overflow-hidden">
      {/* Top Header Section */}
      <div className="relative p-2 sm:p-2.5 bg-white border-b-2 border-green-800 z-20 shrink-0 select-none flex flex-col gap-1.5 min-h-[76px] justify-between">
        {/* Row 1: Left (HOME, CLS), Right (Month, Week, Day, Back) */}
        <div className="flex items-center justify-between min-h-[38px] z-10">
          {/* Left: HOME & CLS Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              type="button"
              onClick={() => setView('nav')}
              className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="Planner Navigation으로 이동"
            >
              HOME
            </button>
            <button 
              type="button"
              onClick={handleCls}
              className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="저장 및 로그아웃 (Cover Page로 이동)"
            >
              CLS
            </button>
          </div>

          {/* Right: Horizontal Nav Buttons (Month, Week, Day, Back) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button 
              type="button"
              onClick={() => setView('month')}
              className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
            >
              Month
            </button>
            <button 
              type="button"
              onClick={() => {
                setCurrentDate(new Date());
                setView('week');
              }}
              className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="This Week 페이지로 이동"
            >
              Week
            </button>
            <button 
              type="button"
              onClick={() => {
                setCurrentDate(new Date());
                setView('day-plan');
              }}
              className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="Today 페이지로 이동"
            >
              Day
            </button>
            <button 
              type="button"
              onClick={() => setView('nav')}
              className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
            >
              Back
            </button>
          </div>
        </div>

        {/* Center: Year Title Box (Horizontally centered at screen center, vertically centered between CLS and +Year rows) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex justify-center z-10 pointer-events-none">
          <div className="relative border-2 border-blue-600 bg-[#fce8d5] px-6 sm:px-10 py-0.5 sm:py-1 rounded-xs shadow-sm flex items-center justify-center pointer-events-auto">
            <div className="absolute inset-1 border border-blue-400/80 pointer-events-none"></div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-wide font-sans z-10">
              {currentYear}년
            </h1>
          </div>
        </div>

        {/* Row 2: Left (- Year, + Year, This Year Buttons), Right (Event Add Mode Button) */}
        <div className="flex items-center justify-between pt-0.5 pb-0.5 z-10">
          {/* Left: - Year, + Year & This Year Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              type="button"
              onClick={handlePrevYear}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="이전 연도로 이동"
            >
              - Year
            </button>
            <button 
              type="button"
              onClick={handleNextYear}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="다음 연도로 이동"
            >
              + Year
            </button>
            <button 
              type="button"
              onClick={handleThisYear}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="올해(현재 연도)로 이동"
            >
              This Year
            </button>
          </div>

          {/* Right: Schedule / Event Add Mode Button aligned to the right, showing '날짜를 선택하세요' when on */}
          <div className="flex items-center gap-2 ml-auto">
            {isEventAddMode && (
              <div className="animate-bounce flex items-center gap-1 px-2 sm:px-2.5 py-0.5 bg-yellow-300 text-blue-950 font-bold text-[10.5px] sm:text-xs rounded-full border border-yellow-400 shadow-xs">
                <span>👉</span>
                <span>날짜를 선택하세요</span>
              </div>
            )}
            <button
              type="button"
              onClick={toggleEventAddMode}
              className={cn(
                "px-2.5 sm:px-3 py-1 rounded shadow-2xs text-[11px] sm:text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 active:scale-95",
                isEventAddMode 
                  ? "bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300" 
                  : "border-blue-400 bg-blue-50 text-blue-900 hover:bg-blue-600 hover:text-white"
              )}
              title={isEventAddMode ? "일정 추가 모드 켜짐 (날짜를 선택하세요)" : "일정 추가 모드 켜기"}
            >
              <span>📅 일정 추가</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Content Area - 12 Months Grid + Drawing Canvas (Fills entire vertical space to the bottom) */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
        {/* 12 Months Grid (4 Rows x 3 Columns, grid-rows-4 h-full to fit perfectly without unused bottom gap) */}
        <div className="h-full p-1.5 sm:p-2 md:p-2.5 grid grid-cols-3 grid-rows-4 gap-1.5 sm:gap-2 select-none z-0">
          {MONTH_DATA.map((item) => {
            const monthDate = new Date(currentYear, item.monthIndex, 1);
            const monthStart = startOfMonth(monthDate);
            const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
            // Ensure exactly 6 rows (6 weeks = 42 days) are generated for every month
            const days = Array.from({ length: 42 }, (_, i) => addDays(startDate, i));

            return (
              <div 
                key={item.monthIndex} 
                className="h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-2xs p-1 hover:border-green-400 hover:shadow-xs transition-all overflow-hidden"
              >
                {/* Month Name Banner (클릭 시 Month Page 이동) */}
                <button
                  type="button"
                  onClick={() => handleMonthClick(item.monthIndex)}
                  className="bg-[#daf0dc] hover:bg-[#c8eecb] transition-colors py-0.5 px-1.5 rounded-xs border-b border-green-200 shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
                  title={`${item.name} Month Page로 이동`}
                >
                  <span className={cn("text-xs sm:text-sm font-black underline decoration-1 underline-offset-2", item.color)}>
                    {item.name}
                  </span>
                </button>

                {/* Weekday Row: 일 월 화 수 목 금 토 */}
                <div className="grid grid-cols-7 text-[10px] sm:text-xs border-b border-gray-200 py-0.5 shrink-0">
                  {weekDays.map((wd, i) => (
                    <span key={i} className={cn("text-center font-bold", wd.color)}>
                      {wd.label}
                    </span>
                  ))}
                </div>

                {/* Days Grid: 6 full week rows, exactly 6 rows per month */}
                <div className="flex-1 min-h-0 grid grid-cols-7 grid-rows-6 w-full text-[10px] sm:text-xs md:text-sm font-semibold">
                  {days.map((day, dayIdx) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    if (!isCurrentMonth) {
                      return (
                        <div 
                          key={dayIdx} 
                          className="h-full w-full flex items-center justify-center text-transparent pointer-events-none select-none"
                        >
                          &nbsp;
                        </div>
                      );
                    }

                    const dayOfWeek = day.getDay(); // 0 = Sun, 6 = Sat
                    const holidayInfo = getHolidayInfo(day, customHolidays);
                    const isSunday = dayOfWeek === 0;
                    const isSaturday = dayOfWeek === 6;
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isToday = isSameDay(day, new Date());

                    // Determine color styling based on custom event color or standard holiday
                    let textColorClass = "text-gray-900 font-bold";
                    let dotColorClass = "bg-red-500";

                    if (holidayInfo.isHoliday) {
                      const colorTheme = getEventColorClasses(holidayInfo.color);
                      textColorClass = `${colorTheme.text} font-black`;
                      dotColorClass = colorTheme.dotBg;
                    } else if (isSunday) {
                      textColorClass = "text-red-600 font-black";
                    } else if (isSaturday) {
                      textColorClass = "text-blue-600 font-black";
                    }

                    return (
                      <button
                        key={dayIdx}
                        type="button"
                        onClick={(e) => handleDayClick(day, e)}
                        className={cn(
                          "h-full w-full rounded-xs transition-all relative flex items-center justify-center cursor-pointer hover:bg-yellow-200/80 active:scale-95 group p-0",
                          isToday ? "bg-amber-100 ring-1 ring-amber-500 font-black" : "",
                          holidayInfo.isCustom ? "bg-blue-50/60" : ""
                        )}
                        title={`${dateStr}${holidayInfo.name ? ` [${holidayInfo.name}]` : ''} ${isEventAddMode ? '(클릭: 일정 추가/수정)' : '(클릭: Day Plan 이동)'}`}
                      >
                        <span className={cn("leading-none tracking-tight", textColorClass)}>
                          {format(day, 'd')}
                        </span>
                        
                        {/* Indicator dot for holidays or custom events positioned absolutely at the bottom without adding height */}
                        {holidayInfo.isHoliday && (
                          <span 
                            className={cn("absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full", dotColorClass)} 
                            title={holidayInfo.name || '일정/공휴일'}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawing Overlay */}
        <DrawingCanvas storageKey={`year-${currentYear}`} penState={penState} />
      </div>

      {/* Schedule / Event Modal Dialog */}
      <EventModal 
        target={selectedEventTarget} 
        onClose={() => setSelectedEventTarget(null)} 
      />
    </div>
  );
}
