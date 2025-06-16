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
  Eye,
  Settings,
  ToggleLeft,
  ToggleRight,
  Copy,
  Calendar as CalendarIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCalendarSync, TimeSlot } from '../../hooks/useCalendarSync';

const CalendarManagement = () => {
  const { timeSlots, loading, refreshData } = useCalendarSync();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [newSlot, setNewSlot] = useState({
    time: '09:00-13:00',
    max_participants: 5,
    price_per_person: 195,
    is_active: true
  });

  const [bulkAction, setBulkAction] = useState({
    startDate: '',
    endDate: '',
    action: 'activate' as 'activate' | 'deactivate' | 'delete',
    timeSlots: [] as string[]
  });

  const timeSlotOptions = [
    '08:30-12:30',
    '09:00-13:00',
    '13:00-17:00',
    '13:30-17:30',
    '14:00-18:00'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty days at the beginning
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getSlotsForDate = (date: string) => {
    return timeSlots.filter(slot => slot.date === date);
  };

  const getDateStatus = (date: string) => {
    const slots = getSlotsForDate(date);
    if (slots.length === 0) return 'none';
    if (slots.every(slot => slot.is_active)) return 'available';
    if (slots.every(slot => !slot.is_active)) return 'blocked';
    return 'partial';
  };

  const handleDateClick = (date: Date) => {
    if (date.getMonth() !== currentDate.getMonth()) return;
    
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
  };

  const handleCreateSlot = async () => {
    if (!selectedDate) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('time_slots')
        .insert({
          date: selectedDate,
          time: newSlot.time,
          max_participants: newSlot.max_participants,
          price_per_person: newSlot.price_per_person,
          is_active: newSlot.is_active
        });

      if (error) throw error;

      setShowSlotModal(false);
      setNewSlot({
        time: '09:00-13:00',
        max_participants: 5,
        price_per_person: 195,
        is_active: true
      });
      
      alert('Time slot created successfully!');
    } catch (error: any) {
      console.error('Error creating time slot:', error);
      alert('Error creating time slot: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;

    setActionLoading(true);
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

      setEditingSlot(null);
      alert('Time slot updated successfully!');
    } catch (error: any) {
      console.error('Error updating time slot:', error);
      alert('Error updating time slot: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      
      alert('Time slot deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting time slot:', error);
      alert('Error deleting time slot: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSlotStatus = async (slot: TimeSlot) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('time_slots')
        .update({ is_active: !slot.is_active })
        .eq('id', slot.id);

      if (error) throw error;
      
      alert(`Time slot ${!slot.is_active ? 'activated' : 'deactivated'} successfully!`);
    } catch (error: any) {
      console.error('Error toggling slot status:', error);
      alert('Error updating slot status: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickDateAction = async (date: string, action: 'activate' | 'deactivate' | 'create_default') => {
    setActionLoading(true);
    try {
      if (action === 'create_default') {
        // Create default time slots for the date
        const defaultSlots = [
          {
            date,
            time: '08:30-12:30',
            max_participants: 5,
            price_per_person: 195,
            is_active: true
          },
          {
            date,
            time: '13:30-17:30',
            max_participants: 5,
            price_per_person: 195,
            is_active: true
          }
        ];

        const { error } = await supabase
          .from('time_slots')
          .insert(defaultSlots);

        if (error) throw error;
        alert('Default time slots created successfully!');
      } else {
        // Update existing slots
        const { error } = await supabase
          .from('time_slots')
          .update({ is_active: action === 'activate' })
          .eq('date', date);

        if (error) throw error;
        alert(`All slots for this date ${action === 'activate' ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error: any) {
      console.error('Error performing date action:', error);
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction.startDate || !bulkAction.endDate) {
      alert('Please select start and end dates');
      return;
    }

    setActionLoading(true);
    try {
      if (bulkAction.action === 'delete') {
        const { error } = await supabase
          .from('time_slots')
          .delete()
          .gte('date', bulkAction.startDate)
          .lte('date', bulkAction.endDate);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('time_slots')
          .update({ is_active: bulkAction.action === 'activate' })
          .gte('date', bulkAction.startDate)
          .lte('date', bulkAction.endDate);

        if (error) throw error;
      }

      setShowBulkModal(false);
      setBulkAction({
        startDate: '',
        endDate: '',
        action: 'activate',
        timeSlots: []
      });
      
      alert(`Bulk ${bulkAction.action} completed successfully!`);
    } catch (error: any) {
      console.error('Error performing bulk action:', error);
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
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
          <p className="text-gray-600">Manage booking availability and time slots</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300"
          >
            <Settings className="h-4 w-4" />
            <span>Bulk Actions</span>
          </button>
          <button
            onClick={refreshData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Calendar Management Guide</h3>
            <p className="text-blue-800 text-sm">
              Click on any date to manage its time slots. Green = available, Red = blocked, Yellow = partial availability, Gray = no slots configured.
              Changes are synchronized in real-time across all calendars.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {/* Calendar Header */}
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

            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading calendar...</p>
              </div>
            ) : (
              <>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth(currentDate).map((date, index) => {
                    if (!date) {
                      return <div key={index} className="h-16"></div>;
                    }

                    const dateStr = date.toISOString().split('T')[0];
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isPast = date < new Date() && !isToday;
                    const isSelected = dateStr === selectedDate;
                    const status = getDateStatus(dateStr);
                    const slotsCount = getSlotsForDate(dateStr).length;

                    let bgColor = 'bg-white hover:bg-gray-50';
                    if (isSelected) bgColor = 'bg-blue-600 text-white';
                    else if (isPast) bgColor = 'bg-gray-100 text-gray-400';
                    else if (status === 'available') bgColor = 'bg-green-100 text-green-800 hover:bg-green-200';
                    else if (status === 'blocked') bgColor = 'bg-red-100 text-red-800 hover:bg-red-200';
                    else if (status === 'partial') bgColor = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
                    else if (status === 'none') bgColor = 'bg-gray-50 text-gray-600 hover:bg-gray-100';

                    return (
                      <div
                        key={index}
                        onClick={() => isCurrentMonth && !isPast && handleDateClick(date)}
                        className={`h-16 rounded-lg cursor-pointer transition-all duration-300 relative p-2 ${bgColor} ${
                          !isCurrentMonth ? 'opacity-50' : ''
                        } ${isPast ? 'cursor-not-allowed' : ''}`}
                      >
                        <div className="text-sm font-medium">{date.getDate()}</div>
                        {slotsCount > 0 && (
                          <div className="absolute bottom-1 right-1 text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                            {slotsCount}
                          </div>
                        )}
                        {isToday && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 rounded"></div>
                <span>Blocked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                <span>Partial</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>No slots</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Selected Date Info */}
          {selectedDate && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {new Date(selectedDate).toLocaleDateString()}
              </h3>
              
              {/* Quick Actions */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setShowSlotModal(true)}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Time Slot</span>
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickDateAction(selectedDate, 'create_default')}
                    disabled={actionLoading}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 text-sm disabled:opacity-50"
                  >
                    Create Default
                  </button>
                  <button
                    onClick={() => handleQuickDateAction(selectedDate, 'activate')}
                    disabled={actionLoading}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm disabled:opacity-50"
                  >
                    Activate All
                  </button>
                  <button
                    onClick={() => handleQuickDateAction(selectedDate, 'deactivate')}
                    disabled={actionLoading}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 text-sm disabled:opacity-50"
                  >
                    Block All
                  </button>
                </div>
              </div>

              {/* Time Slots for Selected Date */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Time Slots</h4>
                {getSlotsForDate(selectedDate).map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-lg border ${
                      slot.is_active 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{slot.time}</p>
                        <p className="text-sm text-gray-600">
                          €{slot.price_per_person} • Max {slot.max_participants}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleToggleSlotStatus(slot)}
                          disabled={actionLoading}
                          className={`p-1 rounded ${
                            slot.is_active 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          } disabled:opacity-50`}
                          title={slot.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {slot.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditingSlot(slot)}
                          className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          disabled={actionLoading}
                          className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {getSlotsForDate(selectedDate).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No time slots configured</p>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Slots</span>
                <span className="font-semibold">{timeSlots.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Slots</span>
                <span className="font-semibold text-green-600">
                  {timeSlots.filter(slot => slot.is_active).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blocked Slots</span>
                <span className="font-semibold text-red-600">
                  {timeSlots.filter(slot => !slot.is_active).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Dates</span>
                <span className="font-semibold">
                  {new Set(timeSlots.filter(slot => slot.is_active).map(slot => slot.date)).size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Slot Modal */}
      {(showSlotModal || editingSlot) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slot
                </label>
                <select
                  value={editingSlot ? editingSlot.time : newSlot.time}
                  onChange={(e) => editingSlot 
                    ? setEditingSlot({...editingSlot, time: e.target.value})
                    : setNewSlot({...newSlot, time: e.target.value})
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeSlotOptions.map(slot => (
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
                  value={editingSlot ? editingSlot.max_participants : newSlot.max_participants}
                  onChange={(e) => editingSlot
                    ? setEditingSlot({...editingSlot, max_participants: parseInt(e.target.value)})
                    : setNewSlot({...newSlot, max_participants: parseInt(e.target.value)})
                  }
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
                  value={editingSlot ? editingSlot.price_per_person : newSlot.price_per_person}
                  onChange={(e) => editingSlot
                    ? setEditingSlot({...editingSlot, price_per_person: parseFloat(e.target.value)})
                    : setNewSlot({...newSlot, price_per_person: parseFloat(e.target.value)})
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="50"
                  step="5"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingSlot ? editingSlot.is_active : newSlot.is_active}
                  onChange={(e) => editingSlot
                    ? setEditingSlot({...editingSlot, is_active: e.target.checked})
                    : setNewSlot({...newSlot, is_active: e.target.checked})
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (available for booking)
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowSlotModal(false);
                  setEditingSlot(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={editingSlot ? handleUpdateSlot : handleCreateSlot}
                disabled={actionLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : editingSlot ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Bulk Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={bulkAction.startDate}
                  onChange={(e) => setBulkAction({...bulkAction, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={bulkAction.endDate}
                  onChange={(e) => setBulkAction({...bulkAction, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={bulkAction.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <select
                  value={bulkAction.action}
                  onChange={(e) => setBulkAction({...bulkAction, action: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activate">Activate all slots</option>
                  <option value="deactivate">Deactivate all slots</option>
                  <option value="delete">Delete all slots</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={actionLoading || !bulkAction.startDate || !bulkAction.endDate}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Execute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManagement;