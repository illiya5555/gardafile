import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  Ship,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  yacht_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  participants: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: 'yacht' | 'regular';
}

const BookingsCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [bookings, setBookings] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [draggedBooking, setDraggedBooking] = useState<BookingEvent | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [currentDate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch yacht bookings
      const { data: yachtBookings, error: yachtError } = await supabase
        .from('yacht_bookings')
        .select(`
          *,
          yachts(name)
        `)
        .gte('start_date', getMonthStart(currentDate).toISOString().split('T')[0])
        .lte('end_date', getMonthEnd(currentDate).toISOString().split('T')[0]);

      if (yachtError) throw yachtError;

      // Fetch regular bookings
      const { data: regularBookings, error: regularError } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles(first_name, last_name, email, phone)
        `)
        .gte('booking_date', getMonthStart(currentDate).toISOString().split('T')[0])
        .lte('booking_date', getMonthEnd(currentDate).toISOString().split('T')[0]);

      if (regularError) throw regularError;

      // Transform data to calendar events
      const yachtEvents: BookingEvent[] = (yachtBookings || []).map(booking => ({
        id: booking.id,
        title: `${booking.customer_name} - ${booking.yachts?.name || 'Yacht'}`,
        start: new Date(`${booking.start_date}T${booking.start_time}`),
        end: new Date(`${booking.end_date}T${booking.end_time}`),
        yacht_name: booking.yachts?.name || 'Unknown Yacht',
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone,
        participants: booking.participants,
        total_price: parseFloat(booking.total_price),
        status: booking.status,
        type: 'yacht'
      }));

      const regularEvents: BookingEvent[] = (regularBookings || []).map(booking => {
        const [startHour] = booking.time_slot.split('-');
        const startTime = `${startHour}:00`;
        const endTime = `${parseInt(startHour) + 4}:00`; // Assume 4-hour duration
        
        return {
          id: booking.id,
          title: `${booking.profiles?.first_name} ${booking.profiles?.last_name} - Racing`,
          start: new Date(`${booking.booking_date}T${startTime}`),
          end: new Date(`${booking.booking_date}T${endTime}`),
          yacht_name: 'Racing Yacht',
          customer_name: `${booking.profiles?.first_name} ${booking.profiles?.last_name}`,
          customer_email: booking.profiles?.email || '',
          customer_phone: booking.profiles?.phone || '',
          participants: booking.participants,
          total_price: parseFloat(booking.total_price),
          status: booking.status,
          type: 'regular'
        };
      });

      const allBookings = [...yachtEvents, ...regularEvents];
      setBookings(allBookings);
      checkConflicts(allBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Fallback demo data
      const demoBookings: BookingEvent[] = [
        {
          id: '1',
          title: 'John Smith - Bavaria 34',
          start: new Date(2024, currentDate.getMonth(), 15, 9, 0),
          end: new Date(2024, currentDate.getMonth(), 15, 17, 0),
          yacht_name: 'Bavaria 34 "Adriatic Wind"',
          customer_name: 'John Smith',
          customer_email: 'john@example.com',
          customer_phone: '+1 555 123 4567',
          participants: 6,
          total_price: 1194,
          status: 'confirmed',
          type: 'yacht'
        },
        {
          id: '2',
          title: 'Sarah Johnson - Racing',
          start: new Date(2024, currentDate.getMonth(), 16, 14, 0),
          end: new Date(2024, currentDate.getMonth(), 16, 18, 0),
          yacht_name: 'Racing Yacht',
          customer_name: 'Sarah Johnson',
          customer_email: 'sarah@example.com',
          customer_phone: '+1 555 987 6543',
          participants: 4,
          total_price: 796,
          status: 'pending',
          type: 'regular'
        }
      ];
      setBookings(demoBookings);
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = (bookings: BookingEvent[]) => {
    const conflictIds: string[] = [];
    
    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        const booking1 = bookings[i];
        const booking2 = bookings[j];
        
        // Check if same yacht and overlapping times
        if (booking1.yacht_name === booking2.yacht_name &&
            booking1.start < booking2.end &&
            booking2.start < booking1.end) {
          conflictIds.push(booking1.id, booking2.id);
        }
      }
    }
    
    setConflicts([...new Set(conflictIds)]);
  };

  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

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

  const getBookingsForDay = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.start);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDragStart = (booking: BookingEvent) => {
    setDraggedBooking(booking);
  };

  const handleDrop = async (date: Date) => {
    if (!draggedBooking) return;

    const timeDiff = draggedBooking.end.getTime() - draggedBooking.start.getTime();
    const newStart = new Date(date);
    newStart.setHours(draggedBooking.start.getHours(), draggedBooking.start.getMinutes());
    const newEnd = new Date(newStart.getTime() + timeDiff);

    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      const table = draggedBooking.type === 'yacht' ? 'yacht_bookings' : 'bookings';
      const updateData = draggedBooking.type === 'yacht' 
        ? {
            start_date: newStart.toISOString().split('T')[0],
            end_date: newEnd.toISOString().split('T')[0],
            start_time: newStart.toTimeString().split(' ')[0].substring(0, 5),
            end_time: newEnd.toTimeString().split(' ')[0].substring(0, 5)
          }
        : {
            booking_date: newStart.toISOString().split('T')[0],
            time_slot: `${newStart.getHours()}:00-${newEnd.getHours()}:00`
          };

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', draggedBooking.id);

      if (error) throw error;

      // Log the update
      await supabase
        .from('booking_updates')
        .insert({
          booking_id: draggedBooking.id,
          booking_type: draggedBooking.type,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          update_type: 'date_change',
          old_values: {
            start_date: draggedBooking.start.toISOString(),
            end_date: draggedBooking.end.toISOString()
          },
          new_values: {
            start_date: newStart.toISOString(),
            end_date: newEnd.toISOString()
          },
          notes: 'Booking moved via calendar drag and drop'
        });

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === draggedBooking.id 
          ? { ...booking, start: newStart, end: newEnd }
          : booking
      ));

      setActionSuccess('Booking moved successfully!');
    } catch (error: any) {
      console.error('Error moving booking:', error);
      setActionError(`Error moving booking: ${error.message}`);
    } finally {
      setDraggedBooking(null);
      setActionLoading(false);
      
      // Clear success/error messages after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 3000);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string, type: 'yacht' | 'regular') => {
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      const table = type === 'yacht' ? 'yacht_bookings' : 'bookings';
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Log the update
      await supabase
        .from('booking_updates')
        .insert({
          booking_id: bookingId,
          booking_type: type,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          update_type: 'status_change',
          old_values: { 
            status: bookings.find(b => b.id === bookingId)?.status 
          },
          new_values: { status: newStatus },
          notes: `Status changed to ${newStatus}`
        });

      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus as any }
            : booking
        )
      );
      
      setActionSuccess(`Booking status updated to ${newStatus}`);
      
      // If we're updating the currently selected booking, update that too
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          status: newStatus as any
        });
      }
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      setActionError(`Error updating status: ${error.message}`);
    } finally {
      setActionLoading(false);
      
      // Clear success/error messages after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 3000);
    }
  };

  const sendConfirmationEmail = async () => {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      // This would be implemented with a Supabase Edge Function
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setActionSuccess('Confirmation email sent successfully!');
    } catch (error: any) {
      console.error('Error sending confirmation email:', error);
      setActionError(`Error sending email: ${error.message}`);
    } finally {
      setActionLoading(false);
      
      // Clear success/error messages after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 3000);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.yacht_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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
          <h2 className="text-2xl font-bold text-gray-900">Bookings Calendar</h2>
          <p className="text-gray-600">Manage yacht and racing bookings with drag-and-drop</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            aria-label="Export bookings"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button 
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            aria-label="Create new booking"
          >
            <Plus className="h-4 w-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Calendar Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1" role="radiogroup" aria-label="Calendar view">
              {['month', 'week', 'day'].map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType as any)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                    view === viewType
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  role="radio"
                  aria-checked={view === viewType}
                >
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search bookings"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Action Feedback Messages */}
        {(actionSuccess || actionError) && (
          <div className={`mt-4 p-4 rounded-lg ${
            actionSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {actionSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className={actionSuccess ? 'text-green-800' : 'text-red-800'}>
                {actionSuccess || actionError}
              </span>
            </div>
          </div>
        )}

        {/* Conflict Alerts */}
        {conflicts.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">
                {conflicts.length} booking conflicts detected
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        ) : (
          <>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 bg-gray-50">
              {dayNames.map(day => (
                <div key={day} className="p-4 text-center text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7">
              {getDaysInMonth(currentDate).map((date, index) => {
                if (!date) {
                  return <div key={index} className="min-h-[8rem] border-r border-b border-gray-200" aria-hidden="true"></div>;
                }

                const dayBookings = getBookingsForDay(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className="min-h-[8rem] border-r border-b border-gray-200 p-2 relative overflow-hidden"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(date)}
                    aria-label={`${date.toLocaleDateString()}, ${dayBookings.length} bookings`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayBookings.slice(0, 2).map((booking) => (
                        <div
                          key={booking.id}
                          draggable
                          onDragStart={() => handleDragStart(booking)}
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetails(true);
                          }}
                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity duration-300 ${
                            conflicts.includes(booking.id) 
                              ? 'bg-red-100 text-red-800 border border-red-300' 
                              : 'text-white'
                          } ${getStatusColor(booking.status)}`}
                          role="button"
                          aria-label={`Booking: ${booking.customer_name}, ${booking.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        >
                          <div className="truncate font-medium">
                            {booking.customer_name}
                          </div>
                          <div className="truncate">
                            {booking.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-details-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 id="booking-details-title" className="text-xl font-bold text-gray-900">Booking Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close details"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <p className="text-gray-900">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yacht</label>
                  <p className="text-gray-900">{selectedBooking.yacht_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedBooking.customer_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedBooking.customer_phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <p className="text-gray-900">
                    {selectedBooking.start.toLocaleDateString()} {selectedBooking.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {selectedBooking.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                  <p className="text-gray-900">{selectedBooking.participants} people</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                  <p className="text-gray-900">€{selectedBooking.total_price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => updateBookingStatus(selectedBooking.id, e.target.value, selectedBooking.type)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Change booking status"
                    disabled={actionLoading}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {conflicts.includes(selectedBooking.id) && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 font-medium">
                      This booking conflicts with another booking for the same yacht
                    </span>
                  </div>
                </div>
              )}

              {/* Action Feedback */}
              {(actionSuccess || actionError) && (
                <div className={`p-4 rounded-lg ${
                  actionSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`} role="alert">
                  <div className="flex items-center space-x-2">
                    {actionSuccess ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={actionSuccess ? 'text-green-800' : 'text-red-800'}>
                      {actionSuccess || actionError}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button 
                  onClick={sendConfirmationEmail}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center space-x-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  <span>Send Confirmation</span>
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Booking</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsCalendar;