import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Building,
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { supabase, CorporateInquiry } from '../../lib/supabase';

const InquiriesManagement = () => {
  const [inquiries, setInquiries] = useState<CorporateInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedInquiry, setSelectedInquiry] = useState<CorporateInquiry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, corporate_packages:package_id(name)')
        .eq('type', 'corporate')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      // Fallback data for demo
      setInquiries([
        {
          id: '1',
          package_id: '1',
          company_name: 'TechCorp Solutions',
          contact_person: 'John Smith',
          email: 'john@techcorp.com',
          phone: '+1 555 123 4567',
          participants_count: 25,
          preferred_date: '2024-07-15',
          message: 'Looking for team building event for our quarterly meeting',
          status: 'pending',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          package_id: '2',
          company_name: 'Digital Marketing Inc',
          contact_person: 'Sarah Johnson',
          email: 'sarah@digitalmarketing.com',
          phone: '+1 555 987 6543',
          participants_count: 40,
          preferred_date: '2024-08-20',
          message: 'Corporate retreat for our sales team',
          status: 'contacted',
          created_at: '2024-01-14T14:20:00Z'
        },
        {
          id: '3',
          package_id: '3',
          company_name: 'Global Consulting',
          contact_person: 'Michael Brown',
          email: 'michael@globalconsulting.com',
          phone: '+1 555 456 7890',
          participants_count: 60,
          preferred_date: '2024-09-10',
          message: 'Executive team building event',
          status: 'quoted',
          created_at: '2024-01-13T09:15:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', inquiryId);

      if (error) throw error;

      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === inquiryId 
            ? { ...inquiry, status: newStatus as any }
            : inquiry
        )
      );
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      alert('Error updating status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'contacted': return <Mail className="h-4 w-4" />;
      case 'quoted': return <AlertCircle className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityScore = (inquiry: CorporateInquiry) => {
    let score = 0;
    
    // Recent inquiries get higher priority
    const daysSinceCreated = Math.floor((Date.now() - new Date(inquiry.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated <= 1) score += 3;
    else if (daysSinceCreated <= 3) score += 2;
    else if (daysSinceCreated <= 7) score += 1;
    
    // Larger groups get higher priority
    if (inquiry.participants_count >= 50) score += 3;
    else if (inquiry.participants_count >= 25) score += 2;
    else if (inquiry.participants_count >= 12) score += 1;
    
    // Status-based priority
    if (inquiry.status === 'pending') score += 3;
    else if (inquiry.status === 'contacted') score += 2;
    else if (inquiry.status === 'quoted') score += 1;
    
    return score;
  };

  const filteredInquiries = inquiries
    .filter(inquiry => {
      const matchesSearch = 
        inquiry.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
      
      const matchesDate = dateFilter === 'all' || (() => {
        const inquiryDate = new Date(inquiry.created_at);
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            return inquiryDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return inquiryDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return inquiryDate >= monthAgo;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return sortOrder === 'desc' 
          ? getPriorityScore(b) - getPriorityScore(a)
          : getPriorityScore(a) - getPriorityScore(b);
      }
      
      const aValue = a[sortBy as keyof CorporateInquiry];
      const bValue = b[sortBy as keyof CorporateInquiry];
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue < bValue ? -1 : 1;
      }
    });

  const exportData = () => {
    const csvContent = [
      ['ID', 'Company', 'Contact Person', 'Email', 'Phone', 'Participants', 'Status', 'Created Date'],
      ...filteredInquiries.map(inquiry => [
        inquiry.id,
        inquiry.company_name,
        inquiry.contact_person,
        inquiry.email,
        inquiry.phone,
        inquiry.participants_count.toString(),
        inquiry.status,
        new Date(inquiry.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corporate_inquiries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Corporate Inquiries</h2>
          <p className="text-gray-600">Manage and track corporate event requests</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
          <Plus className="h-4 w-4" />
          <span>New Inquiry</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
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
            <option value="priority-desc">Priority (High to Low)</option>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="company_name-asc">Company A-Z</option>
            <option value="participants_count-desc">Most Participants</option>
          </select>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {filteredInquiries.length} of {inquiries.length} inquiries
          </div>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading inquiries...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Participants</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => {
                  const priorityScore = getPriorityScore(inquiry);
                  return (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            priorityScore >= 6 ? 'bg-red-500' :
                            priorityScore >= 4 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></div>
                          <span className="text-sm font-medium">
                            {priorityScore >= 6 ? 'High' :
                             priorityScore >= 4 ? 'Medium' :
                             'Low'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{inquiry.company_name}</p>
                          <p className="text-sm text-gray-600">{inquiry.contact_person}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{inquiry.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{inquiry.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {inquiry.participants_count} people
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={inquiry.status}
                          onChange={(e) => updateInquiryStatus(inquiry.id, e.target.value)}
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(inquiry.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="quoted">Quoted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setShowDetails(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300">
                            <Mail className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300">
                            <Trash2 className="h-4 w-4" />
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

      {/* Inquiry Details Modal */}
      {showDetails && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Inquiry Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <p className="text-gray-900">{selectedInquiry.company_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <p className="text-gray-900">{selectedInquiry.contact_person}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedInquiry.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedInquiry.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                  <p className="text-gray-900">{selectedInquiry.participants_count} people</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <p className="text-gray-900">
                    {selectedInquiry.preferred_date 
                      ? new Date(selectedInquiry.preferred_date).toLocaleDateString()
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
              
              {selectedInquiry.message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedInquiry.message}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiriesManagement;