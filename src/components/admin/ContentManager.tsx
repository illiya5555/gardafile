import React, { useState, useEffect, useCallback } from 'react';
import { 
  Folder, 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Image, 
  FileText, 
  Video, 
  Trash2, 
  Edit, 
  Download, 
  Plus, 
  X, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Tag,
  Info,
  Copy,
  Eye,
  FolderPlus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  uploadFile, 
  getStorageItems, 
  getStorageCategories, 
  deleteStorageItem, 
  createStorageCategory,
  updateStorageItem,
  getStorageStats,
  StorageItem,
  StorageCategory,
  StorageItemWithUrl
} from '../../lib/storage';

const ContentManager = () => {
  const [items, setItems] = useState<StorageItemWithUrl[]>([]);
  const [categories, setCategories] = useState<StorageCategory[]>([]);
  const [selectedItem, setSelectedItem] = useState<StorageItemWithUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [dragOver, setDragOver] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [storageStats, setStorageStats] = useState<{
    totalSize: number;
    fileCount: number;
    bucketStats: { bucket: string; size: number; count: number }[];
  }>({ totalSize: 0, fileCount: 0, bucketStats: [] });
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedItemCategories, setSelectedItemCategories] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, selectedCategory, selectedType]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch storage items
      const { items, count } = await getStorageItems('content_storage', {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        search: searchTerm,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        mimeType: selectedType !== 'all' ? selectedType : undefined,
      });
      
      setItems(items);
      setTotalCount(count);
      
      // Fetch categories
      const categoriesData = await getStorageCategories();
      setCategories(categoriesData);
      
      // Fetch storage stats
      const stats = await getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      setActionError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, selectedType, itemsPerPage]);

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        // Set initial progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] || 0;
            if (currentProgress < 90) {
              return { ...prev, [fileId]: currentProgress + 10 };
            }
            return prev;
          });
        }, 500);
        
        // Upload the file
        const result = await uploadFile(file, {
          bucket: 'content_storage',
          categories: selectedItemCategories,
        });
        
        // Clear the interval and set progress to 100%
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const { [fileId]: _, ...rest } = prev;
            return rest;
          });
        }, 1000);
        
        return result;
      });
      
      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(Boolean).length;
      
      if (successCount > 0) {
        setActionSuccess(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`);
        setShowUploadModal(false);
        setSelectedFiles([]);
        setSelectedItemCategories([]);
        fetchData(); // Refresh the list
      } else {
        setActionError('Failed to upload files. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setActionError('Error uploading files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      setUploading(true);
      setActionError(null);
      setActionSuccess(null);
      
      const result = await createStorageCategory(
        newCategoryName.trim(),
        newCategoryDescription.trim() || undefined
      );
      
      if (result) {
        setActionSuccess(`Category "${newCategoryName}" created successfully`);
        setShowCategoryModal(false);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setCategories([...categories, result]);
      } else {
        setActionError('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setActionError('Error creating category: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionError(null);
      setActionSuccess(null);
      
      const success = await deleteStorageItem(id);
      
      if (success) {
        setActionSuccess('Item deleted successfully');
        setItems(items.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
          setShowDetailsModal(false);
        }
      } else {
        setActionError('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setActionError('Error deleting item: ' + error.message);
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    
    try {
      setUploading(true);
      setActionError(null);
      setActionSuccess(null);
      
      const updates: {
        name?: string;
        categories?: string[];
      } = {};
      
      if (editName && editName !== selectedItem.name) {
        updates.name = editName;
      }
      
      if (selectedItemCategories) {
        updates.categories = selectedItemCategories;
      }
      
      const updatedItem = await updateStorageItem(selectedItem.id, updates);
      
      if (updatedItem) {
        setActionSuccess('Item updated successfully');
        setSelectedItem(updatedItem);
        setEditMode(false);
        
        // Update the item in the list
        setItems(items.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ));
      } else {
        setActionError('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setActionError('Error updating item: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
      setShowUploadModal(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setActionSuccess('URL copied to clipboard');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setActionSuccess(null);
    }, 3000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('application/pdf')) return 'PDF';
    if (mimeType.startsWith('application/msword') || 
        mimeType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      return 'Word';
    }
    if (mimeType.startsWith('application/vnd.ms-excel') || 
        mimeType.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      return 'Excel';
    }
    if (mimeType.startsWith('text/')) return 'Text';
    return 'File';
  };

  const handleViewItem = (item: StorageItemWithUrl) => {
    setSelectedItem(item);
    setEditName(item.name);
    setSelectedItemCategories(item.categories?.map(c => c.id) || []);
    setShowDetailsModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Manager</h2>
          <p className="text-gray-600">Manage images, videos, and documents in Supabase Storage</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
            aria-label="Create new category"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Category</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            aria-label="Upload files"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-card">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Files</h3>
          <p className="text-2xl font-bold text-gray-900">{storageStats.fileCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-card">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Storage Used</h3>
          <p className="text-2xl font-bold text-gray-900">{formatFileSize(storageStats.totalSize)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-card">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Categories</h3>
          <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-card">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Buckets</h3>
          <p className="text-2xl font-bold text-gray-900">{storageStats.bucketStats.length}</p>
        </div>
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

      {/* Filters and Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-card">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search files"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by file type"
            >
              <option value="all">All Types</option>
              <option value="image/">Images</option>
              <option value="video/">Videos</option>
              <option value="application/pdf">PDFs</option>
              <option value="application/msword">Documents</option>
              <option value="text/">Text Files</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1" role="radiogroup" aria-label="View mode">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
                role="radio"
                aria-checked={viewMode === 'grid'}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
                role="radio"
                aria-checked={viewMode === 'list'}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {totalCount > 0 ? (
              <>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} items</>
            ) : (
              <>No items found</>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {storageStats.bucketStats.map(bucket => (
              <span key={bucket.bucket} className="ml-2">
                {bucket.bucket}: {formatFileSize(bucket.size)} ({bucket.count} files)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-gray-600 mb-4">
          Supports: JPG, PNG, GIF, MP4, MOV, PDF, DOC, XLSX, CSV (Max 50MB each)
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-300"
        >
          <Plus className="h-4 w-4" />
          <span>Choose Files</span>
        </label>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploading Files</h3>
          <div className="space-y-3">
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 min-w-[3rem]">{progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Grid/List */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading content...</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-500">Upload files or adjust your search filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square cursor-pointer transition-all duration-300 hover:shadow-lg"
                    onClick={() => handleViewItem(item)}
                  >
                    {item.mime_type.startsWith('image/') ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(item.mime_type)}
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(item.url);
                          }}
                          className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                          title="Copy URL"
                          aria-label="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.url, '_blank');
                          }}
                          className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                          title="Preview"
                          aria-label="Preview file"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-300"
                          title="Delete"
                          aria-label="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* File Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-white text-xs truncate">{item.name}</p>
                      <p className="text-white/80 text-xs">{formatFileSize(item.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Content items">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No files found. Upload files or adjust your search filters.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg overflow-hidden">
                            {item.mime_type.startsWith('image/') ? (
                              <img
                                src={item.url}
                                alt={item.name}
                                className="h-10 w-10 object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center">
                                {getFileIcon(item.mime_type)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.path}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getFileTypeLabel(item.mime_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(item.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {item.categories && item.categories.length > 0 ? (
                            item.categories.map(category => (
                              <span key={category.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {category.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">No categories</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(item.url)}
                            className="text-blue-600 hover:text-blue-900"
                            aria-label="Copy URL"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewItem(item)}
                            className="text-green-600 hover:text-green-900"
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                            aria-label="Delete file"
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
        {totalCount > itemsPerPage && (
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage * itemsPerPage >= totalCount}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    &laquo;
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, Math.ceil(totalCount / itemsPerPage)) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * itemsPerPage >= totalCount}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 id="upload-modal-title" className="text-xl font-bold text-gray-900">Upload Files</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Selected Files</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedFiles.length === 0 ? (
                    <p className="text-gray-500">No files selected</p>
                  ) : (
                    selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {file.type.startsWith('image/') ? (
                            <Image className="h-5 w-5 text-blue-500 mr-2" />
                          ) : file.type.startsWith('video/') ? (
                            <Video className="h-5 w-5 text-purple-500 mr-2" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-500 mr-2" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                          }}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Categories</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={selectedItemCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItemCategories([...selectedItemCategories, category.id]);
                          } else {
                            setSelectedItemCategories(selectedItemCategories.filter(id => id !== category.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-900">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFileUpload}
                    disabled={selectedFiles.length === 0 || uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 id="category-modal-title" className="text-xl font-bold text-gray-900">Create Category</h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="category-description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>Create Category</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {showDetailsModal && selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 id="details-modal-title" className="text-xl font-bold text-gray-900">File Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setEditMode(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview */}
                <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '300px' }}>
                  {selectedItem.mime_type.startsWith('image/') ? (
                    <img
                      src={selectedItem.url}
                      alt={selectedItem.name}
                      className="max-w-full max-h-[300px] object-contain"
                    />
                  ) : selectedItem.mime_type.startsWith('video/') ? (
                    <video
                      src={selectedItem.url}
                      controls
                      className="max-w-full max-h-[300px]"
                    />
                  ) : (
                    <div className="text-center p-6">
                      {getFileIcon(selectedItem.mime_type)}
                      <p className="mt-2 text-gray-500">Preview not available</p>
                      <a
                        href={selectedItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download File
                      </a>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File Name
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-gray-900">{selectedItem.name}</p>
                          <button
                            onClick={() => setEditMode(true)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="Edit file name"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File URL
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={selectedItem.url}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                        <button
                          onClick={() => copyToClipboard(selectedItem.url)}
                          className="ml-2 p-2 text-blue-600 hover:text-blue-800"
                          aria-label="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Type
                        </label>
                        <p className="text-gray-900">{selectedItem.mime_type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Size
                        </label>
                        <p className="text-gray-900">{formatFileSize(selectedItem.size)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Created
                        </label>
                        <p className="text-gray-900">{new Date(selectedItem.created_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Updated
                        </label>
                        <p className="text-gray-900">{new Date(selectedItem.updated_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categories
                      </label>
                      {editMode ? (
                        <div className="grid grid-cols-2 gap-2 border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                          {categories.map(category => (
                            <div key={category.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`edit-category-${category.id}`}
                                checked={selectedItemCategories.includes(category.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItemCategories([...selectedItemCategories, category.id]);
                                  } else {
                                    setSelectedItemCategories(selectedItemCategories.filter(id => id !== category.id));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`edit-category-${category.id}`} className="ml-2 text-sm text-gray-900">
                                {category.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {selectedItem.categories && selectedItem.categories.length > 0 ? (
                            selectedItem.categories.map(category => (
                              <span key={category.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {category.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No categories assigned</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 flex justify-end space-x-4">
                    {editMode ? (
                      <>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setEditName(selectedItem.name);
                            setSelectedItemCategories(selectedItem.categories?.map(c => c.id) || []);
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateItem}
                          disabled={uploading}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {uploading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          <span>Save Changes</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowDetailsModal(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => setEditMode(true)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(selectedItem.id)}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center space-x-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;