import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  id: string;
  date: string;
  time_slot: string;
  max_bookings: number;
  current_bookings: number;
  is_available: boolean;
}

interface ServiceCalendarProps {
  onSelectSlot?: (date: string, timeSlot: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

const ServiceCalendar = ({ onSelectSlot, selectedDate, selectedTime }: ServiceCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(selectedDate ? new Date(selectedDate) : null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const timeSlots = [
    '08:00-10:00',
    '10:00-12:00',
    '12:00-14:00',
    '14:00-16:00',
    '16:00-18:00',
  ];

  useEffect(() => {
    loadAvailability();
  }, [currentMonth]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('availability_calendar')
        .select('*')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateAvailable = (date: Date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    const daySlots = availability.filter(slot => slot.date === dateStr);
    return daySlots.some(slot => slot.is_available && slot.current_bookings < slot.max_bookings);
  };

  const getAvailableSlots = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability.filter(slot => 
      slot.date === dateStr && 
      slot.is_available && 
      slot.current_bookings < slot.max_bookings
    );
  };

  const handleDateSelect = (date: Date) => {
    if (date < new Date()) return; // Can't select past dates
    setSelectedDay(date);
  };

  const handleTimeSelect = (timeSlot: string) => {
    if (selectedDay && onSelectSlot) {
      const dateStr = selectedDay.toISOString().split('T')[0];
      onSelectSlot(dateStr, timeSlot);
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-primary" />
          Select Date & Time
        </h3>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <h4 className="font-bold text-lg">{monthName}</h4>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-bold text-gray-600 py-2">
                {day}
              </div>
            ))}
            
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isToday = date.toDateString() === today.toDateString();
              const isPast = date < today;
              const isAvailable = isDateAvailable(date);
              const isSelected = selectedDay?.toDateString() === date.toDateString();

              return (
                <button
                  key={index}
                  onClick={() => !isPast && handleDateSelect(date)}
                  disabled={isPast || !isAvailable}
                  className={`aspect-square rounded-lg font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary text-white scale-105'
                      : isPast
                      ? 'text-gray-300 cursor-not-allowed'
                      : isAvailable
                      ? 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  } ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded" />
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 rounded" />
              <span className="text-gray-600">Unavailable</span>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Available Times
          </h4>

          {!selectedDay ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select a date to see available times</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeSlots.map((slot) => {
                const availableSlots = getAvailableSlots(selectedDay);
                const slotData = availableSlots.find(s => s.time_slot === slot);
                const isAvailable = !!slotData;
                const isSelected = selectedTime === slot;
                const spotsLeft = slotData ? slotData.max_bookings - slotData.current_bookings : 0;

                return (
                  <button
                    key={slot}
                    onClick={() => isAvailable && handleTimeSelect(slot)}
                    disabled={!isAvailable}
                    className={`w-full p-4 rounded-xl font-bold transition-all ${
                      isSelected
                        ? 'bg-primary text-white scale-105'
                        : isAvailable
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{slot}</span>
                      {isAvailable ? (
                        <span className="text-xs">
                          {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                        </span>
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedDay && selectedTime && (
            <div className="mt-6 p-4 bg-primary/10 rounded-xl">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <Check className="w-5 h-5" />
                Selected Time
              </div>
              <p className="text-gray-900 font-semibold">
                {selectedDay.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-gray-700">{selectedTime}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCalendar;
