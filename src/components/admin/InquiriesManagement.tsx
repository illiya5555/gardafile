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
  ArrowUpDown,
  X
} from 'lucide-react';
import { supabase, CorporateInquiry } from '../../lib/supabase';

interface NewInquiryData {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  participants_count: string;
  preferred_date?: string;
  message?: string;
  package_id?: string;
  status: string;
}

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
  const [showAddInquiryModal, setShowAddInquiryModal] = useState(false);
  const [newInquiryData, setNewInquiryData] = useState<NewInquiryData>({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    participants_count: '',
    preferred_date: '',
    message: '',
    status: 'pending'
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [packages, setPackages] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetchInquiries();
    fetchPackages();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('corporate_inquiries')
        .select(`
          *,
          corporate_packages(name)
        `)
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

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('corporate_packages')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      // Fallback data
      setPackages([
        { id: '1', name: 'Team Spirit' },
        { id: '2', name: 'Corporate Challenge' },
        { id: '3', name: 'Executive Regatta' }
      ]);
    }
  };

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      const { error } = await supabase
        .from('corporate_inquiries')
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
      
      setActionSuccess(`Inquiry status updated to ${newStatus}`);
      
      // If we're updating the currently selected inquiry, update that too
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry({
          ...selectedInquiry,
          status: newStatus as any
        });
      }
    } catch (error: any) {
      console.error('Error updating inquiry status:', error);
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

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      const { error } = await supabase
        .from('corporate_inquiries')
        .delete()
        .eq('id', inquiryId);

      if (error) throw error;
      
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== inquiryId));
      setActionSuccess('Inquiry deleted successfully');
      
      // If we deleted the currently selected inquiry, close the details modal
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setShowDetails(false);
      }
    } catch (error: any) {
      console.error('Error deleting inquiry:', error);
      setActionError(`Error deleting inquiry: ${error.message}`);
    } finally {
      setActionLoading(false);
      
      // Clear success/error messages after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 3000);
    }
  };

  const handleAddInquiry = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newInquiryData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Validate participants count
      const participantsCount = parseInt(newInquiryData.participants_count);
      if (isNaN(participantsCount) || participantsCount <= 0) {
        throw new Error('Please enter a valid number of participants');
      }
      
      const { error } = await supabase
        .from('corporate_inquiries')
        .insert({
          package_id: newInquiryData.package_id,
          company_name: newInquiryData.company_name,
          contact_person: newInquiryData.contact_person,
          email: newInquiryData.email,
          phone: newInquiryData.phone,
          participants_count: participantsCount,
          preferred_date: newInquiryData.preferred_date || null,
          message: newInquiryData.message || null,
          status: newInquiryData.status
        });

      if (error) throw error;
      
      setActionSuccess('Inquiry added successfully!');
      setShowAddInquiryModal(false);
      
      // Reset form
      setNewInquiryData({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        participants_count: '',
        preferred_date: '',
        message: '',
        status: 'pending'
      });
      
      // Refresh inquiries
      fetchInquiries();
      
    } catch (error: any) {
      console.error('Error adding inquiry:', error);
      setActionError(`Error adding inquiry: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const sendEmailToInquiry = async (email: string) => {
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      // This would be implemented with a Supabase Edge Function
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setActionSuccess(`Email sent to ${email}`);
    } catch (error: any) {
      console.error('Error sending email:', error);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInquiryData(prev => ({
      ...prev,
      [name]: value
    }));
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
        <button 
          onClick={() => setShowAddInquiryModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          aria-label="Add new inquiry"
        >
          <Plus className="h-4 w-4" />
          <span>New Inquiry</span>
        </button>
      </div>

      {/* Action Feedback */}
      {(actionSuccess || actionError) && (
        <div className={`p-4 rounded-lg ${
          actionSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`} role="alert" aria-live="assertive">
          <div className="flex items-center space-x-2">
            {actionSuccess ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={actionSuccess ? 'text-green-800' : 'text-red-800'}>
              {actionSuccess || actionError}
            </span>
          </div>
        </div>
      )}

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
              aria-label="Search inquiries"
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
            aria-label="Filter by date"
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
            aria-label="Sort inquiries"
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
            aria-label="Export inquiries as CSV"
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
            <table className="w-full" aria-label="Corporate inquiries">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900" scope="col">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900" scope="col">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900" scope="col">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900" scope="col">Participants</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900" scope="col">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900" scope="col">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No inquiries found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry) => {
                    const priorityScore = getPriorityScore(inquiry);
                    return (
                      <tr key={inquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              priorityScore >= 6 ? 'bg-red-500' :
                              priorityScore >= 4 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`} aria-hidden="true"></div>
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
                            aria-label={`Change status for ${inquiry.company_name}`}
                            disabled={actionLoading}
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
                              aria-label={`View details for ${inquiry.company_name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                              onClick={() => sendEmailToInquiry(inquiry.email)}
                              aria-label={`Send email to ${inquiry.company_name}`}
                              disabled={actionLoading}
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                              onClick={() => handleDeleteInquiry(inquiry.id)}
                              aria-label={`Delete inquiry from ${inquiry.company_name}`}
                              disabled={actionLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Details Modal */}
      {showDetails && selectedInquiry && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-details-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 id="inquiry-details-title" className="text-xl font-bold text-gray-900">Inquiry Details</h3>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                  <p className="text-gray-900">
                    {selectedInquiry.corporate_packages?.name || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => updateInquiryStatus(selectedInquiry.id, e.target.value)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(selectedInquiry.status)}`}
                    aria-label="Change inquiry status"
                    disabled={actionLoading}
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              {selectedInquiry.message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedInquiry.message}</p>
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
                      <AlertCircle className="h-5 w-5 text-red-600" />
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
                  onClick={() => sendEmailToInquiry(selectedInquiry.email)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  <span>Send Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Inquiry Modal */}
      {showAddInquiryModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-inquiry-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 id="add-inquiry-title" className="text-xl font-bold text-gray-900">Add New Inquiry</h3>
                <button
                  onClick={() => setShowAddInquiryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {actionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{actionError}</p>
                  </div>
                </div>
              )}
              
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="company_name">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={newInquiryData.company_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="contact_person">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      id="contact_person"
                      name="contact_person"
                      value={newInquiryData.contact_person}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="email">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newInquiryData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="phone">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={newInquiryData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="participants_count">
                      Participants Count *
                    </label>
                    <input
                      type="number"
                      id="participants_count"
                      name="participants_count"
                      value={newInquiryData.participants_count}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="preferred_date">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      id="preferred_date"
                      name="preferred_date"
                      value={newInquiryData.preferred_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                      aria-required="false"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="package_id">
                      Package
                    </label>
                    <select
                      id="package_id"
                      name="package_id"
                      value={newInquiryData.package_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-required="false"
                    >
                      <option value="">Select a package</option>
                      {packages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="status">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={newInquiryData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      aria-required="true"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="quoted">Quoted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={newInquiryData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional details about the inquiry..."
                    aria-required="false"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowAddInquiryModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInquiry}
                disabled={actionLoading || !newInquiryData.company_name || !newInquiryData.contact_person || !newInquiryData.email || !newInquiryData.phone || !newInquiryData.participants_count}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {actionLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>Add Inquiry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiriesManagement;