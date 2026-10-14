import React, { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: Date;
  onChange?: (date: Date) => void;
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  format?: string;
  className?: string;
  inputClassName?: string;
}

const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      className,
      value,
      onChange,
      label,
      error,
      hint,
      placeholder = 'Select a date',
      disabled = false,
      minDate,
      maxDate,
      showTime = false,
      format = 'MMM DD, YYYY',
      inputClassName,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value || new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (year: number, month: number): number => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number): number => {
      return new Date(year, month, 1).getDay();
    };

    const handleDateSelect = (date: Date) => {
      setSelectedDate(date);
      setViewDate(date);
      onChange?.(date);
      setIsOpen(false);
    };

    const handlePrevMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const formatDate = (date: Date | undefined): string => {
      if (!date) return '';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const isDateDisabled = (date: Date): boolean => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    };

    const isSameDay = (date1: Date | undefined, date2: Date): boolean => {
      if (!date1) return false;
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <div className="w-full" ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-between pr-2',
              error && 'border-red-500',
              inputClassName
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className={cn(selectedDate ? 'text-secondary-900' : 'text-secondary-400')}>
              {selectedDate ? formatDate(selectedDate) : placeholder}
            </span>
            <Calendar className="h-4 w-4 text-secondary-400" />
          </Button>

          {isOpen && (
            <div
              className="absolute z-50 mt-1 w-full rounded-lg shadow-lg bg-white border border-secondary-200 p-4 animate-scale-in"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevMonth}
                    className="p-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-medium">
                    {monthNames[month]} {year}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextMonth}
                    className="p-1"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {dayNames.map((day) => (
                  <div key={day} className="font-medium text-secondary-500 p-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mt-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="p-1" />;
                  }

                  const isSelected = isSameDay(selectedDate, day);
                  const isDisabled = isDateDisabled(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => !isDisabled && handleDateSelect(day)}
                      disabled={isDisabled}
                      className={cn(
                        'p-1 rounded text-sm hover:bg-secondary-100 transition-colors',
                        isSelected && 'bg-primary-600 text-white hover:bg-primary-700',
                        isToday && !isSelected && 'bg-primary-50 text-primary-700',
                        isDisabled && 'text-secondary-300 cursor-not-allowed hover:bg-transparent'
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              {showTime && selectedDate && (
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-2 py-1 text-sm border border-secondary-200 rounded"
                      value={selectedDate.getHours()}
                      onChange={(e) => {
                        const newDate = new Date(selectedDate);
                        newDate.setHours(parseInt(e.target.value));
                        setSelectedDate(newDate);
                      }}
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                    <select
                      className="flex-1 px-2 py-1 text-sm border border-secondary-200 rounded"
                      value={selectedDate.getMinutes()}
                      onChange={(e) => {
                        const newDate = new Date(selectedDate);
                        newDate.setMinutes(parseInt(e.target.value));
                        setSelectedDate(newDate);
                      }}
                    >
                      {Array.from({ length: 60 }).map((_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedDate) {
                      onChange?.(selectedDate);
                    }
                    setIsOpen(false);
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-secondary-500">{hint}</p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };
