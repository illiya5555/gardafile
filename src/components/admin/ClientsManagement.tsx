import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Mail,
  Phone,
  User,
  Calendar,
  DollarSign,
  Star,
  Plus,
  Tag,
  MessageSquare,
  RefreshCw,
  Users
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  client_category?: string;
  created_at: string;
  updated_at: string;
  bookings_count?: number;
  total_spent?: number;
  last_booking?: string;
}

const ClientsManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = [
    { id: 'vip', name: 'VIP', color: 'bg-purple-100 text-purple-800' },
    { id: 'regular', name: 'Regular', color: 'bg-blue-100 text-blue-800' },
    { id: 'corporate', name: 'Corporate', color: 'bg-green-100 text-green-800' },
    { id: 'new', name: 'New', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'inactive', name: 'Inactive', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Шаг 1: Получаем всех клиентов
      const { data: clients, error: clientsError } = await supabase
        .from('profiles')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (clientsError) throw clientsError;
      
      if (!clients || clients.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }

      // Шаг 2: Получаем все бронирования в одном запросе
      const clientIds = clients.map(client => client.id);
      
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('user_id, total_price, created_at, status')
        .in('user_id', clientIds)
        .not('user_id', 'is', null);
        
      if (reservationsError) throw reservationsError;
      
      // Шаг 3: Обрабатываем данные на стороне клиента
      const clientsWithStats = clients.map(client => {
        // Фильтруем бронирования для этого клиента
        const clientReservations = reservations?.filter(r => r.user_id === client.id) || [];
        
        // Рассчитываем статистику
        const bookingsCount = clientReservations.length;
        const totalSpent = clientReservations.reduce((sum, booking) => 
          sum + parseFloat(booking.total_price || '0'), 0);
        
        // Получаем дату последнего бронирования
        let lastBooking = null;
        if (clientReservations.length > 0) {
          // Сортируем по дате создания в убывающем порядке, чтобы получить самое последнее бронирование
          const sortedReservations = [...clientReservations].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          lastBooking = sortedReservations[0].created_at;
        }
        
        return {
          ...client,
          bookings_count: bookingsCount,
          total_spent: totalSpent,
          last_booking: lastBooking,
          client_category: client.client_category || 'new'
        };
      });

      setClients(clientsWithStats);
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Fallback data for demo
      setClients([
        {
          id: '1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john@example.com',
          phone: '+1 555 123 4567',
          client_category: 'vip',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          bookings_count: 5,
          total_spent: 995,
          last_booking: '2024-01-10T14:00:00Z'
        },
        {
          id: '2',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah@example.com',
          phone: '+1 555 987 6543',
          client_category: 'regular',
          created_at: '2024-01-14T14:20:00Z',
          updated_at: '2024-01-14T14:20:00Z',
          bookings_count: 2,
          total_spent: 398,
          last_booking: '2024-01-08T16:00:00Z'
        },
        {
          id: '3',
          first_name: 'Michael',
          last_name: 'Brown',
          email: 'michael@example.com',
          phone: '+1 555 456 7890',
          client_category: 'corporate',
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-13T09:15:00Z',
          bookings_count: 1,
          total_spent: 199,
          last_booking: '2024-01-05T10:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateClientCategory = async (clientId: string, category: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ client_category: category })
        .eq('id', clientId);

      if (error) throw error;

      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { ...client, client_category: category }
            : client
        )
      );
    } catch (error) {
      console.error('Error updating client category:', error);
      alert('Error updating category');
    }
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.id === category) || categories[3]; // Default to 'new'
  };

  const filteredClients = clients
    .filter(client => {
      const matchesSearch = 
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone && client.phone.includes(searchTerm));
      
      const matchesCategory = categoryFilter === 'all' || client.client_category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof Client];
      const bValue = b[sortBy as keyof Client];
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue < bValue ? -1 : 1;
      }
    });

  const exportData = () => {
    const csvContent = [
      ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Category', 'Bookings', 'Total Spent', 'Last Booking', 'Created Date'],
      ...filteredClients.map(client => [
        client.id,
        client.first_name,
        client.last_name,
        client.email,
        client.phone || '',
        client.client_category || '',
        client.bookings_count?.toString() || '0',
        client.total_spent?.toString() || '0',
        client.last_booking ? new Date(client.last_booking).toLocaleDateString() : '',
        new Date(client.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getClientValue = (client: Client) => {
    if (!client.total_spent || client.total_spent === 0) return 'New';
    if (client.total_spent >= 1000) return 'High Value';
    if (client.total_spent >= 500) return 'Medium Value';
    return 'Low Value';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
          <p className="text-gray-600">Manage customer relationships and track client history</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
          <Plus className="h-4 w-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">VIP Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter(c => c.client_category === 'vip').length}
              </p>
            </div>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter(c => c.last_booking && 
                  new Date(c.last_booking) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg. Lifetime Value</p>
              <p className="text-2xl font-bold text-gray-900">
                €{Math.round(clients.reduce((sum, c) => sum + (c.total_spent || 0), 0) / clients.length || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-gold-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="last_name-asc">Name A-Z</option>
            <option value="total_spent-desc">Highest Value</option>
            <option value="bookings_count-desc">Most Bookings</option>
          </select>

          {/* Export */}
          <button
            onClick={exportData}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
          <div className="flex space-x-2">
            {categories.map(category => (
              <span
                key={category.id}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color}`}
              >
                {clients.filter(c => c.client_category === category.id).length} {category.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading clients...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bookings</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Spent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Booking</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const categoryInfo = getCategoryInfo(client.client_category || 'new');
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {client.first_name?.charAt(0)}{client.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {client.first_name} {client.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{getClientValue(client)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={client.client_category || 'new'}
                          onChange={(e) => updateClientCategory(client.id, e.target.value)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 ${categoryInfo.color}`}
                        >
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {client.bookings_count || 0} bookings
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        €{client.total_spent || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {client.last_booking 
                          ? new Date(client.last_booking).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowDetails(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300">
                            <Mail className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-300">
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {showDetails && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Client Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900">{selectedClient.first_name} {selectedClient.last_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{selectedClient.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{selectedClient.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryInfo(selectedClient.client_category || 'new').color}`}>
                        {getCategoryInfo(selectedClient.client_category || 'new').name}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Statistics</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Bookings</label>
                      <p className="text-gray-900">{selectedClient.bookings_count || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Spent</label>
                      <p className="text-gray-900">€{selectedClient.total_spent || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Booking</label>
                      <p className="text-gray-900">
                        {selectedClient.last_booking 
                          ? new Date(selectedClient.last_booking).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Since</label>
                      <p className="text-gray-900">{new Date(selectedClient.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Send Email
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsManagement;