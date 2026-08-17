import React, { useState, useEffect } from 'react';
import { 
  addWeeks, 
  subWeeks, 
  subMonths, 
  addMonths, 
  format, 
  startOfWeek, 
  addDays, 
  getWeek, 
  startOfMonth, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';
import { ViewState, PenState } from '../types';
import DrawingCanvas from '../components/DrawingCanvas';
import EventModal, { EventModalTarget } from '../components/EventModal';
import { cn } from '../lib/utils';
import { getHolidayInfo, getCustomHolidays, getEventColorClasses, CustomEventItem, formatEventShortName } from '../utils/holidays';

interface WeekPageProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  setView: (view: ViewState) => void;
  penState: PenState;
  setPenState: React.Dispatch<React.SetStateAction<PenState>>;
}

function MiniCalendar({ 
  monthDate, 
  highlightDate, 
  title,
  customHolidays,
  onDayClick,
}: { 
  monthDate: Date; 
  highlightDate?: Date | null; 
  title: string;
  customHolidays: Record<string, CustomEventItem>;
  onDayClick?: (day: Date) => void;
}) {
  const monthStart = startOfMonth(monthDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  // Always render exactly 6 rows (42 days) so 6-week months never overflow or get cut off
  const days = Array.from({ length: 42 }, (_, i) => addDays(startDate, i));
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="flex-1 flex flex-col bg-white border border-gray-300 rounded p-1 text-[9px] sm:text-[10px] md:text-[11px] shadow-2xs h-full justify-between overflow-hidden">
      <div className="font-bold text-center text-blue-900 border-b border-gray-200 pb-0.5 mb-0.5 text-[10px] sm:text-xs shrink-0">
        {title}
      </div>
      <div className="grid grid-cols-7 text-center font-semibold text-gray-500 mb-0.5 text-[8px] sm:text-[10px] shrink-0">
        {weekDays.map((d, i) => (
          <span key={i} className={i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 text-center flex-1 min-h-0 w-full">
        {days.map((d, i) => {
          const inMonth = isSameMonth(d, monthStart);
          const isSelected = Boolean(inMonth && highlightDate && isSameDay(d, highlightDate));
          const holidayInfo = getHolidayInfo(d, customHolidays);
          const isSunday = i % 7 === 0;
          const isSaturday = i % 7 === 6;

          let colorClass = "text-gray-700";
          if (holidayInfo.isHoliday) {
            colorClass = getEventColorClasses(holidayInfo.color).text;
          } else if (isSunday) {
            colorClass = "text-red-500 font-bold";
          } else if (isSaturday) {
            colorClass = "text-blue-500 font-bold";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => inMonth && onDayClick && onDayClick(d)}
              disabled={!inMonth}
              className={cn(
                "h-full w-full rounded-xs flex items-center justify-center relative cursor-pointer leading-none text-[9px] sm:text-[10px] md:text-[11px]",
                !inMonth ? "invisible pointer-events-none" : colorClass,
                isSelected ? "bg-yellow-300 font-black text-black ring-1 ring-blue-500" : ""
              )}
            >
              {inMonth ? format(d, 'd') : ''}
              {inMonth && holidayInfo.isHoliday && (
                <span className={cn("w-1 h-1 rounded-full absolute bottom-0", getEventColorClasses(holidayInfo.color).dotBg)} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function WeekPage({ currentDate, setCurrentDate, setView, penState, setPenState }: WeekPageProps) {
  // Custom holidays/schedules state for real-time sync across pages
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

  const handlePrev = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNext = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleThisWeek = () => setCurrentDate(new Date());

  const weekStart = startOfWeek(currentDate);
  const weekNumber = getWeek(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const prevMonth = subMonths(currentDate, 1);
  const nextMonth = addMonths(currentDate, 1);

  const handleDayClick = (day: Date, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      setCurrentDate(day);
      setView('day-plan');
    }
  };

  const formattedWeekNumber = String(weekNumber).padStart(2, '0');

  const handleCls = () => {
    window.dispatchEvent(new CustomEvent('app:save-all'));
    localStorage.setItem('app-view', 'cover');
    setView('cover');
  };

  return (
    <div className="h-full flex flex-col relative border-4 border-green-800 rounded-3xl bg-white shadow-md overflow-hidden">
      {/* 1. Header Bar: HOME/CLS/Title on left, Year/Month/Back on right */}
      <div className="p-2 sm:p-2.5 bg-white z-20 shrink-0 select-none border-b-2 border-green-800 flex flex-col gap-1.5">
        <div className="relative flex items-center justify-between gap-2 min-h-[38px]">
          {/* Left: HOME & CLS Buttons + Title "M월" */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10">
            <button 
              type="button"
              onClick={() => setView('nav')}
              className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5 shrink-0"
              title="Planner Navigation으로 이동"
            >
              HOME
            </button>
            <button 
              type="button"
              onClick={handleCls}
              className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5 shrink-0"
              title="저장 및 로그아웃 (Cover Page로 이동)"
            >
              CLS
            </button>

            {/* Title: Moved to right of HOME/CLS button, identical size & style to Day Plan page */}
            <div className="border-2 border-green-600 bg-sky-100 px-2 sm:px-3 py-0.5 rounded shadow-sm flex items-center shrink-0">
              <h1 className="text-xs sm:text-sm md:text-base font-black tracking-wide text-blue-700 font-sans whitespace-nowrap">
                {format(currentDate, 'M월')}
              </h1>
            </div>
          </div>

          {/* Right: Year, Month, Day, Back buttons in 1 single row */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 z-10">
            <button 
              type="button"
              onClick={() => setView('year')} 
              className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
            >
              Year
            </button>
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

        {/* 2. Sub-Header: -Week, +Week, This Week aligned to the left exactly like Day Plan */}
        <div className="flex items-center justify-between pt-0.5 pb-0.5 relative">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              type="button"
              onClick={handlePrev} 
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="이전 주간으로 이동"
            >
              - Week
            </button>
            <button 
              type="button"
              onClick={handleNext} 
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="다음 주간으로 이동"
            >
              + Week
            </button>
            <button 
              type="button"
              onClick={handleThisWeek} 
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="이번 주(현재 주간)로 이동"
            >
              This Week
            </button>
          </div>

          {/* Right side event add mode button */}
          <div className="flex items-center gap-2">
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
      
      {/* Content Area - Top 3-Month + Timetable + Memo box */}
      <div className="flex-1 relative flex flex-col gap-2 overflow-hidden p-2">
        
        {/* Top Info Area: 3 Mini Calendars (aligned with Items + Sun + Mon = 5.5 ratio) + 실천사항 (aligned with Tue~Sat = 5 ratio) */}
        <div className="flex border border-blue-400 select-none h-48 sm:h-52 md:h-56 bg-blue-50/20 rounded overflow-hidden shrink-0">
          {/* Left: Combined Full-width Header Banner + 3 Mini Calendars (Spans width of Items + Sun + Mon = 5.5) */}
          <div style={{ flex: '5.5 1 0%' }} className="min-w-0 flex flex-col border-r border-blue-400 bg-white">
             {/* Yellow banner - full width with (W-xx) added */}
             <div className="flex items-center justify-center text-xs sm:text-sm md:text-base font-black text-blue-900 border-b border-blue-400 bg-yellow-300 py-1 sm:py-1.5 px-2">
               <div className="text-center font-black text-blue-900 flex items-center justify-center gap-1.5 truncate">
                 <span>{format(weekStart, 'yyyy년 M월 d일')}</span>
                 <span>~</span>
                 <span>{format(weekDays[6], 'yyyy년 M월 d일')}</span>
                 <span>(W-{formattedWeekNumber})</span>
               </div>
             </div>
             
             {/* 3 Mini Calendars - larger vertical space displaying all 6 rows fully without cut off */}
             <div className="flex-1 grid grid-cols-3 gap-0.5 sm:gap-1 p-1 bg-blue-50/10 min-h-0 overflow-hidden">
                <MiniCalendar 
                  monthDate={prevMonth} 
                  title={format(prevMonth, 'M월')} 
                  customHolidays={customHolidays}
                  onDayClick={handleDayClick}
                />
                <MiniCalendar 
                  monthDate={currentDate} 
                  highlightDate={currentDate} 
                  title={format(currentDate, 'M월')} 
                  customHolidays={customHolidays}
                  onDayClick={handleDayClick}
                />
                <MiniCalendar 
                  monthDate={nextMonth} 
                  title={format(nextMonth, 'M월')} 
                  customHolidays={customHolidays}
                  onDayClick={handleDayClick}
                />
             </div>
          </div>

          {/* Right: 실천사항 vertical bar + ruled note area (6 equal rows) (Spans width of Tue ~ Sat = 5) */}
          <div style={{ flex: '5 1 0%' }} className="min-w-0 flex bg-white pointer-events-none">
             <div className="w-7 sm:w-8 bg-yellow-300 flex items-center justify-center text-xs sm:text-sm font-black text-blue-900 border-r border-blue-400 select-none shrink-0" style={{ writingMode: 'vertical-rl' }}>
               실천사항
             </div>
             <div className="flex-1 flex flex-col bg-yellow-50/20">
               {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="flex-1 border-b border-blue-200/80 border-dashed"></div>
               ))}
             </div>
          </div>
        </div>

        {/* Timetable Grid: Left (Items = 3.5 ratio) + Right (7 equal columns for Sun-Sat = 7 ratio) */}
        <div className="flex-[1.4] border border-blue-400 flex flex-col select-none bg-blue-50/10 rounded overflow-hidden min-h-[140px]">
           {/* Headers */}
           <div className="flex border-b border-blue-400 bg-white">
             {/* Items Column Header (3.5 ratio) */}
             <div style={{ flex: '3.5 1 0%' }} className="min-w-0 bg-yellow-300 flex items-center justify-center font-black text-xs sm:text-sm text-blue-900 border-r border-blue-400 py-1">
               Items
             </div>

             {/* 7 Equal Columns (Sun ~ Sat = 7 ratio) */}
             <div style={{ flex: '7 1 0%' }} className="min-w-0 flex">
               {weekDays.map((day, i) => {
                 const holidayInfo = getHolidayInfo(day, customHolidays);
                 const isSunday = i === 0;
                 const isSaturday = i === 6;
                 let textColorClass = "text-blue-900";
                 let eventTheme = getEventColorClasses(holidayInfo.color);

                 if (holidayInfo.isHoliday) {
                   textColorClass = eventTheme.text;
                 } else if (isSunday) {
                   textColorClass = "text-red-600";
                 } else if (isSaturday) {
                   textColorClass = "text-blue-600";
                 }

                 return (
                   <button
                     key={i} 
                     type="button"
                     onClick={(e) => handleDayClick(day, e)}
                     className={cn(
                       "flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 border-r border-blue-300 last:border-r-0 hover:bg-yellow-100 transition-colors cursor-pointer relative overflow-hidden",
                       isSameDay(day, currentDate) 
                         ? "bg-yellow-200/60" 
                         : isSunday 
                           ? "bg-red-50/30" 
                           : isSaturday 
                             ? "bg-yellow-50/40" 
                             : "bg-white"
                     )}
                     title={`${format(day, 'yyyy-MM-dd')}${holidayInfo.name ? ` [${holidayInfo.name}]` : ''} ${isEventAddMode ? '(클릭: 일정 추가/수정)' : 'Day Plan으로 이동'}`}
                   >
                     <div className="flex items-center justify-center gap-1 w-full min-w-0">
                       <span className={cn("text-xs sm:text-sm font-black shrink-0", textColorClass)}>
                         {format(day, 'd')}
                       </span>
                       {holidayInfo.isHoliday && (
                         <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", eventTheme.dotBg)} />
                       )}
                     </div>
                     <div className={cn("text-[9px] sm:text-xs font-bold shrink-0", isSunday ? "text-red-500" : isSaturday ? "text-blue-500" : "text-blue-800")}>
                       {format(day, 'EEE')}
                     </div>
                     {holidayInfo.isHoliday && holidayInfo.name && (
                       <span 
                         className={cn(
                           "text-[8px] sm:text-[9px] font-black truncate max-w-full px-1 py-0.2 rounded-xs mt-0.5 leading-tight block text-center w-full",
                           eventTheme.badgeBg
                         )} 
                         title={holidayInfo.name}
                       >
                         {formatEventShortName(holidayInfo.name, 4)}
                       </span>
                     )}
                   </button>
                 );
               })}
             </div>
           </div>
           
           {/* Grid Body */}
           <div className="flex-1 flex pointer-events-none">
             {/* Left: Items area with horizontal dashed lines (3.5 ratio) */}
             <div style={{ flex: '3.5 1 0%' }} className="min-w-0 bg-yellow-100/40 border-r border-blue-400 flex flex-col">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex-1 border-b border-blue-200/80 border-dashed"></div>
                ))}
             </div>

             {/* Right: 7 columns for Sun~Sat (7 ratio) */}
             <div style={{ flex: '7 1 0%' }} className="min-w-0 flex">
               {weekDays.map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "flex-1 flex flex-col border-r border-blue-200/80 last:border-r-0", 
                     i === 0 ? "bg-red-50/20" : i === 6 ? "bg-yellow-100/20" : "bg-white"
                   )}
                 >
                   {Array.from({ length: 10 }).map((_, j) => (
                     <div key={j} className="flex-1 border-b border-blue-200/80 border-dashed"></div>
                   ))}
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* 6. Memo Box at the bottom (Height scaled to accommodate enlarged 3-month calendar) */}
        <div className="flex-[0.6] border-2 border-cyan-400 rounded bg-white p-2 sm:p-2.5 flex flex-col min-h-[50px] sm:min-h-[65px] select-none relative shadow-2xs">
          <div className="text-blue-700 font-black text-sm sm:text-base underline decoration-blue-700 underline-offset-2 mb-0.5">
            Memo
          </div>
          <div className="flex-1 w-full"></div>
        </div>

        {/* Drawing Overlay across content area */}
        <DrawingCanvas storageKey={`week-${format(weekStart, 'yyyy-ww')}`} penState={penState} />
      </div>

      {/* Schedule / Event Modal Dialog */}
      <EventModal 
        target={selectedEventTarget} 
        onClose={() => setSelectedEventTarget(null)} 
      />
    </div>
  );
}
