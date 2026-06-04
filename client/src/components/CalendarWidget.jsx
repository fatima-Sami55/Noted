import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export function CalendarWidget({ notes, selectedDate, onSelectDate }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  // Keep month view updated if selected date shifts externally
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handlePrevYear = () => {
    setCurrentMonth(new Date(year - 1, month, 1));
  };

  const handleNextYear = () => {
    setCurrentMonth(new Date(year + 1, month, 1));
  };

  const handleTodayClick = (e) => {
    e.preventDefault();
    onSelectDate(today);
    setCurrentMonth(today);
  };

  // Generate 42-day calendar grid
  const generateGridDays = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();
    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevTotalDays - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month active
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  };

  const getNotesForDate = (dateVal) => {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const matched = notes.filter(note => {
      try {
        const parsed = typeof note.body === 'string' ? JSON.parse(note.body) : note.body;
        return parsed && parsed.reminder && parsed.reminder.substring(0, 10) === dateStr;
      } catch (e) {
        return false;
      }
    });

    return matched.map(n => n.color || 'transparent').slice(0, 3);
  };

  const isToday = (d) => 
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const isSelected = (d) =>
    selectedDate &&
    d.getDate() === selectedDate.getDate() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getFullYear() === selectedDate.getFullYear();

  const isPast = (d) => {
    const tempD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const tempToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return tempD < tempToday;
  };

  const handleDateClick = (d) => {
    if (selectedDate && 
        selectedDate.getFullYear() === d.getFullYear() && 
        selectedDate.getMonth() === d.getMonth() && 
        selectedDate.getDate() === d.getDate()) {
      onSelectDate(null);
    } else {
      onSelectDate(d);
    }
  };

  const gridDays = generateGridDays();
  const monthName = currentMonth.toLocaleString('en-US', { month: 'long' });

  return (
    <div className="w-full bg-white select-none">
      {/* Calendar Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-[12px] font-sans text-slate-400 font-medium tracking-wider leading-none">
            {year}
          </span>
          <span className="text-[28px] font-serif font-bold text-[#3730a3] leading-none mt-1">
            {monthName}
          </span>
          {/* horizontal short marker line */}
          <div className="w-[40px] h-[1.5px] bg-[#3730a3] mt-2 flex-shrink-0" />
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <button 
            onClick={handleTodayClick}
            className="text-xs font-semibold text-indigo-650 hover:underline cursor-pointer"
          >
            Today &rarr;
          </button>
          
          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrevYear} 
              title="Previous Year"
              className="p-1 text-slate-400 hover:text-[#3730a3] hover:bg-slate-50 rounded transition-colors cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button 
              onClick={handlePrevMonth} 
              title="Previous Month"
              className="p-1 text-slate-400 hover:text-[#3730a3] hover:bg-slate-50 rounded transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button 
              onClick={handleNextMonth} 
              title="Next Month"
              className="p-1 text-slate-400 hover:text-[#3730a3] hover:bg-slate-50 rounded transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button 
              onClick={handleNextYear} 
              title="Next Year"
              className="p-1 text-slate-400 hover:text-[#3730a3] hover:bg-slate-50 rounded transition-colors cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-sans font-medium text-slate-400 tracking-wider mt-5 mb-2.5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dHeader) => (
          <div key={dHeader} className="py-0.5">{dHeader.substring(0, 3)}</div>
        ))}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
        {gridDays.map((day, idx) => {
          const matchedColors = getNotesForDate(day.date);
          
          return (
            <div key={idx} className="flex flex-col items-center justify-between min-h-[44px] py-1">
              <div 
                onClick={() => handleDateClick(day.date)}
                className={`w-8 h-8 flex items-center justify-center text-[15px] font-sans transition-all cursor-pointer relative ${
                  isToday(day.date)
                    ? 'bg-[#3730a3] text-white rounded-full font-bold shadow-sm'
                    : isSelected(day.date)
                      ? 'border-2 border-[#3730a3] rounded-full text-[#3730a3] font-semibold'
                      : 'rounded-lg hover:bg-indigo-50/50 text-slate-700'
                } ${
                  isPast(day.date) && !isToday(day.date) && !isSelected(day.date) ? 'opacity-40' : ''
                } ${
                  !day.isCurrentMonth ? 'text-slate-350 opacity-20' : ''
                }`}
              >
                {day.date.getDate()}
              </div>

              {/* Dot Indicators */}
              <div className="flex gap-0.5 justify-center h-1.5 mt-0.5 w-full">
                {matchedColors.map((color, cIdx) => (
                  <span 
                    key={cIdx} 
                    style={{ backgroundColor: color === 'transparent' ? '#94a3b8' : color }} 
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-[0_0.5px_1.5px_rgba(0,0,0,0.15)]"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarWidget;
