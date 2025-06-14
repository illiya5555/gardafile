import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  X,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Save,
  Edit,
  Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AvailableSlot {
  id: string;
  date: string;
  time_slot: string;
  max_participants: number;
  price_per_person: number;
  is_active: boolean;
  created_at: string;
}

interface CalendarDay {
  date: Date;
  slots: AvailableSlot[];
  isAvailable: boolean;
}

const CalendarManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailableSlot | null>(null);

  const [newSlot, setNewSlot] = useState({
    time_slot: '09:00-13:00',
    max_participants: 5,
    price_per_person: 195
  });

  const timeSlots = [
    '08:30-12:30',
    '09:00-13:00',
    '13:00-17:00',
    '14:00-18:00'
  ];

  useEffect(() => {
    fetchAvailableSlots();
  }, [currentDate]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching slots:', error);
        // Fallback to demo data
        setAvailableSlots([]);
      } else {
        setAvailableSlots(data || []);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];
    
    // Add empty days at the beginning
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: new Date(year, month, -startingDayOfWeek + i + 1),
        slots: [],
        isAvailable: false
      });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dateStr = dayDate.toISOString().split('T')[0];
      const daySlots = availableSlots.filter(slot => slot.date === dateStr);
      
      days.push({
        date: dayDate,
        slots: daySlots,
        isAvailable: daySlots.some(slot => slot.is_active)
      });
    }
    
    return days;
  };

  const addTimeSlot = async () => {
    if (!selectedDate) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('time_slots')
        .insert({
          date: dateStr,
          time: newSlot.time_slot,
          max_participants: newSlot.max_participants,
          price_per_person: newSlot.price_per_person,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setAvailableSlots(prev => [...prev, {
        id: data.id,
        date: dateStr,
        time_slot: newSlot.time_slot,
        max_participants: newSlot.max_participants,
        price_per_person: newSlot.price_per_person,
        is_active: true,
        created_at: data.created_at
      }]);

      setShowAddSlotModal(false);
      setNewSlot({
        time_slot: '09:00-13:00',
        max_participants: 5,
        price_per_person: 195
      });
      
      alert('Time slot added successfully!');
    } catch (error: any) {
      console.error('Error adding time slot:', error);
      alert('Error adding time slot: ' + error.message);
    }
  };

  const updateTimeSlot = async () => {
    if (!editingSlot) return;

    try {
      const { error } = await supabase
        .from('time_slots')
        .update({
          time: editingSlot.time_slot,
          max_participants: editingSlot.max_participants,
          price_per_person: editingSlot.price_per_person,
          is_active: editingSlot.is_active
        })
        .eq('id', editingSlot.id);

      if (error) throw error;

      setAvailableSlots(prev => 
        prev.map(slot => 
          slot.id === editingSlot.id ? editingSlot : slot
        )
      );

      setEditingSlot(null);
      alert('Time slot updated successfully!');
    } catch (error: any) {
      console.error('Error updating time slot:', error);
      alert('Error updating time slot: ' + error.message);
    }
  };

  const deleteTimeSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      setAvailableSlots(prev => prev.filter(slot => slot.id !== slotId));
      alert('Time slot deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting time slot:', error);
      alert('Error deleting time slot: ' + error.message);
    }
  };

  const toggleSlotStatus = async (slot: AvailableSlot) => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .update({ is_active: !slot.is_active })
        .eq('id', slot.id);

      if (error) throw error;

      setAvailableSlots(prev => 
        prev.map(s => 
          s.id === slot.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch (error: any) {
      console.error('Error toggling slot status:', error);
      alert('Error updating slot status: ' + error.message);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar Management</h2>
          <p className="text-gray-600">Manage available booking dates and time slots</p>
        </div>
        <button
          onClick={() => fetchAvailableSlots()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        ) : (
          <>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 bg-gray-50 rounded-t-lg">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7 border border-gray-200 rounded-b-lg">
              {getDaysInMonth(currentDate).map((calendarDay, index) => {
                const isCurrentMonth = calendarDay.date.getMonth() === currentDate.getMonth();
                const isToday = calendarDay.date.toDateString() === new Date().toDateString();
                const isPast = calendarDay.date < new Date() && !isToday;

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-gray-200 p-2 relative ${
                      !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                    } ${isPast ? 'opacity-50' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-blue-600 font-bold' : 
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {calendarDay.date.getDate()}
                    </div>

                    {/* Available Slots */}
                    <div className="space-y-1">
                      {calendarDay.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`text-xs p-1 rounded cursor-pointer transition-all duration-300 ${
                            slot.is_active 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => setEditingSlot(slot)}
                        >
                          <div className="font-medium">{slot.time_slot}</div>
                          <div className="flex items-center justify-between">
                            <span>{slot.max_participants}p</span>
                            <span>€{slot.price_per_person}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Slot Button */}
                    {isCurrentMonth && !isPast && (
                      <button
                        onClick={() => {
                          setSelectedDate(calendarDay.date);
                          setShowAddSlotModal(true);
                        }}
                        className="absolute bottom-1 right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
                        title="Add time slot"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    )}

                    {/* Available Indicator */}
                    {calendarDay.isAvailable && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Available for booking</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-600">Active time slot</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-sm text-gray-600">Inactive time slot</span>
          </div>
          <div className="flex items-center space-x-2">
            <Plus className="h-3 w-3 text-blue-600" />
            <span className="text-sm text-gray-600">Add new slot</span>
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddSlotModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Add Time Slot - {selectedDate.toLocaleDateString()}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot
                </label>
                <select
                  value={newSlot.time_slot}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, time_slot: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={newSlot.max_participants}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Person (€)
                </label>
                <input
                  type="number"
                  value={newSlot.price_per_person}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, price_per_person: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="50"
                  step="5"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowAddSlotModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addTimeSlot}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Edit Time Slot</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot
                </label>
                <select
                  value={editingSlot.time_slot}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, time_slot: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={editingSlot.max_participants}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, max_participants: parseInt(e.target.value) }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Person (€)
                </label>
                <input
                  type="number"
                  value={editingSlot.price_per_person}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, price_per_person: parseInt(e.target.value) }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="50"
                  step="5"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingSlot.is_active}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, is_active: e.target.checked }) : null)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (available for booking)
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => deleteTimeSlot(editingSlot.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={updateTimeSlot}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManagement;