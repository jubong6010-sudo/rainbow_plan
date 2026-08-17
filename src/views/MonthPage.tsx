import React, { useState, useEffect } from 'react';
import { 
  addMonths, 
  subMonths, 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  eachDayOfInterval, 
  isSameMonth,
  getWeek 
} from 'date-fns';
import { ViewState, PenState } from '../types';
import DrawingCanvas from '../components/DrawingCanvas';
import EventModal, { EventModalTarget } from '../components/EventModal';
import { cn } from '../lib/utils';
import { getHolidayInfo, getCustomHolidays, getEventColorClasses, CustomEventItem, formatEventShortName } from '../utils/holidays';

interface MonthPageProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  setView: (view: ViewState) => void;
  penState: PenState;
  setPenState: React.Dispatch<React.SetStateAction<PenState>>;
}

export default function MonthPage({ currentDate, setCurrentDate, setView, penState, setPenState }: MonthPageProps) {
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1; // 1-12
  const monthNameEn = format(currentDate, 'MMMM');

  // Custom holidays/schedules state to trigger real-time updates
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

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  // Ensure we get full 6 rows (42 days)
  const daysCount = 42;
  const days = eachDayOfInterval({ 
    start: startDate, 
    end: new Date(startDate.getTime() + (daysCount - 1) * 24 * 60 * 60 * 1000) 
  });

  // Calculate all holiday events & custom schedules for the current month in date order
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthlyEvents: { date: Date; text: string; name: string; color: any }[] = [];
  monthDays.forEach((day) => {
    const hInfo = getHolidayInfo(day, customHolidays);
    if (hInfo.isHoliday && hInfo.name) {
      let displayName = hInfo.name;
      if (displayName.includes('대체공휴일(')) {
        displayName = displayName.replace('대체공휴일(', '대체공휴일 (');
      } else if (displayName.includes('임시공휴일(')) {
        displayName = displayName.replace('임시공휴일(', '임시공휴일 (');
      }
      monthlyEvents.push({
        date: day,
        name: displayName,
        text: `${currentMonthNum}월 ${day.getDate()}일 | ${displayName}`,
        color: hInfo.color || 'blue',
      });
    }
  });

  const weekDays = [
    { label: 'Sun', color: 'text-red-600' },
    { label: 'Mon', color: 'text-gray-800' },
    { label: 'Tue', color: 'text-gray-800' },
    { label: 'Wed', color: 'text-gray-800' },
    { label: 'Thu', color: 'text-gray-800' },
    { label: 'Fri', color: 'text-gray-800' },
    { label: 'Sat', color: 'text-blue-600' },
  ];

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

  const handleWeekClick = (weekDate: Date) => {
    setCurrentDate(weekDate);
    setView('week');
  };

  // Group into 6 weeks with week numbers
  const weeks = [0, 1, 2, 3, 4, 5].map((weekIndex) => {
    const rowDays = days.slice(weekIndex * 7, (weekIndex + 1) * 7);
    const weekDate = rowDays.find(d => isSameMonth(d, monthStart)) || rowDays[0];
    const weekNum = getWeek(weekDate);
    return {
      weekIndex,
      weekDate,
      weekNum,
      rowDays
    };
  });

  const handleCls = () => {
    window.dispatchEvent(new CustomEvent('app:save-all'));
    localStorage.setItem('app-view', 'cover');
    setView('cover');
  };

  const handleThisMonth = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="h-full flex flex-col relative border-4 border-green-800 rounded-3xl bg-white shadow-md overflow-hidden select-none">
      {/* 1. Top Header Section */}
      <div className="relative p-2 sm:p-2.5 bg-white border-b-2 border-green-800 z-20 shrink-0 select-none flex flex-col gap-1.5 min-h-[76px] justify-between">
        {/* Row 1: Left (HOME, CLS), Right (Year, Week, Day, Back) */}
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

          {/* Right: Horizontal Nav Buttons in 1 Row (Year, Week, Day, Back) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button 
              type="button"
              onClick={() => setView('year')}
              className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10px] sm:text-[11px] md:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
            >
              Year
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

        {/* Center: Title Box ("8월" exactly horizontally centered and vertically centered between rows) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex justify-center z-10 pointer-events-none">
          <div className="relative border-2 border-blue-600 bg-[#fce8d5] px-8 sm:px-12 py-0.5 sm:py-1 rounded-xs shadow-sm flex items-center justify-center pointer-events-auto">
            <div className="absolute inset-1 border border-blue-400/80 pointer-events-none"></div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-wide font-sans z-10">
              {currentMonthNum}월
            </h1>
          </div>
        </div>

        {/* Row 2: Left (- Month, + Month, This Month), Right (Schedule Add Mode Button) */}
        <div className="flex items-center justify-between pt-0.5 pb-0.5 z-10">
          {/* Left: - Month, + Month & This Month Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              type="button"
              onClick={handlePrevMonth}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="이전 달로 이동"
            >
              - Month
            </button>
            <button 
              type="button"
              onClick={handleNextMonth}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="다음 달로 이동"
            >
              + Month
            </button>
            <button 
              type="button"
              onClick={handleThisMonth}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 hover:bg-gray-300 shadow rounded font-bold text-blue-700 text-[10.5px] sm:text-xs active:bg-gray-400 cursor-pointer transition-all active:translate-y-0.5"
              title="이번 달(현재 월)로 이동"
            >
              This Month
            </button>
          </div>

          {/* Right: Schedule / Event Add Mode Toggle */}
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

      {/* 3. Main Content: 50% Calendar + 50% Monthly Events (Same Width) */}
      <div className="flex-1 min-h-0 relative flex p-2 sm:p-3.5 gap-3 sm:gap-4 overflow-hidden bg-white">
        
        {/* Left Side: Calendar Grid (50% width) */}
        <div className="w-1/2 flex flex-col border border-gray-300 rounded-lg shadow-2xs overflow-hidden bg-white z-0">
          
          {/* Calendar Header with purple background */}
          <div className="bg-[#6b21a8] text-white px-2 sm:px-3 py-1.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg md:text-xl font-bold tracking-wide">
                {monthNameEn}
              </span>
            </div>
            <span className="text-[8.5px] sm:text-[10px] text-purple-200 hidden sm:inline font-medium">
              {isEventAddMode ? "날짜 클릭: 일정 추가" : "Wk: Week 이동 / 날짜: Day 이동"}
            </span>
          </div>

          {/* Weekday Row (Wk + Sun ~ Sat) */}
          <div className="grid grid-cols-[28px_repeat(7,1fr)] sm:grid-cols-[36px_repeat(7,1fr)] border-b border-gray-300 bg-teal-50/70 shrink-0 text-xs sm:text-sm font-bold text-center">
            <div className="py-1 border-r border-gray-300 text-teal-900 bg-teal-100/80 font-black text-[10px] sm:text-xs flex items-center justify-center">
              Wk
            </div>
            {weekDays.map((wd, i) => (
              <div 
                key={i} 
                className={cn(
                  "py-1 border-r border-gray-300 last:border-r-0",
                  wd.color
                )}
              >
                {wd.label}
              </div>
            ))}
          </div>

          {/* Calendar Days (6 rows with Week Number column on left) */}
          <div className="flex-1 flex flex-col border-b border-gray-300 bg-white">
            {weeks.map((week) => (
              <div 
                key={week.weekIndex} 
                className="flex-1 grid grid-cols-[28px_repeat(7,1fr)] sm:grid-cols-[36px_repeat(7,1fr)] border-b border-gray-300 last:border-b-0"
              >
                {/* Week Number Button (Clickable -> goes to Week Page) */}
                <button
                  type="button"
                  onClick={() => handleWeekClick(week.weekDate)}
                  className="border-r border-gray-300 bg-[#eef8f1] hover:bg-[#d4f5dd] text-emerald-900 font-black text-[10px] sm:text-xs flex items-center justify-center transition-colors cursor-pointer active:bg-emerald-300"
                  title={`${week.weekNum}주차 Week Page로 이동`}
                >
                  <span className="leading-tight font-black tracking-tighter">
                    W{week.weekNum}
                  </span>
                </button>

                {/* 7 Days in this week row */}
                {week.rowDays.map((day, dIdx) => {
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const dayOfWeek = day.getDay(); // 0 = Sun, 6 = Sat
                  const holidayInfo = getHolidayInfo(day, customHolidays);
                  const isSunday = dayOfWeek === 0;
                  const isSaturday = dayOfWeek === 6;

                  let textColorClass = "text-gray-900";
                  let eventColorTheme = getEventColorClasses(holidayInfo.color);

                  if (holidayInfo.isHoliday) {
                    textColorClass = eventColorTheme.text;
                  } else if (isSunday) {
                    textColorClass = "text-red-600";
                  } else if (isSaturday) {
                    textColorClass = "text-blue-600";
                  }

                  return (
                    <button
                      key={dIdx}
                      type="button"
                      onClick={(e) => isCurrentMonth && handleDayClick(day, e)}
                      disabled={!isCurrentMonth}
                      className={cn(
                        "border-r border-gray-300 last:border-r-0 p-1 flex flex-col items-start justify-start transition-colors text-left relative min-w-0 w-full overflow-hidden",
                        !isCurrentMonth 
                          ? "bg-gray-50/60 cursor-default" 
                          : "cursor-pointer hover:bg-yellow-100/70",
                        isCurrentMonth && isSunday && "bg-[#fffbeb]/50",
                        isCurrentMonth && isSaturday && "bg-[#faf5ff]/50",
                        holidayInfo.isCustom && "bg-blue-50/40"
                      )}
                      title={isCurrentMonth ? `${format(day, 'yyyy-MM-dd')}${holidayInfo.name ? ` [${holidayInfo.name}]` : ''} ${isEventAddMode ? '(클릭: 일정 추가/수정)' : 'Day Plan으로 이동'}` : undefined}
                    >
                      {isCurrentMonth && (
                        <div className="flex flex-col items-start justify-start w-full h-full min-w-0 overflow-hidden">
                          <div className="flex items-center justify-between w-full min-w-0">
                            <span className={cn("text-xs sm:text-sm md:text-base font-black leading-none shrink-0", textColorClass)}>
                              {format(day, 'd')}
                            </span>
                            {holidayInfo.isHoliday && (
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", eventColorTheme.dotBg)} />
                            )}
                          </div>
                          {holidayInfo.isHoliday && holidayInfo.name && (
                            <span 
                              className={cn(
                                "text-[8px] sm:text-[9px] font-bold truncate max-w-full mt-0.5 leading-tight block px-0.5 rounded-xs w-full text-left",
                                eventColorTheme.badgeBg
                              )} 
                              title={holidayInfo.name}
                            >
                              {formatEventShortName(holidayInfo.name, 4)}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Monthly Events (월간 주요행사, Exactly 50% width) */}
        <div className="w-1/2 flex flex-col border border-gray-300 rounded-lg shadow-2xs overflow-hidden bg-white z-0">
          
          {/* Header with purple background */}
          <div className="bg-[#6b21a8] text-white px-3 py-1.5 flex items-center justify-between shrink-0">
            <span className="text-sm sm:text-base md:text-lg font-bold tracking-wide text-yellow-300">
              월간 주요행사
            </span>
          </div>

          {/* Lined note paper section with yellow left margin matching 4. Month page.png */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            {/* Ruled rows filling the height */}
            {Array.from({ length: 16 }).map((_, i) => {
              const event = monthlyEvents[i];
              const eventTheme = event ? getEventColorClasses(event.color) : null;
              return (
                <div 
                  key={i} 
                  className="flex-1 border-b border-gray-300/80 flex items-stretch"
                >
                  {/* Left yellow margin column */}
                  <div className="w-8 sm:w-12 bg-[#fef9c3]/70 border-r border-[#67e8f9] shrink-0"></div>
                  {/* Right writing lined space */}
                  <div className="flex-1 bg-white px-2 sm:px-3 flex items-center">
                    {event && (
                      <button
                        type="button"
                        onClick={(e) => handleDayClick(event.date, e)}
                        className={cn(
                          "font-bold text-xs sm:text-sm md:text-base tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer hover:underline text-left",
                          eventTheme ? eventTheme.text : "text-blue-700 hover:text-blue-900"
                        )}
                        title={`${event.text} - ${isEventAddMode ? '일정 수정' : 'Day Plan으로 이동'}`}
                      >
                        <span className={cn("w-2 h-2 rounded-full inline-block shrink-0", eventTheme?.dotBg || "bg-blue-600")} />
                        <span>{event.text}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drawing Overlay */}
        <DrawingCanvas storageKey={`month-${format(currentDate, 'yyyy-MM')}`} penState={penState} />
      </div>

      {/* Schedule / Event Modal Dialog */}
      <EventModal 
        target={selectedEventTarget} 
        onClose={() => setSelectedEventTarget(null)} 
      />
    </div>
  );
}
