// Korean National & Public Holidays Utility + User Custom Holidays & Events

export type EventColor = 'red' | 'blue' | 'purple' | 'black' | 'yellow';

export interface CustomEventItem {
  name: string;
  color: EventColor;
}

export interface HolidayInfo {
  isHoliday: boolean;
  name?: string;
  isCustom?: boolean;
  color?: EventColor;
}

// Fixed solar holidays (Month is 1-indexed: 1 = Jan, 12 = Dec)
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': '신정',
  '03-01': '3·1절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '성탄절',
};

/**
 * Format long event names to fit neatly inside compact calendar/table cells without shifting column widths.
 * e.g. "대체공휴일(광복절)" -> "대체공휴...", "임시공휴일(국군의날)" -> "임시공휴..."
 */
export function formatEventShortName(name?: string, maxLength: number = 4): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.slice(0, maxLength) + '...';
}


// Variable / Lunar holidays mapped by year
const LUNAR_HOLIDAYS_BY_YEAR: Record<number, Record<string, string>> = {
  2024: {
    '02-09': '설날 연휴',
    '02-10': '설날',
    '02-11': '설날 연휴',
    '02-12': '대체공휴일(설날)',
    '05-06': '대체공휴일(어린이날)',
    '05-15': '부처님오신날',
    '09-16': '추석 연휴',
    '09-17': '추석',
    '09-18': '추석 연휴',
    '10-01': '임시공휴일(국군의날)',
  },
  2025: {
    '01-28': '설날 연휴',
    '01-29': '설날',
    '01-30': '설날 연휴',
    '01-31': '대체공휴일(설날)',
    '03-03': '대체공휴일(3·1절)',
    '05-05': '어린이날/부처님오신날',
    '05-06': '대체공휴일',
    '10-05': '추석 연휴',
    '10-06': '추석',
    '10-07': '추석 연휴',
    '10-08': '대체공휴일(추석)',
  },
  2026: {
    '02-16': '설날 연휴',
    '02-17': '설날',
    '02-18': '설날 연휴',
    '03-02': '대체공휴일(3·1절)',
    '05-24': '부처님오신날',
    '05-25': '대체공휴일(부처님오신날)',
    '08-17': '대체공휴일(광복절)',
    '09-24': '추석 연휴',
    '09-25': '추석',
    '09-26': '추석 연휴',
    '10-05': '대체공휴일(개천절)',
  },
  2027: {
    '02-06': '설날 연휴',
    '02-07': '설날',
    '02-08': '설날 연휴',
    '02-09': '대체공휴일(설날)',
    '05-13': '부처님오신날',
    '09-14': '추석 연휴',
    '09-15': '추석',
    '09-16': '추석 연휴',
    '10-04': '대체공휴일(개천절)',
    '10-11': '대체공휴일(한글날)',
  },
  2028: {
    '01-26': '설날 연휴',
    '01-27': '설날',
    '01-28': '설날 연휴',
    '05-02': '부처님오신날',
    '10-02': '추석 연휴',
    '10-03': '추석/개천절',
    '10-04': '추석 연휴',
    '10-05': '대체공휴일(추석)',
  },
  2029: {
    '02-12': '설날 연휴',
    '02-13': '설날',
    '02-14': '설날 연휴',
    '05-20': '부처님오신날',
    '05-21': '대체공휴일(부처님오신날)',
    '09-21': '추석 연휴',
    '09-22': '추석',
    '09-23': '추석 연휴',
    '09-24': '대체공휴일(추석)',
  },
  2030: {
    '02-02': '설날 연휴',
    '02-03': '설날',
    '02-04': '설날 연휴',
    '05-09': '부처님오신날',
    '09-11': '추석 연휴',
    '09-12': '추석',
    '09-13': '추석 연휴',
  }
};

const CUSTOM_HOLIDAYS_STORAGE_KEY = 'planner_custom_holidays';

