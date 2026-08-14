/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewState, PenState } from './types';
import CoverPage from './views/CoverPage';
import NavigationPage from './views/NavigationPage';
import YearPage from './views/YearPage';
import MonthPage from './views/MonthPage';
import WeekPage from './views/WeekPage';
import DayContainer from './views/DayContainer';
import PenToolbar from './components/PenToolbar';

export default function App() {
  // Use localStorage to remember the last view across reloads
  const [view, setView] = useState<ViewState>(() => {
    const saved = localStorage.getItem('app-view');
    return (saved as ViewState) || 'cover';
  });
  
  const [currentDate, setCurrentDate] = useState(() => {
    const savedDate = localStorage.getItem('planner-last-visited-date');
    if (savedDate) {
      const parsed = new Date(savedDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  useEffect(() => {
    localStorage.setItem('app-view', view);
    // Track last visited planner page (excluding cover and nav)
    if (view !== 'cover' && view !== 'nav') {
      localStorage.setItem('planner-last-visited-view', view);
      localStorage.setItem('planner-last-visited-date', currentDate.toISOString());
    }
  }, [view, currentDate]);
  
  // Global Pen State (default isEnabled: false)
  const [penState, setPenState] = useState<PenState>({
    isEnabled: false,
    color: 'blue',
    width: 'normal',
    isEraser: false
  });

  const isDayView = view === 'day-plan' || view === 'day-action' || view === 'day-diary';
  const showToolbar = view !== 'cover' && view !== 'nav';

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden select-none touch-none">
      <main className="flex-1 relative min-h-0 p-1.5 sm:p-2.5 pb-2.5 sm:pb-3.5 md:pb-4">
        {view === 'cover' && <CoverPage setView={setView} />}
        {view === 'nav' && <NavigationPage setView={setView} setCurrentDate={setCurrentDate} />}
        {view === 'year' && <YearPage currentDate={currentDate} setCurrentDate={setCurrentDate} setView={setView} penState={penState} setPenState={setPenState} />}
        {view === 'month' && <MonthPage currentDate={currentDate} setCurrentDate={setCurrentDate} setView={setView} penState={penState} setPenState={setPenState} />}
        {view === 'week' && <WeekPage currentDate={currentDate} setCurrentDate={setCurrentDate} setView={setView} penState={penState} setPenState={setPenState} />}
        {isDayView && <DayContainer currentDate={currentDate} setCurrentDate={setCurrentDate} viewState={view} setView={setView} penState={penState} setPenState={setPenState} />}
      </main>
      
      {showToolbar && (
        <PenToolbar penState={penState} setPenState={setPenState} />
      )}
    </div>
  );
}

