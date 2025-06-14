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
  time: string;
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

interface SlotActionModal {
  show: boolean;
  date: Date | null;
  existingSlots: AvailableSlot[];
}

const CalendarManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotActionModal, setSlotActionModal] = useState<SlotActionModal>({
    show: false,
    date: null,
    existingSlots: []
  });
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailableSlot | null>(null);
  const [newSlot, setNewSlot] = useState({
    time: '09:00-13:00',
    max_participants: 5,
    price_per_person: 195
  });

  const timeSlots = [
    '08:30-12:30',
    '09:00-13:00',
    '13:00-17:00',
    '13:30-17:30',
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

  const handleDateClick = (date: Date) => {
    if (date.getMonth() !== currentDate.getMonth()) return;
    
    const dateStr = date.toISOString().split('T')[0];
    const existingSlots = availableSlots.filter(slot => slot.date === dateStr);
    
    setSlotActionModal({
      show: true,
      date: date,
      existingSlots: existingSlots
    });
  };

  const makeAvailableForBooking = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Create default time slots for this date
      const defaultSlots = [
        {
          date: dateStr,
          time: '08:30-12:30',
          max_participants: 5,
          price_per_person: 195,
          is_active: true
        },
        {
          date: dateStr,
          time: '13:30-17:30',
          max_participants: 5,
          price_per_person: 195,
          is_active: true
        }
      ];

      const { data, error } = await supabase
        .from('time_slots')
        .insert(defaultSlots)
        .select();

      if (error) throw error;

      // Update local state
      if (data) {
        setAvailableSlots(prev => [...prev, ...data]);
      }

      setSlotActionModal({ show: false, date: null, existingSlots: [] });
      alert('Date made available for booking with default time slots!');
    } catch (error: any) {
      console.error('Error making date available:', error);
      alert('Error making date available: ' + error.message);
    }
  };

  const makeBooked = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Deactivate all existing slots for this date
      const { error } = await supabase
        .from('time_slots')
        .update({ is_active: false })
        .eq('date', dateStr);

      if (error) throw error;

      // Update local state
      setAvailableSlots(prev => 
        prev.map(slot => 
          slot.date === dateStr 
            ? { ...slot, is_active: false }
            : slot
        )
      );

      setSlotActionModal({ show: false, date: null, existingSlots: [] });
      alert('Date marked as booked - no longer available for client booking!');
    } catch (error: any) {
      console.error('Error marking date as booked:', error);
      alert('Error marking date as booked: ' + error.message);
    }
  };

  const removeAllSlots = async (date: Date) => {
    if (!confirm('Are you sure you want to remove all time slots for this date?')) return;
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('date', dateStr);

      if (error) throw error;

      // Update local state
      setAvailableSlots(prev => prev.filter(slot => slot.date !== dateStr));

      setSlotActionModal({ show: false, date: null, existingSlots: [] });
      alert('All time slots removed for this date!');
    } catch (error: any) {
      console.error('Error removing slots:', error);
      alert('Error removing slots: ' + error.message);
    }
  };

  const addTimeSlot = async () => {
    if (!slotActionModal.date) return;

    try {
      const dateStr = slotActionModal.date.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('time_slots')
        .insert({
          date: dateStr,
          time: newSlot.time,
          max_participants: newSlot.max_participants,
          price_per_person: newSlot.price_per_person,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setAvailableSlots(prev => [...prev, data]);
      setShowAddSlotModal(false);
      setNewSlot({
        time: '09:00-13:00',
        max_participants: 5,
        price_per_person: 195
      });
      
      // Refresh the slot action modal with the new slot
      const updatedSlots = [...slotActionModal.existingSlots, data];
      setSlotActionModal({
        ...slotActionModal,
        existingSlots: updatedSlots
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
          time: editingSlot.time,
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

      // Update the slot in the modal as well
      if (slotActionModal.show && slotActionModal.existingSlots.some(slot => slot.id === editingSlot.id)) {
        setSlotActionModal({
          ...slotActionModal,
          existingSlots: slotActionModal.existingSlots.map(slot => 
            slot.id === editingSlot.id ? editingSlot : slot
          )
        });
      }

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
      
      // Update the modal as well
      if (slotActionModal.show) {
        setSlotActionModal({
          ...slotActionModal,
          existingSlots: slotActionModal.existingSlots.filter(slot => slot.id !== slotId)
        });
      }
      
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

      // Update both the main state and the modal state
      const updatedSlot = { ...slot, is_active: !slot.is_active };
      
      setAvailableSlots(prev => 
        prev.map(s => s.id === slot.id ? updatedSlot : s)
      );
      
      if (slotActionModal.show) {
        setSlotActionModal({
          ...slotActionModal,
          existingSlots: slotActionModal.existingSlots.map(s => 
            s.id === slot.id ? updatedSlot : s
          )
        });
      }
      
      alert(`Time slot ${updatedSlot.is_active ? 'activated' : 'deactivated'} successfully!`);
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
          <p className="text-gray-600">Manage booking availability - control which dates are open for client bookings</p>
        </div>
        <button
          onClick={() => fetchAvailableSlots()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">How to use Calendar Management</h3>
            <p className="text-blue-800 text-sm">
              Click on any date to manage its availability. You can make dates "Available for booking" (clients can book) 
              or "Booked" (blocked for clients). Green dots indicate available dates, gray indicates blocked dates.
            </p>
          </div>
        </div>
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
                const hasActiveSlots = calendarDay.slots.some(slot => slot.is_active);
                const hasInactiveSlots = calendarDay.slots.some(slot => !slot.is_active);

                return (
                  <div
                    key={index}
                    onClick={() => isCurrentMonth && !isPast && handleDateClick(calendarDay.date)}
                    className={`min-h-[80px] border-r border-b border-gray-200 p-2 relative cursor-pointer transition-all duration-300 ${
                      !isCurrentMonth ? 'bg-gray-50' : 
                      isPast ? 'bg-gray-100 cursor-not-allowed opacity-50' :
                      'bg-white hover:bg-blue-50'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-blue-600 font-bold' : 
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {calendarDay.date.getDate()}
                    </div>

                    {/* Availability Indicators */}
                    {isCurrentMonth && !isPast && (
                      <div className="space-y-1">
                        {hasActiveSlots && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-700">Available</span>
                          </div>
                        )}
                        {hasInactiveSlots && !hasActiveSlots && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-xs text-gray-600">Booked</span>
                          </div>
                        )}
                        {calendarDay.slots.length === 0 && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-xs text-yellow-700">Not set</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Slot count */}
                    {calendarDay.slots.length > 0 && (
                      <div className="absolute bottom-1 right-1 text-xs text-gray-500">
                        {calendarDay.slots.length} slots
                      </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Available for client booking</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Booked (blocked for clients)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Not configured</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Today</span>
          </div>
        </div>
      </div>

      {/* Slot Action Modal */}
      {slotActionModal.show && slotActionModal.date && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Manage Date: {slotActionModal.date.toLocaleDateString()}
              </h3>
              <p className="text-gray-600 mt-1">
                Choose how this date should appear to clients
              </p>
            </div>
            <div className="p-6">
              {/* Current Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Current Status:</h4>
                {slotActionModal.existingSlots.length === 0 ? (
                  <p className="text-gray-600">No time slots configured</p>
                ) : (
                  <div className="space-y-1">
                    {slotActionModal.existingSlots.some(slot => slot.is_active) && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-700">Available for booking</span>
                      </div>
                    )}
                    {slotActionModal.existingSlots.some(slot => !slot.is_active) && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Some slots blocked</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {slotActionModal.existingSlots.length} time slots configured
                    </p>
                  </div>
                )}
              </div>

              {/* Existing Time Slots */}
              {slotActionModal.existingSlots.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Time Slots:</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {slotActionModal.existingSlots.map(slot => (
                      <div 
                        key={slot.id}
                        className={`p-3 rounded-lg border ${
                          slot.is_active 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{slot.time}</p>
                            <p className="text-sm text-gray-600">
                              €{slot.price_per_person} per person • Max {slot.max_participants} people
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleSlotStatus(slot)}
                              className={`p-1 rounded ${
                                slot.is_active 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title={slot.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {slot.is_active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => setEditingSlot(slot)}
                              className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteTimeSlot(slot.id)}
                              className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddSlotModal(true)}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-300"
                >
                  <Plus className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-semibold text-blue-900">Add Time Slot</div>
                    <div className="text-sm text-blue-700">Create a new time slot for this date</div>
                  </div>
                </button>

                <button
                  onClick={() => makeAvailableForBooking(slotActionModal.date!)}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-300"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <div className="font-semibold text-green-900">Available for Booking</div>
                    <div className="text-sm text-green-700">Add default time slots and make available</div>
                  </div>
                </button>

                <button
                  onClick={() => makeBooked(slotActionModal.date!)}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  <X className="h-5 w-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Block All Slots</div>
                    <div className="text-sm text-gray-600">Make all slots unavailable for booking</div>
                  </div>
                </button>

                {slotActionModal.existingSlots.length > 0 && (
                  <button
                    onClick={() => removeAllSlots(slotActionModal.date!)}
                    className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-300"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <div className="text-left">
                      <div className="font-semibold text-red-900">Remove All Slots</div>
                      <div className="text-sm text-red-700">Delete all time slots for this date</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSlotActionModal({ show: false, date: null, existingSlots: [] })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddSlotModal && slotActionModal.date && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Add Time Slot - {slotActionModal.date.toLocaleDateString()}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot
                </label>
                <select
                  value={newSlot.time}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, time: e.target.value }))}
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
                  value={editingSlot.time}
                  onChange={(e) => setEditingSlot(prev => prev ? ({ ...prev, time: e.target.value }) : null)}
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