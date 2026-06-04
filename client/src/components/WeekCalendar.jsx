import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export function WeekCalendar({ selectedDate, onSelectDate, notes }) {
  const today = new Date();
  
  // baseDate determines which week is shown
  const baseDate = selectedDate || today;
  const startOfWeek = new Date(baseDate);
  const dayOfWeek = baseDate.getDay(); // 0 (Sun) to 6 (Sat)
  startOfWeek.setDate(baseDate.getDate() - dayOfWeek);

  // Generate the 7 days of the current week (Sun-Sat)
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d);
  }

  const handlePrevWeek = () => {
    const prevWeekDate = new Date(baseDate);
    prevWeekDate.setDate(baseDate.getDate() - 7);
    onSelectDate(prevWeekDate);
  };

  const handleNextWeek = () => {
    const nextWeekDate = new Date(baseDate);
    nextWeekDate.setDate(baseDate.getDate() + 7);
    onSelectDate(nextWeekDate);
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

  const getNotesForDate = (dateVal) => {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    return notes.filter(note => {
      try {
        const parsed = typeof note.body === 'string' ? JSON.parse(note.body) : note.body;
        return parsed && parsed.reminder && parsed.reminder.substring(0, 10) === dateStr;
      } catch (e) {
        return false;
      }
    });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = baseDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full max-w-[640px] bg-white rounded-2xl border border-slate-200/50 p-2.5 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-3 select-none">
      {/* Calendar Header with Month/Year and navigation */}
      <div className="flex items-center justify-between px-1 text-slate-700">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-650" />
          <span className="text-sm font-bold font-serif italic text-indigo-900">{monthName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handlePrevWeek}
            title="Previous Week"
            className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onSelectDate(today)}
            className="text-[10px] font-bold text-indigo-650 hover:underline px-1.5 cursor-pointer"
          >
            Today
          </button>
          <button 
            onClick={handleNextWeek}
            title="Next Week"
            className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Grid (7 days) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((dateVal, idx) => {
          const dayNum = dateVal.getDate();
          const dayName = dayNames[dateVal.getDay()];
          const selected = isSelected(dateVal);
          const current = isToday(dateVal);
          const notesForDay = getNotesForDate(dateVal);
          const hasNotes = notesForDay.length > 0;

          return (
            <button
              key={idx}
              onClick={() => {
                if (selected) {
                  onSelectDate(null); // toggle off
                } else {
                  onSelectDate(dateVal);
                }
              }}
              className={`flex flex-col items-center gap-1 py-1.5 px-0.5 sm:py-2 sm:px-1 rounded-xl transition-all duration-150 cursor-pointer relative hover:scale-[1.03] ${
                selected 
                  ? 'bg-slate-800 text-white hover:bg-slate-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`text-[10px] font-sans font-semibold tracking-wider ${
                selected ? 'text-slate-300' : 'text-slate-400'
              }`}>
                {dayName}
              </span>
              
              <span className={`text-[15px] font-bold font-sans ${
                current && !selected 
                  ? 'text-indigo-600 border border-indigo-100 bg-indigo-50/50 rounded-full px-1 min-w-[24px] text-center' 
                  : ''
              }`}>
                {dayNum}
              </span>

              {/* Dot Indicators */}
              <div className="flex gap-0.5 justify-center h-1 mt-0.5 w-full">
                {hasNotes && (
                  notesForDay.slice(0, 3).map((n, cIdx) => (
                    <span 
                      key={cIdx}
                      style={{ backgroundColor: selected ? '#c7d2fe' : (n.color === 'transparent' ? '#94a3b8' : n.color) }}
                      className="w-1 h-1 rounded-full flex-shrink-0"
                    />
                  ))
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default WeekCalendar;
