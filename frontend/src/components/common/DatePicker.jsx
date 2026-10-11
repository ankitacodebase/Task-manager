import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, startOfToday, addDays, isValid, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import 'react-day-picker/style.css';

export const DatePicker = ({
  value = '',
  onChange,
  placeholder = 'Select deadline date...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const today = startOfToday();

  // Parse current value to Date
  let selectedDate = null;
  if (value) {
    if (value instanceof Date && isValid(value)) {
      selectedDate = value;
    } else if (typeof value === 'string') {
      const parsed = parseISO(value);
      if (isValid(parsed)) selectedDate = parsed;
    }
  }

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDate = (date) => {
    if (!date) {
      onChange('');
      return;
    }
    // Strict safeguard: ensure date is not prior to today
    if (date < today) {
      return;
    }
    // Normalize to YYYY-MM-DD
    const formatted = format(date, 'yyyy-MM-dd');
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const handleQuickSelect = (daysToAdd) => {
    const target = addDays(today, daysToAdd);
    handleSelectDate(target);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full px-3 py-2 bg-slate-900/70 border rounded-xl flex items-center justify-between gap-2 transition cursor-pointer ${
          isOpen ? 'border-indigo-500/60 ring-2 ring-indigo-500/20' : 'border-white/10 hover:border-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className={`w-3.5 h-3.5 ${selectedDate ? 'text-indigo-400' : 'text-slate-500'}`} />
          {selectedDate ? (
            <span className="text-xs font-semibold text-white tracking-wide">
              {format(selectedDate, 'PPP')}
            </span>
          ) : (
            <span className="text-xs text-slate-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {selectedDate && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] text-slate-500 px-1 py-0.5 rounded border border-white/5 bg-white/5">
            {selectedDate ? 'Strict Future' : 'No past date'}
          </span>
        </div>
      </div>

      {/* Popover Calendar Container */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 text-slate-100 max-w-sm w-80 ring-1 ring-white/10">
          {/* Quick Date Presets (All guaranteed >= Today) */}
          <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-white/10 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleQuickSelect(0)}
              className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition cursor-pointer whitespace-nowrap"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(1)}
              className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition cursor-pointer whitespace-nowrap"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(3)}
              className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition cursor-pointer whitespace-nowrap"
            >
              In 3 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(7)}
              className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition cursor-pointer whitespace-nowrap"
            >
              Next Week
            </button>
          </div>

          {/* react-day-picker Calendar */}
          <div className="custom-calendar-wrapper flex justify-center w-full">
            <DayPicker
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleSelectDate}
              // STRICT REQUIREMENT: Users cannot select previous dates!
              disabled={{ before: today }}
              showOutsideDays={false}
              components={{
                Chevron: ({ orientation }) => 
                  orientation === 'left' ? (
                    <ChevronLeft className="w-4 h-4 text-slate-300 pointer-events-none" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-300 pointer-events-none" />
                  )
              }}
            />
          </div>

          {/* Footer note */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Past dates are strictly disabled</span>
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={handleClear}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
