import React, { useState, useEffect } from 'react';
import { 
  addDays, 
  subDays, 
  subMonths, 
  addMonths, 
  format, 
  getWeek, 
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
import { getQuoteForDate } from '../utils/quotes';

function MiniDayCalendar({ 
  monthDate, 
  highlightDate, 
  title,
  isCurrentMonth,
  customHolidays,
  onDayClick,
}: { 
  monthDate: Date; 
  highlightDate?: Date | null; 
  title: string;
  isCurrentMonth?: boolean;
  customHolidays: Record<string, CustomEventItem>;
  onDayClick?: (day: Date) => void;
}) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-white border border-blue-300 rounded p-0.5 shadow-2xs h-full justify-between overflow-hidden">
      <div className="font-bold text-center text-blue-900 border-b border-blue-200 pb-0.5 mb-0.5 text-[7px] sm:text-[7.5px] leading-tight shrink-0">
        {title}
      </div>
      <div className={cn("grid grid-cols-7 text-center font-bold mb-0.5 text-[6px] sm:text-[7px] py-0.5 leading-none shrink-0", isCurrentMonth ? "bg-yellow-300 text-blue-950" : "bg-sky-100 text-blue-800")}>
        {weekDays.map((d, i) => (
          <span key={i} className={i === 0 ? "text-red-600" : i === 6 ? "text-blue-600" : ""}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-[0.5px] text-center flex-1 content-start overflow-hidden">
        {days.map((d, i) => {
          const inMonth = isSameMonth(d, monthStart);
          const isSelected = Boolean(inMonth && highlightDate && isSameDay(d, highlightDate));
          const holidayInfo = getHolidayInfo(d, customHolidays);
          const isSunday = i % 7 === 0;
          const isSaturday = i % 7 === 6;

          let colorClass = "text-gray-700 font-medium";
          if (holidayInfo.isHoliday) {
            colorClass = getEventColorClasses(holidayInfo.color).text;
          } else if (isSunday) {
            colorClass = "text-red-500 font-bold";
          } else if (isSaturday) {
            colorClass = "text-blue-600 font-bold";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => inMonth && onDayClick && onDayClick(d)}
              disabled={!inMonth}
              className={cn(
                "h-2 sm:h-2.5 md:h-3 rounded-xs relative flex items-center justify-center cursor-pointer leading-none text-[6px] sm:text-[7px]",
                !inMonth ? "invisible pointer-events-none" : colorClass,
                isSelected ? "bg-yellow-300 font-black text-black ring-1 ring-blue-600 shadow-xs" : ""
              )}
            >
              {inMonth ? format(d, 'd') : ''}
              {inMonth && holidayInfo.isHoliday && (
                <span className={cn("w-0.5 h-0.5 rounded-full absolute bottom-0", getEventColorClasses(holidayInfo.color).dotBg)} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// PlanView matching 6. day_plan.png
function PlanView({ 
  currentDate, 
  customHolidays,
  onDayClick,
}: { 
  currentDate: Date;
  customHolidays: Record<string, CustomEventItem>;
  onDayClick?: (day: Date) => void;
}) {
  const weekNumber = getWeek(currentDate);
  const prevMonth = subMonths(currentDate, 1);
  const nextMonth = addMonths(currentDate, 1);
  const holidayInfo = getHolidayInfo(currentDate, customHolidays);
  const eventTheme = getEventColorClasses(holidayInfo.color);
  const dayOfWeekKr = ['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()];
  const isSunday = currentDate.getDay() === 0;
  const isSaturday = currentDate.getDay() === 6;

  // Daily Quote based on the current date
  const dailyQuote = getQuoteForDate(currentDate);

  let dayTextColor = "text-blue-900";
  if (holidayInfo.isHoliday) {
    dayTextColor = eventTheme.text;
  } else if (isSunday) {
    dayTextColor = "text-red-600";
  } else if (isSaturday) {
    dayTextColor = "text-blue-600";
  }

  return (
    <div className="flex-1 flex flex-row gap-2 pointer-events-none select-none h-full min-h-0">
      {/* ================= LEFT PANEL (50%) ================= */}
      <div className="w-1/2 flex-1 min-w-0 flex flex-col border-2 border-blue-400 rounded bg-white overflow-hidden shadow-2xs">
        
        {/* 1. Top Section: Quote + Date/Status + 3 Mini Calendars */}
        <div className="flex flex-col border-b-2 border-blue-400 bg-sky-50/40 shrink-0 h-[148px] sm:h-[160px] md:h-[170px]">
          
          {/* Quote Banner (2x height, responsive text scale so full quote is visible) */}
          <div className="h-[44px] sm:h-[48px] md:h-[52px] px-1.5 sm:px-2 py-0.5 border-b border-blue-200 bg-sky-50/80 text-blue-950 flex flex-col justify-center shrink-0 overflow-hidden">
            <p className="italic text-gray-700 text-[6.5px] sm:text-[7.5px] md:text-[8px] leading-tight">
              "{dailyQuote.en}"
            </p>
            <div className="flex items-start justify-between gap-1 mt-0.5">
              <p className="font-medium text-blue-900 text-[6.5px] sm:text-[7.5px] md:text-[8px] leading-tight flex-1">
                "{dailyQuote.kr}"
              </p>
              {dailyQuote.author && (
                <span className="text-[6px] sm:text-[7px] text-gray-500 shrink-0 whitespace-nowrap ml-1">
                  - {dailyQuote.author}
                </span>
              )}
            </div>
          </div>

          {/* Date / Status & 3 Mini Calendars Row */}
          <div className="flex-1 flex p-0.5 sm:p-1 gap-1 min-h-0 overflow-hidden">
            
            {/* Left Status & Day Highlight Box (3/4 width: approx 21-22%) */}
            <div className="w-[21%] sm:w-[22%] flex flex-col justify-between border-r border-blue-300 pr-1 shrink-0 overflow-hidden">
              {/* 1. Week Number: Week (xx) */}
              <div className="text-center font-black text-blue-800 text-[8.5px] sm:text-[9.5px] border-b border-blue-200 pb-0.5 bg-blue-50/50 rounded-t leading-tight">
                Week ({String(weekNumber).padStart(2, '0')})
              </div>

              {/* 2. Big Day Box "4 (화)" + Holiday Name underneath */}
              <div className="flex-1 flex flex-col items-center justify-center px-0.5 py-0.5 my-0.5 bg-yellow-100/70 rounded border border-yellow-300 shadow-2xs min-h-0 overflow-hidden">
                <div className="flex items-baseline justify-center gap-0.5 font-black leading-none">
                  <span className={cn("text-base sm:text-xl md:text-2xl font-black leading-none tracking-tight", dayTextColor)}>
                    {format(currentDate, 'd')}
                  </span>
                  <span className={cn("text-[9px] sm:text-[11px] md:text-xs leading-none font-bold", dayTextColor)}>
                    ({dayOfWeekKr})
                  </span>
                </div>
                {holidayInfo.isHoliday && holidayInfo.name && (
                  <div className={cn("text-[7px] sm:text-[8px] font-bold text-center mt-0.5 px-0.5 leading-tight truncate max-w-full", eventTheme.text)} title={holidayInfo.name}>
                    {holidayInfo.name}
                  </div>
                )}
              </div>
            </div>

            {/* Right: 3 Mini Calendars (Gap = 0, equal width) */}
            <div className="flex-1 grid grid-cols-3 gap-0 min-w-0 min-h-0 overflow-hidden">
              <MiniDayCalendar 
                monthDate={prevMonth} 
                title={format(prevMonth, 'yyyy년 M월')} 
                customHolidays={customHolidays}
                onDayClick={onDayClick}
              />
              <MiniDayCalendar 
                monthDate={currentDate} 
                highlightDate={currentDate} 
                isCurrentMonth={true}
                title={format(currentDate, 'yyyy년 M월')} 
                customHolidays={customHolidays}
                onDayClick={onDayClick}
              />
              <MiniDayCalendar 
                monthDate={nextMonth} 
                title={format(nextMonth, 'yyyy년 M월')} 
                customHolidays={customHolidays}
                onDayClick={onDayClick}
              />
            </div>
          </div>
        </div>

        {/* 2. Bottom Main Tasks Section */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Status Legend in 1 Horizontal Row above "주요 업무" */}
          <div className="h-4.5 sm:h-5 flex items-center justify-around px-1 bg-blue-50/90 border-b border-blue-200 text-[7.5px] sm:text-[8.5px] md:text-[9px] font-bold text-blue-950 shrink-0 select-none">
            <div className="flex items-center gap-0.5">
              <span className="text-blue-700 font-black">v</span>
              <span>완료</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-amber-700 font-black">-</span>
              <span>연기</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-red-600 font-black">x</span>
              <span>취소</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-purple-700 font-black">※</span>
              <span>위임</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-green-700 font-black">•</span>
              <span>진행</span>
            </div>
          </div>

          {/* Header "주요 업무" in Bold Dark Blue Bar */}
          <div className="h-4.5 sm:h-5 flex items-center justify-center bg-blue-800 text-white font-black text-[10px] sm:text-xs tracking-wider border-b border-blue-900 shrink-0">
            주요 업무
          </div>

          {/* Top Upper Tasks Section (11 Rows in a single merged column, flex-shrinks proportionally) */}
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="flex-1 min-h-0 border-b border-blue-200/80 flex items-center pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300/80 mr-2 shrink-0"></span>
              </div>
            ))}
          </div>

          {/* Highlight Cyan Separator Bar (Matched with Right Panel) */}
          <div className="h-1 sm:h-1.5 bg-sky-500 border-t border-b border-sky-600 shrink-0"></div>

          {/* Bottom Section Below Blue Bar (1 Single Large Cell, Matched height with Right Panel: h-20 sm:h-24 md:h-28) */}
          <div className="h-20 sm:h-24 md:h-28 flex flex-col bg-sky-50/20 shrink-0 p-1.5">
            <div className="w-full h-full"></div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL (50%) ================= */}
      <div className="w-1/2 flex-1 min-w-0 flex flex-col border-2 border-blue-400 rounded bg-white overflow-hidden shadow-2xs">
        
        {/* 1. Top Section: 2x2 Question Grid Cards (Reduced to 1/2 size: h-[70px] sm:h-[78px] md:h-[84px]) */}
        <div className="grid grid-cols-2 border-b-2 border-blue-400 bg-sky-50/30 shrink-0 text-center font-bold text-blue-900 text-[7.5px] sm:text-[9px] md:text-[10px] h-[70px] sm:h-[78px] md:h-[84px]">
          <div className="p-1 border-r border-b border-blue-300 flex items-center justify-center bg-white hover:bg-sky-50 min-h-0 leading-tight">
            Is This the GRIT Way ?
          </div>
          <div className="p-1 border-b border-blue-300 flex items-center justify-center bg-white hover:bg-sky-50 min-h-0 leading-tight">
            Keeping core habits ?
          </div>
          <div className="p-1 border-r border-blue-300 flex items-center justify-center bg-white hover:bg-sky-50 min-h-0 leading-tight">
            Am I taking initiative ?
          </div>
          <div className="p-1 flex items-center justify-center bg-white hover:bg-sky-50 min-h-0 leading-tight">
            Do I respect myself ?
          </div>
        </div>

        {/* 2. Main Colored Sections: Upper (Green 7 rows), Lower (Pink 7 rows) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          
          {/* Top Soft Green Section (7 rows, 2 columns, flex-shrinks proportionally) */}
          <div className="flex-1 flex bg-emerald-50/50 min-h-0 border-b border-blue-300">
            <div className="w-1/2 border-r border-blue-300 flex flex-col">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 min-h-0 border-b border-blue-200/70 last:border-b-0"></div>
              ))}
            </div>
            <div className="w-1/2 flex flex-col">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 min-h-0 border-b border-blue-200/70 last:border-b-0"></div>
              ))}
            </div>
          </div>

          {/* Middle Soft Pink Section (7 rows, 2 columns, flex-shrinks proportionally) */}
          <div className="flex-1 flex bg-pink-50/50 min-h-0">
            <div className="w-1/2 border-r border-blue-300 flex flex-col">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 min-h-0 border-b border-blue-200/70 last:border-b-0"></div>
              ))}
            </div>
            <div className="w-1/2 flex flex-col">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 min-h-0 border-b border-blue-200/70 last:border-b-0"></div>
              ))}
            </div>
          </div>

          {/* Cyan/Blue Highlight Bar (Height reduced by 1/2: h-1 sm:h-1.5, matched with left) */}
          <div className="h-1 sm:h-1.5 bg-sky-500 border-t border-b border-sky-600 shrink-0"></div>

          {/* Bottom Soft Yellow Section (Matched height with left bottom: h-20 sm:h-24 md:h-28) */}
          <div className="h-20 sm:h-24 md:h-28 flex bg-yellow-50/60 shrink-0">
            <div className="w-1/2 border-r border-blue-300 flex flex-col">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-1 min-h-0 border-b border-blue-200/70 last:border-b-0"></div>
              ))}
            </div>
            <div className="w-1/2 flex flex-col">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-1 min-h-0 border-b border-blue-200/70 last:border-b-0"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DayContainerProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  viewState: ViewState;
  setView: (view: ViewState) => void;
  penState: PenState;
  setPenState: React.Dispatch<React.SetStateAction<PenState>>;
}

