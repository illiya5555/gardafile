import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Users,
  Calendar,
  Ship,
  MessageSquare,
  Building,
  Star,
  Package,
  FileText,
  Settings,
  Activity,
  BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TableInfo {
  table_name: string;
  row_count: number;
  size_pretty: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
  is_foreign_key: boolean;
}

interface TableData {
  [key: string]: any;
}

const DatabaseManagement = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TableData | null>(null);
  const [newRecord, setNewRecord] = useState<TableData>({});
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Table configurations with icons and descriptions
  const tableConfigs: { [key: string]: { icon: React.ComponentType<any>; color: string; description: string } } = {
    profiles: { icon: Users, color: 'text-blue-600', description: 'User profiles and account information' },
    bookings: { icon: Calendar, color: 'text-green-600', description: 'Regular sailing experience bookings' },
    yacht_bookings: { icon: Ship, color: 'text-blue-600', description: 'Private yacht charter bookings' },
    yachts: { icon: Ship, color: 'text-blue-800', description: 'Fleet of available yachts' },
    time_slots: { icon: Calendar, color: 'text-purple-600', description: 'Available time slots for bookings' },
    testimonials: { icon: Star, color: 'text-yellow-600', description: 'Customer reviews and testimonials' },
    chat_messages: { icon: MessageSquare, color: 'text-green-600', description: 'Customer support chat messages' },
    corporate_packages: { icon: Package, color: 'text-orange-600', description: 'Corporate event packages' },
    corporate_inquiries: { icon: Building, color: 'text-red-600', description: 'Corporate event inquiries' },
    additional_services: { icon: Settings, color: 'text-gray-600', description: 'Additional services offered' }
  };

  useEffect(() => {
    checkConnection();
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
      fetchTableColumns();
    }
  }, [selectedTable, currentPage]);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Database connection error:', error);
      setConnectionStatus('disconnected');
    }
  };

  const fetchTables = async () => {
    try {
      setLoading(true);
      
      // Instead of using RPC, we'll query information_schema directly
      const { data: tableData, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .neq('table_type', 'VIEW');
      
      if (tableError) throw tableError;
      
      // Get row counts for each table
      const tablesWithInfo = await Promise.all(
        (tableData || []).map(async (table: any) => {
          try {
            const { count, error } = await supabase
              .from(table.table_name)
              .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            
            const config = tableConfigs[table.table_name] || { 
              icon: Table, 
              color: 'text-gray-600', 
              description: 'Database table' 
            };
            
            return {
              table_name: table.table_name,
              row_count: count || 0,
              size_pretty: 'N/A',
              description: config.description,
              icon: config.icon,
              color: config.color
            };
          } catch (error) {
            console.error(`Error fetching count for ${table.table_name}:`, error);
            const config = tableConfigs[table.table_name] || { 
              icon: Table, 
              color: 'text-gray-600', 
              description: 'Database table' 
            };
            
            return {
              table_name: table.table_name,
              row_count: 0,
              size_pretty: 'N/A',
              description: config.description,
              icon: config.icon,
              color: config.color
            };
          }
        })
      );
      
      setTables(tablesWithInfo);
    } catch (error) {
      console.error('Error fetching tables:', error);
      
      // Fallback to predefined table list
      const fallbackTables = [
        'profiles', 'bookings', 'yacht_bookings', 'yachts', 'time_slots',
        'testimonials', 'chat_messages', 'corporate_packages', 
        'corporate_inquiries', 'additional_services'
      ];
      
      const tablesWithInfo = await Promise.all(
        fallbackTables.map(async (tableName) => {
          try {
            const { count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });
            
            const config = tableConfigs[tableName] || { 
              icon: Table, 
              color: 'text-gray-600', 
              description: 'Database table' 
            };
            
            return {
              table_name: tableName,
              row_count: count || 0,
              size_pretty: 'N/A',
              description: config.description,
              icon: config.icon,
              color: config.color
            };
          } catch (error) {
            console.error(`Error fetching count for ${tableName}:`, error);
            const config = tableConfigs[tableName] || { 
              icon: Table, 
              color: 'text-gray-600', 
              description: 'Database table' 
            };
            
            return {
              table_name: tableName,
              row_count: 0,
              size_pretty: 'N/A',
              description: config.description,
              icon: config.icon,
              color: config.color
            };
          }
        })
      );
      
      setTables(tablesWithInfo);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async () => {
    if (!selectedTable) return;
    
    try {
      setDataLoading(true);
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTableData(data || []);
    } catch (error) {
      console.error('Error fetching table data:', error);
      setTableData([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchTableColumns = async () => {
    if (!selectedTable) return;
    
    try {
      // Query information_schema.columns for column information
      const { data: columnData, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', selectedTable);
      
      if (columnError) throw columnError;
      
      // Get primary key information
      const { data: pkData, error: pkError } = await supabase
        .from('information_schema.table_constraints')
        .select(`
          constraint_name,
          information_schema.key_column_usage!inner(column_name)
        `)
        .eq('table_schema', 'public')
        .eq('table_name', selectedTable)
        .eq('constraint_type', 'PRIMARY KEY');
      
      if (pkError) throw pkError;
      
      // Get foreign key information
      const { data: fkData, error: fkError } = await supabase
        .from('information_schema.table_constraints')
        .select(`
          constraint_name,
          information_schema.key_column_usage!inner(column_name)
        `)
        .eq('table_schema', 'public')
        .eq('table_name', selectedTable)
        .eq('constraint_type', 'FOREIGN KEY');
      
      if (fkError) throw fkError;
      
      // Process column information
      const primaryKeyColumns = pkData?.flatMap(pk => 
        pk.information_schema.key_column_usage.map((kcu: any) => kcu.column_name)
      ) || [];
      
      const foreignKeyColumns = fkData?.flatMap(fk => 
        fk.information_schema.key_column_usage.map((kcu: any) => kcu.column_name)
      ) || [];
      
      const columnInfo: ColumnInfo[] = (columnData || []).map(col => ({
        column_name: col.column_name,
        data_type: col.data_type,
        is_nullable: col.is_nullable,
        column_default: col.column_default,
        is_primary_key: primaryKeyColumns.includes(col.column_name),
        is_foreign_key: foreignKeyColumns.includes(col.column_name)
      }));
      
      setColumns(columnInfo);
    } catch (error) {
      console.error('Error fetching table columns:', error);
      
      // Fallback to sample data approach
      if (tableData.length > 0) {
        const record = tableData[0];
        const columnInfo: ColumnInfo[] = Object.keys(record).map(key => ({
          column_name: key,
          data_type: typeof record[key] === 'string' ? 'text' : 
                    typeof record[key] === 'number' ? 'numeric' :
                    typeof record[key] === 'boolean' ? 'boolean' :
                    record[key] instanceof Date ? 'timestamp' : 'text',
          is_nullable: 'YES',
          column_default: null,
          is_primary_key: key === 'id',
          is_foreign_key: key.endsWith('_id') && key !== 'id'
        }));
        
        setColumns(columnInfo);
      } else {
        setColumns([]);
      }
    }
  };

  const handleCreateRecord = async () => {
    if (!selectedTable) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      const { data, error } = await supabase
        .from(selectedTable)
        .insert(newRecord)
        .select();

      if (error) throw error;
      
      setShowCreateModal(false);
      setNewRecord({});
      fetchTableData();
      setActionSuccess('Record created successfully!');
    } catch (error: any) {
      console.error('Error creating record:', error);
      setActionError(`Error creating record: ${error.message}`);
    } finally {
      setActionLoading(false);
      
      // Clear success/error messages after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 3000);
    }
  };

  const handleUpdateRecord = async () => {
    if (!selectedTable || !editingRecord) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      const { error } = await supabase
        .from(selectedTable)
        .update(editingRecord)
        .eq('id', editingRecord.id);

      if (error) throw error;
      
      setShowEditModal(false);
      setEditingRecord(null);
      fetchTableData();
      setActionSuccess('Record updated successfully!');
    } catch (error: any) {
      console.error('Error updating record:', error);
      setActionError(`Error updating record: ${error.message}`);
    } finally {
      setActionLoading(false);
      
      // Clear success/error messages after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 3000);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!selectedTable || !confirm('Are you sure you want to delete this record?')) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchTableData();
      setActionSuccess('Record deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting record:', error);
      setActionError(`Error deleting record: ${error.message}`);
    } finally {
      setActionLoading(false);
      
      // Clear success/error messages after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 3000);
    }
  };

  const exportTableData = () => {
    if (!tableData.length) return;
    
    const csvContent = [
      Object.keys(tableData[0]).join(','),
      ...tableData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value}"` : value
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
    if (value instanceof Date) return value.toLocaleDateString();
    return String(value);
  };

  const getColumnType = (column: ColumnInfo) => {
    const typeColors = {
      text: 'bg-blue-100 text-blue-800',
      numeric: 'bg-green-100 text-green-800',
      boolean: 'bg-purple-100 text-purple-800',
      timestamp: 'bg-orange-100 text-orange-800'
    };
    
    return typeColors[column.data_type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 font-medium">Loading database information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
              <p className="text-gray-600">Manage your Supabase database tables and records</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                connectionStatus === 'disconnected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`} role="status" aria-live="polite">
                {connectionStatus === 'connected' ? <CheckCircle className="h-4 w-4" /> :
                 connectionStatus === 'disconnected' ? <AlertCircle className="h-4 w-4" /> :
                 <RefreshCw className="h-4 w-4 animate-spin" />}
                <span className="text-sm font-medium">
                  {connectionStatus === 'connected' ? 'Connected' :
                   connectionStatus === 'disconnected' ? 'Disconnected' :
                   'Checking...'}
                </span>
              </div>
              
              <button
                onClick={checkConnection}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                aria-label="Refresh connection status"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Feedback */}
        {(actionSuccess || actionError) && (
          <div className={`mb-6 p-4 rounded-lg ${
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

        {connectionStatus === 'disconnected' ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6" role="alert">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Database Connection Failed</h3>
                <p className="text-red-700 mt-1">
                  Unable to connect to the database. Please check your Supabase configuration and try again.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tables List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Database Tables</h2>
                <div className="space-y-2">
                  {tables.map((table) => {
                    const IconComponent = table.icon;
                    return (
                      <button
                        key={table.table_name}
                        onClick={() => setSelectedTable(table.table_name)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                          selectedTable === table.table_name
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                        aria-pressed={selectedTable === table.table_name}
                        aria-label={`Select ${table.table_name} table`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-5 w-5 ${table.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{table.table_name}</p>
                            <p className="text-sm text-gray-600">{table.row_count} rows</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Table Data */}
            <div className="lg:col-span-3">
              {selectedTable ? (
                <div className="space-y-6">
                  {/* Table Header */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedTable}</h2>
                        <p className="text-gray-600 mt-1">
                          {tables.find(t => t.table_name === selectedTable)?.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
                          aria-label="Add new record"
                          disabled={actionLoading}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Record</span>
                        </button>
                        <button
                          onClick={exportTableData}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                          aria-label="Export table data"
                          disabled={!tableData.length || actionLoading}
                        >
                          <Download className="h-4 w-4" />
                          <span>Export</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Table Schema */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Table Schema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {columns.map((column) => (
                        <div key={column.column_name} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{column.column_name}</span>
                            <div className="flex space-x-1">
                              {column.is_primary_key && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded" title="Primary Key">PK</span>
                              )}
                              {column.is_foreign_key && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded" title="Foreign Key">FK</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-block text-xs px-2 py-1 rounded ${getColumnType(column)}`}>
                              {column.data_type}
                            </span>
                            {column.is_nullable === 'NO' && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Table Data */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Table Data</h3>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search records..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              aria-label="Search records"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {dataLoading ? (
                      <div className="p-8 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Loading table data...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full" aria-label={`${selectedTable} table data`}>
                          <thead className="bg-gray-50">
                            <tr>
                              {columns.map((column) => (
                                <th key={column.column_name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                                  {column.column_name}
                                </th>
                              ))}
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {tableData.length === 0 ? (
                              <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-500">
                                  No records found
                                </td>
                              </tr>
                            ) : (
                              tableData.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  {columns.map((column) => (
                                    <td key={column.column_name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {formatValue(row[column.column_name])}
                                    </td>
                                  ))}
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => {
                                          setEditingRecord(row);
                                          setShowEditModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-900"
                                        aria-label={`Edit record ${row.id || index}`}
                                        disabled={actionLoading}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteRecord(row.id)}
                                        className="text-red-600 hover:text-red-900"
                                        aria-label={`Delete record ${row.id || index}`}
                                        disabled={actionLoading}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing page {currentPage} of table data
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            aria-label="Previous page"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={tableData.length < itemsPerPage}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            aria-label="Next page"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Table</h3>
                  <p className="text-gray-600">Choose a table from the left sidebar to view and manage its data.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Record Modal */}
        {showCreateModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-record-title"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 id="create-record-title" className="text-xl font-bold text-gray-900">Create New Record</h3>
              </div>
              <div className="p-6 space-y-4">
                {columns.filter(col => col.column_name !== 'id' && col.column_name !== 'created_at' && col.column_name !== 'updated_at').map((column) => (
                  <div key={column.column_name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`new-${column.column_name}`}>
                      {column.column_name} {column.is_nullable === 'NO' && <span className="text-red-500">*</span>}
                    </label>
                    {column.data_type === 'boolean' ? (
                      <input
                        type="checkbox"
                        id={`new-${column.column_name}`}
                        checked={!!newRecord[column.column_name]}
                        onChange={(e) => setNewRecord(prev => ({
                          ...prev,
                          [column.column_name]: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-required={column.is_nullable === 'NO'}
                      />
                    ) : (
                      <input
                        type={column.data_type === 'numeric' ? 'number' : 
                              column.data_type.includes('date') || column.data_type.includes('time') ? 'datetime-local' : 'text'}
                        id={`new-${column.column_name}`}
                        value={newRecord[column.column_name] || ''}
                        onChange={(e) => setNewRecord(prev => ({
                          ...prev,
                          [column.column_name]: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={column.is_nullable === 'NO'}
                        aria-required={column.is_nullable === 'NO'}
                      />
                    )}
                    {column.column_default && (
                      <p className="text-xs text-gray-500 mt-1">Default: {column.column_default}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRecord}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center space-x-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>Create Record</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Record Modal */}
        {showEditModal && editingRecord && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-record-title"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 id="edit-record-title" className="text-xl font-bold text-gray-900">Edit Record</h3>
              </div>
              <div className="p-6 space-y-4">
                {columns.filter(col => col.column_name !== 'created_at' && col.column_name !== 'updated_at').map((column) => (
                  <div key={column.column_name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`edit-${column.column_name}`}>
                      {column.column_name} {column.is_nullable === 'NO' && <span className="text-red-500">*</span>}
                    </label>
                    {column.data_type === 'boolean' ? (
                      <input
                        type="checkbox"
                        id={`edit-${column.column_name}`}
                        checked={!!editingRecord[column.column_name]}
                        onChange={(e) => setEditingRecord(prev => prev ? ({
                          ...prev,
                          [column.column_name]: e.target.checked
                        }) : null)}
                        disabled={column.column_name === 'id'}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                        aria-required={column.is_nullable === 'NO'}
                      />
                    ) : (
                      <input
                        type={column.data_type === 'numeric' ? 'number' : 
                              column.data_type.includes('date') || column.data_type.includes('time') ? 'datetime-local' : 'text'}
                        id={`edit-${column.column_name}`}
                        value={editingRecord[column.column_name] || ''}
                        onChange={(e) => setEditingRecord(prev => prev ? ({
                          ...prev,
                          [column.column_name]: e.target.value
                        }) : null)}
                        disabled={column.column_name === 'id'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        required={column.is_nullable === 'NO'}
                        aria-required={column.is_nullable === 'NO'}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRecord}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                  <span>Update Record</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManagement;