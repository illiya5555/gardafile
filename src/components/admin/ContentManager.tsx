import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image, 
  Video, 
  Trash2, 
  Download, 
  Copy, 
  Search, 
  Filter,
  Grid3X3,
  List,
  Eye,
  Edit,
  Plus,
  Folder,
  FolderPlus,
  Move,
  Star,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
  Save,
  Tag,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ContentMigrationTool from './ContentMigrationTool';
import { 
  uploadFile, 
  getStorageItems, 
  getStorageCategories, 
  createStorageCategory, 
  deleteStorageItem,
  updateStorageItem,
  getStorageStats,
  StorageItemWithUrl,
  StorageCategory
} from '../../lib/storage';

const ContentManager = () => {
  // State for media items and UI
  const [mediaItems, setMediaItems] = useState<StorageItemWithUrl[]>([]);
  const [categories, setCategories] = useState<StorageCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMigrationTool, setShowMigrationTool] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StorageItemWithUrl | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [storageStats, setStorageStats] = useState<{
    totalSize: number;
    fileCount: number;
    bucketStats: { bucket: string; size: number; count: number }[];
  } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedCategories, setEditedCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchMediaItems();
    fetchCategories();
    fetchStorageStats();
  }, [currentPage, selectedCategory, selectedType, searchTerm]);

  // Fetch media items from Supabase
  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      
      const options: any = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        search: searchTerm,
      };
      
      if (selectedCategory !== 'all') {
        options.categoryId = selectedCategory;
      }
      
      if (selectedType !== 'all') {
        options.mimeType = selectedType;
      }
      
      const { items, count } = await getStorageItems('content_storage', options);
      
      setMediaItems(items);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching media items:', error);
      setActionError('Failed to load media items. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      const categories = await getStorageCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch storage statistics
  const fetchStorageStats = async () => {
    try {
      const stats = await getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error fetching storage stats:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // Create a progress handler
        const onProgress = (progress: number) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        };
        
        // Upload the file
        const result = await uploadFile(file, {
          bucket: 'content_storage',
          path: selectedCategory !== 'all' ? selectedCategory : undefined,
          categories: selectedCategory !== 'all' ? [selectedCategory] : [],
          onProgress,
        });
        
        if (result) {
          // Add the new item to the list
          setMediaItems(prev => [result, ...prev]);
          setActionSuccess(`Uploaded ${file.name} successfully`);
        } else {
          setActionError(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setActionError(`Error uploading ${file.name}: ${error.message}`);
      } finally {
        // Remove progress indicator
        setUploadProgress(prev => {
          const { [fileId]: _, ...rest } = prev;
          return rest;
        });
      }
    });

    await Promise.all(uploadPromises);
    
    // Refresh the list after all uploads are complete
    fetchMediaItems();
    fetchStorageStats();
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
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

  // Delete an item
  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      const success = await deleteStorageItem(itemId);
      
      if (success) {
        setMediaItems(prev => prev.filter(item => item.id !== itemId));
        setSelectedItems(prev => prev.filter(id => id !== itemId));
        setActionSuccess('Item deleted successfully');
        
        // If the deleted item was selected, close the details modal
        if (selectedItem && selectedItem.id === itemId) {
          setShowDetailsModal(false);
          setSelectedItem(null);
        }
        
        // Refresh storage stats
        fetchStorageStats();
      } else {
        setActionError('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setActionError(`Error deleting item: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete multiple items
  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`)) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const itemId of selectedItems) {
        const success = await deleteStorageItem(itemId);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
      
      if (errorCount === 0) {
        setActionSuccess(`Deleted ${successCount} items successfully`);
      } else {
        setActionError(`Deleted ${successCount} items, but failed to delete ${errorCount} items`);
      }
      
      // Refresh the list
      fetchMediaItems();
      fetchStorageStats();
      
      // Clear selection
      setSelectedItems([]);
    } catch (error) {
      console.error('Error deleting items:', error);
      setActionError(`Error deleting items: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setActionSuccess('URL copied to clipboard');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setActionSuccess(null);
    }, 3000);
  };

  // Create a new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setActionError('Category name is required');
      return;
    }
    
    setActionLoading(true);
    
    try {
      const category = await createStorageCategory(
        newCategoryName.trim(),
        newCategoryDescription.trim() || undefined
      );
      
      if (category) {
        setCategories(prev => [...prev, category]);
        setActionSuccess(`Category "${newCategoryName}" created successfully`);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowCategoryModal(false);
      } else {
        setActionError('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setActionError(`Error creating category: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Update item details
  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    
    setActionLoading(true);
    
    try {
      const updatedItem = await updateStorageItem(selectedItem.id, {
        name: editedName,
        categories: editedCategories
      });
      
      if (updatedItem) {
        // Update the item in the list
        setMediaItems(prev => prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ));
        
        setSelectedItem(updatedItem);
        setActionSuccess('Item updated successfully');
        setEditMode(false);
      } else {
        setActionError('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setActionError(`Error updating item: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (mimeType.startsWith('video/')) {
      return <Video className="h-5 w-5" />;
    } else if (mimeType.startsWith('application/pdf')) {
      return <FileText className="h-5 w-5" />;
    } else {
      return <FileText className="h-5 w-5" />;
    }
  };

  // Filter media items based on search and filters
  const filteredItems = mediaItems;

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
          <p className="text-gray-600">Manage images, videos, and documents</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowMigrationTool(!showMigrationTool)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
            aria-label={showMigrationTool ? "Hide migration tool" : "Show migration tool"}
          >
            <Move className="h-4 w-4" />
            <span>{showMigrationTool ? "Hide Migration Tool" : "Migration Tool"}</span>
          </button>
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

      {/* Migration Tool */}
      {showMigrationTool && (
        <ContentMigrationTool />
      )}

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

      {/* Storage Stats */}
      {storageStats && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Storage Usage</h3>
            <span className="text-xs text-gray-500">{formatFileSize(storageStats.totalSize)} used</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min((storageStats.totalSize / (50 * 1024 * 1024)) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>{storageStats.fileCount} files</span>
            <span>{Math.round((storageStats.totalSize / (50 * 1024 * 1024)) * 100)}% of 50MB</span>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search media"
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
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="application">Documents</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                <button 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                  onClick={deleteSelectedItems}
                  disabled={actionLoading}
                  aria-label={`Delete ${selectedItems.length} selected items`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {filteredItems.length} of {totalCount} items
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
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
        role="button"
        tabIndex={0}
        aria-label="Drop files here to upload"
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-gray-600 mb-4">
          Supports: JPG, PNG, GIF, MP4, MOV, PDF, DOC (Max 10MB each)
        </p>
        <input
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          id="file-upload"
          ref={fileInputRef}
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploading Files</h3>
          <div className="space-y-3">
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading media library...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No media found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload some files to get started'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`group relative bg-gray-100 rounded-lg overflow-hidden aspect-square cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => toggleItemSelection(item.id)}
                  onDoubleClick={() => {
                    setSelectedItem(item);
                    setEditedName(item.name);
                    setEditedCategories(item.categories?.map(c => c.id) || []);
                    setShowDetailsModal(true);
                  }}
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
                          setSelectedItem(item);
                          setEditedName(item.name);
                          setEditedCategories(item.categories?.map(c => c.id) || []);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                        title="View Details"
                        aria-label="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(item.id);
                        }}
                        className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-300"
                        title="Delete"
                        aria-label="Delete item"
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
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Media items">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredItems.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label="Select all items"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Preview</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Size</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Categories</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select ${item.name}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
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
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 truncate max-w-xs">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getFileIcon(item.mime_type)}
                        <span className="capitalize">{item.mime_type.split('/')[0]}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{formatFileSize(item.size)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.categories && item.categories.length > 0 ? (
                          item.categories.map(category => (
                            <span 
                              key={category.id} 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {category.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">No categories</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(item.url)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                          title="Copy URL"
                          aria-label={`Copy URL for ${item.name}`}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setEditedName(item.name);
                            setEditedCategories(item.categories?.map(c => c.id) || []);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                          title="View Details"
                          aria-label={`View details for ${item.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                          title="Delete"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-category-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 id="create-category-title" className="text-xl font-bold text-gray-900">Create New Category</h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category-name">
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
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category-description">
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
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || actionLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {actionLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>Create Category</span>
              </button>
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
          aria-labelledby="item-details-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 id="item-details-title" className="text-xl font-bold text-gray-900">
                  {editMode ? 'Edit Item' : 'Item Details'}
                </h3>
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
                <div>
                  <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 h-64 flex items-center justify-center">
                    {selectedItem.mime_type.startsWith('image/') ? (
                      <img
                        src={selectedItem.url}
                        alt={selectedItem.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : selectedItem.mime_type.startsWith('video/') ? (
                      <video
                        src={selectedItem.url}
                        controls
                        className="max-w-full max-h-full"
                      />
                    ) : (
                      <div className="text-center p-6">
                        {getFileIcon(selectedItem.mime_type)}
                        <p className="mt-2 text-gray-600">{selectedItem.mime_type}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => copyToClipboard(selectedItem.url)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy URL</span>
                    </button>
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                {/* Details */}
                <div>
                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-name">
                          File Name
                        </label>
                        <input
                          type="text"
                          id="edit-name"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categories
                        </label>
                        <div className="space-y-2">
                          {categories.map(category => (
                            <div key={category.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`category-${category.id}`}
                                checked={editedCategories.includes(category.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditedCategories(prev => [...prev, category.id]);
                                  } else {
                                    setEditedCategories(prev => prev.filter(id => id !== category.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                              />
                              <label htmlFor={`category-${category.id}`} className="text-gray-700">
                                {category.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-4 mt-6">
                        <button
                          onClick={() => setEditMode(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateItem}
                          disabled={actionLoading}
                          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Name
                        </label>
                        <p className="text-gray-900">{selectedItem.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Type
                        </label>
                        <p className="text-gray-900">{selectedItem.mime_type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Size
                        </label>
                        <p className="text-gray-900">{formatFileSize(selectedItem.size)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL
                        </label>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={selectedItem.url}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                          />
                          <button
                            onClick={() => copyToClipboard(selectedItem.url)}
                            className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                            aria-label="Copy URL"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categories
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.categories && selectedItem.categories.length > 0 ? (
                            selectedItem.categories.map(category => (
                              <span 
                                key={category.id} 
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {category.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No categories assigned</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Created
                        </label>
                        <p className="text-gray-900">{new Date(selectedItem.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex justify-end space-x-4 mt-6">
                        <button
                          onClick={() => setEditMode(true)}
                          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => deleteItem(selectedItem.id)}
                          disabled={actionLoading}
                          className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
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