export default function DayContainer({ currentDate, setCurrentDate, viewState, setView, penState, setPenState }: DayContainerProps) {
  const [customHolidays, setCustomHolidays] = useState<Record<string, CustomEventItem>>(getCustomHolidays());
  const [selectedEventTarget, setSelectedEventTarget] = useState<EventModalTarget | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setCustomHolidays(getCustomHolidays());
    };
    window.addEventListener('holidays-updated', handleUpdate);
    return () => window.removeEventListener('holidays-updated', handleUpdate);
  }, []);

  const handlePrev = () => setCurrentDate(subDays(currentDate, 1));
  const handleNext = () => setCurrentDate(addDays(currentDate, 1));
  const dayOfWeekKr = ['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()];

  const handleOpenEventModal = (day: Date) => {
    setPenState(p => ({ ...p, isEnabled: false }));
    const dateStr = format(day, 'yyyy-MM-dd');
    const info = getHolidayInfo(day, customHolidays);
    setSelectedEventTarget({
      dateStr,
      date: day,
      initialName: info.name || '',
      initialColor: info.color || 'red',
    });
  };

  const handleOpenCurrentDayEventModal = () => {
    handleOpenEventModal(currentDate);
  };

  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
  };

  const handleCls = () => {
    window.dispatchEvent(new CustomEvent('app:save-all'));
    localStorage.setItem('app-view', 'cover');
    setView('cover');
  };

  return (
    <div className="h-full flex flex-col relative border-4 border-green-800 rounded-3xl bg-white shadow-md overflow-hidden">
      {/* 1. Header Bar: HOME/CLS on left, Title next to buttons, Month/Week/Back on right */}
      <div className="p-2 sm:p-2.5 bg-white z-20 shrink-0 select-none border-b-2 border-green-800 flex flex-col gap-1.5">
        <div className="relative flex items-center justify-between gap-2 min-h-[38px]">
          {/* Left: HOME & CLS Buttons + Title */}
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

            {/* Title: Moved to right of HOME/CLS button, showing only "M월" (e.g., 8월) with green border, light blue bg */}
            <div className="border-2 border-green-600 bg-sky-100 px-2 sm:px-3 py-0.5 rounded shadow-sm flex items-center shrink-0">
              <h1 className="text-xs sm:text-sm md:text-base font-black tracking-wide text-blue-700 font-sans whitespace-nowrap">
                {format(currentDate, 'M월')}
              </h1>
            </div>
          </div>

          {/* Right: Month, Week, Back buttons in 1 row */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 z-10">
            <button 
              type="button"
              onClick={() => setView('month')} 
              className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
            >
              Month
            </button>
            <button 
              type="button"
              onClick={() => setView('week')} 
              className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
            >
              Week
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

        {/* 2. Sub-Header: -Day, +Day shifted to left so they never overlap with Plan / Action / Diary on the right */}
        <div className="flex items-center justify-between pt-0.5 pb-0.5 relative">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              type="button"
              onClick={handlePrev} 
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="이전 일자로 이동"
            >
              - Day
            </button>
            <button 
              type="button"
              onClick={handleNext} 
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="다음 일자로 이동"
            >
              + Day
            </button>
          </div>

          {/* Right side: Plan, Action, Diary tabs + Event add mode button in 1 row */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 p-0.5 rounded border border-gray-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setView('day-plan')}
                className={cn(
                  "px-2 sm:px-2.5 py-0.5 rounded text-[11px] sm:text-xs font-bold transition-all cursor-pointer",
                  viewState === 'day-plan'
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-blue-700 hover:bg-gray-200"
                )}
              >
                Plan
              </button>
              <button
                type="button"
                onClick={() => setView('day-action')}
                className={cn(
                  "px-2 sm:px-2.5 py-0.5 rounded text-[11px] sm:text-xs font-bold transition-all cursor-pointer",
                  viewState === 'day-action'
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-blue-700 hover:bg-gray-200"
                )}
              >
                Action
              </button>
              <button
                type="button"
                onClick={() => setView('day-diary')}
                className={cn(
                  "px-2 sm:px-2.5 py-0.5 rounded text-[11px] sm:text-xs font-bold transition-all cursor-pointer",
                  viewState === 'day-diary'
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-blue-700 hover:bg-gray-200"
                )}
              >
                Diary
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenCurrentDayEventModal}
              className="px-2.5 sm:px-3 py-1 rounded shadow-2xs text-[11px] sm:text-xs font-bold border border-blue-400 bg-blue-50 text-blue-900 hover:bg-blue-600 hover:text-white active:bg-blue-700 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title="해당 일자에 일정/기념일 바로 추가"
            >
              <span>📅 일정 추가</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden p-1.5 sm:p-2 min-h-0">
        {viewState === 'day-plan' && (
          <div className="relative h-full flex flex-col flex-1 min-h-0">
            <PlanView 
              currentDate={currentDate} 
              customHolidays={customHolidays}
              onDayClick={handleDayClick}
            />
            <DrawingCanvas 
              storageKey={`day-plan-${format(currentDate, 'yyyy-MM-dd')}`} 
              penState={penState} 
            />
          </div>
        )}

        {viewState === 'day-action' && (() => {
          const actionHolidayInfo = getHolidayInfo(currentDate, customHolidays);
          const isSun = currentDate.getDay() === 0;
          const isSat = currentDate.getDay() === 6;
          let dateTextColor = "text-gray-900";
          if (actionHolidayInfo.isHoliday) {
            dateTextColor = "text-red-600";
          } else if (isSun) {
            dateTextColor = "text-red-600";
          } else if (isSat) {
            dateTextColor = "text-blue-600";
          }

          // 6:00 to 22:00 inclusive (17 time slots: 6 to 22)
          const timeHours = Array.from({ length: 17 }, (_, i) => 6 + i);

          return (
            <div className="relative h-full flex flex-col flex-1 min-h-0">
              {/* Action Layout with drawing canvas */}
              <div className="flex-1 flex flex-col border-2 border-blue-400 rounded bg-white p-2.5 sm:p-3 overflow-hidden shadow-2xs">
                {/* Header: Action - 15(Sat) with colored date text & 3x thick dark blue border */}
                <div className="flex items-center justify-between border-b-[3px] border-blue-900 pb-1.5 mb-2 shrink-0">
                  <h2 className="text-sm sm:text-base md:text-lg font-black text-blue-900">
                    Action - <span className={cn("font-black", dateTextColor)}>{format(currentDate, 'd')}({format(currentDate, 'EEE')})</span>
                  </h2>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 min-h-0">
                  {/* Left Column: Time Action Log (6:00 ~ 22:00) */}
                  <div className="border border-blue-300 rounded p-2 bg-blue-50/20 flex flex-col min-h-0 overflow-hidden">
                    <h3 className="font-bold text-blue-800 text-xs sm:text-sm mb-1 shrink-0">Time Action Log</h3>
                    <div className="flex-1 flex flex-col min-h-0">
                      {timeHours.map((hour) => (
                        <div key={hour} className="flex-1 min-h-0 border-b border-blue-100 last:border-b-0 flex items-center text-[10px] sm:text-xs text-gray-600 font-medium pl-1">
                          {hour}:00
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Action Item & Reflection with 4 cells */}
                  <div className="border border-green-300 rounded p-2 bg-green-50/20 flex flex-col min-h-0 overflow-hidden">
                    <h3 className="font-bold text-green-800 text-xs sm:text-sm mb-1.5 shrink-0">Action Item & Reflection</h3>
                    <div className="flex-1 flex flex-col border border-green-200 rounded bg-white overflow-hidden min-h-0">
                      {[
                        'Event',
                        'Emotion',
                        'Want to do',
                        'Self Talk'
                      ].map((label, idx) => (
                        <div 
                          key={label} 
                          className={cn(
                            "flex-1 flex flex-col p-1.5 min-h-0",
                            idx < 3 ? "border-b border-green-200" : ""
                          )}
                        >
                          <span className="text-[11px] sm:text-xs font-bold text-green-900 select-none">
                            {label}
                          </span>
                          <div className="flex-1 min-h-0"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DrawingCanvas 
                storageKey={`day-action-${format(currentDate, 'yyyy-MM-dd')}`} 
                penState={penState} 
              />
            </div>
          );
        })()}

        {viewState === 'day-diary' && (() => {
          const diaryHolidayInfo = getHolidayInfo(currentDate, customHolidays);
          const isSun = currentDate.getDay() === 0;
          const isSat = currentDate.getDay() === 6;
          let dateTextColor = "text-gray-900";
          if (diaryHolidayInfo.isHoliday || isSun) {
            dateTextColor = "text-red-600";
          } else if (isSat) {
            dateTextColor = "text-blue-600";
          }

          return (
            <div className="relative h-full flex flex-col flex-1 min-h-0">
              {/* Diary Layout with drawing canvas */}
              <div className="flex-1 flex flex-col border-2 border-blue-400 rounded bg-white p-2.5 sm:p-3 overflow-hidden shadow-2xs">
                {/* Header: Diary - 16(Sun) with colored date text & 3x thick dark blue border */}
                <div className="flex items-center justify-between border-b-[3px] border-blue-900 pb-1.5 mb-2 shrink-0">
                  <h2 className="text-sm sm:text-base md:text-lg font-black text-blue-900">
                    Diary - <span className={cn("font-black", dateTextColor)}>{format(currentDate, 'd')}({format(currentDate, 'EEE')})</span>
                  </h2>
                </div>

                <div className="flex-1 flex flex-col gap-2.5 min-h-0">
                  {/* Top Section: Today's Reflection & Gratitude (14 rows, thin dotted divider lines) */}
                  <div className="flex-[2.3] border border-pink-300 rounded p-2 bg-pink-50/20 flex flex-col min-h-0 overflow-hidden">
                    <h3 className="font-bold text-pink-900 text-xs sm:text-sm mb-1 shrink-0">Today's Reflection & Gratitude</h3>
                    <div className="flex-1 flex flex-col border border-pink-200 rounded bg-white min-h-0 overflow-hidden">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="flex-1 min-h-0 border-b border-dotted border-pink-300 last:border-b-0 flex items-center px-2"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom Section: Key Takeaway (6 rows, thin dotted divider lines) */}
                  <div className="flex-1 border border-yellow-400 rounded p-2 bg-yellow-50/20 flex flex-col min-h-0 overflow-hidden">
                    <h3 className="font-bold text-yellow-900 text-xs sm:text-sm mb-1 shrink-0">Key Takeaway</h3>
                    <div className="flex-1 flex flex-col border border-yellow-200 rounded bg-white min-h-0 overflow-hidden">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="flex-1 min-h-0 border-b border-dotted border-yellow-400 last:border-b-0 flex items-center px-2"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DrawingCanvas 
                storageKey={`day-diary-${format(currentDate, 'yyyy-MM-dd')}`} 
                penState={penState} 
              />
            </div>
          );
        })()}
      </div>

      {/* Event Modal Dialog */}
      <EventModal 
        target={selectedEventTarget} 
        onClose={() => setSelectedEventTarget(null)} 
      />
    </div>
  );
}