export function getCustomHolidays(): Record<string, CustomEventItem> {
  try {
    const raw = localStorage.getItem(CUSTOM_HOLIDAYS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Normalize if legacy string format was stored
    const normalized: Record<string, CustomEventItem> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        normalized[key] = { name: value, color: 'red' };
      } else if (value && typeof value === 'object') {
        normalized[key] = {
          name: (value as any).name || '일정',
          color: (value as any).color || 'red',
        };
      }
    }
    return normalized;
  } catch (e) {
    console.error('Failed to parse custom holidays', e);
    return {};
  }
}

export function saveCustomHolidays(holidays: Record<string, CustomEventItem>): void {
  try {
    localStorage.setItem(CUSTOM_HOLIDAYS_STORAGE_KEY, JSON.stringify(holidays));
    window.dispatchEvent(new Event('holidays-updated'));
  } catch (e) {
    console.error('Failed to save custom holidays', e);
  }
}

export function setCustomHoliday(dateStr: string, name: string, color: EventColor = 'red'): void {
  const current = getCustomHolidays();
  current[dateStr] = { name, color };
  saveCustomHolidays(current);
}

export function deleteCustomHoliday(dateStr: string): void {
  const current = getCustomHolidays();
  if (current[dateStr]) {
    delete current[dateStr];
    saveCustomHolidays(current);
  }
}

export function getHolidayInfo(date: Date, customHolidays?: Record<string, CustomEventItem>): HolidayInfo {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const mmdd = `${month}-${day}`;
  const yyyymmdd = `${year}-${mmdd}`;

  // 1. Check Custom Holidays / Schedules
  const custom = customHolidays || getCustomHolidays();
  if (custom[yyyymmdd]) {
    return { 
      isHoliday: true, 
      name: custom[yyyymmdd].name, 
      isCustom: true, 
      color: custom[yyyymmdd].color || 'red' 
    };
  }

  // 2. Check Fixed Solar Holidays (Default color: red)
  if (FIXED_HOLIDAYS[mmdd]) {
    return { isHoliday: true, name: FIXED_HOLIDAYS[mmdd], isCustom: false, color: 'red' };
  }

  // 3. Check Lunar / Variable Holidays for that year (Default color: red)
  if (LUNAR_HOLIDAYS_BY_YEAR[year] && LUNAR_HOLIDAYS_BY_YEAR[year][mmdd]) {
    return { isHoliday: true, name: LUNAR_HOLIDAYS_BY_YEAR[year][mmdd], isCustom: false, color: 'red' };
  }

  return { isHoliday: false };
}

export const EVENT_COLOR_OPTIONS: { id: EventColor; label: string; bg: string; text: string; border: string; preview: string }[] = [
  { id: 'red', label: '빨간색', bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-500', preview: '#ef4444' },
  { id: 'blue', label: '파랑색', bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-500', preview: '#3b82f6' },
  { id: 'purple', label: '보라색', bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-500', preview: '#a855f7' },
  { id: 'black', label: '검정색', bg: 'bg-gray-900', text: 'text-gray-900', border: 'border-gray-900', preview: '#111827' },
  { id: 'yellow', label: '노란색', bg: 'bg-yellow-400', text: 'text-amber-600', border: 'border-yellow-400', preview: '#eab308' },
];

export function getEventColorClasses(color?: EventColor) {
  switch (color) {
    case 'blue':
      return {
        text: 'text-blue-600',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        dotBg: 'bg-blue-500',
        ring: 'ring-blue-400',
      };
    case 'purple':
      return {
        text: 'text-purple-600',
        badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
        dotBg: 'bg-purple-500',
        ring: 'ring-purple-400',
      };
    case 'black':
      return {
        text: 'text-gray-900',
        badgeBg: 'bg-gray-200 text-gray-900 border-gray-300',
        dotBg: 'bg-gray-900',
        ring: 'ring-gray-400',
      };
    case 'yellow':
      return {
        text: 'text-amber-600',
        badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
        dotBg: 'bg-yellow-500',
        ring: 'ring-yellow-400',
      };
    case 'red':
    default:
      return {
        text: 'text-red-600',
        badgeBg: 'bg-red-100 text-red-800 border-red-200',
        dotBg: 'bg-red-500',
        ring: 'ring-red-400',
      };
  }
}
