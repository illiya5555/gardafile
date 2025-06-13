import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  folder: string;
  tags: string[];
  created_at: string;
  is_featured: boolean;
  alt_text?: string;
  description?: string;
}

interface MediaFolder {
  id: string;
  name: string;
  parent_id?: string;
  item_count: number;
  created_at: string;
}

const MediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchMediaItems();
    fetchFolders();
  }, []);

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual Supabase call
      const mockItems: MediaItem[] = [
        {
          id: '1',
          name: 'hero-image-1.jpg',
          url: '/IMG_0967.webp',
          type: 'image',
          size: 2048000,
          folder: 'hero-images',
          tags: ['hero', 'sailing', 'lake-garda'],
          created_at: '2024-01-15T10:30:00Z',
          is_featured: true,
          alt_text: 'Lake Garda sailing experience',
          description: 'Main hero image for homepage'
        },
        {
          id: '2',
          name: 'yacht-racing-1.jpg',
          url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg',
          type: 'image',
          size: 1536000,
          folder: 'racing-images',
          tags: ['racing', 'yacht', 'competition'],
          created_at: '2024-01-14T14:20:00Z',
          is_featured: false,
          alt_text: 'Yacht racing on Lake Garda',
          description: 'Racing action shot'
        },
        {
          id: '3',
          name: 'harbor-view.jpg',
          url: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg',
          type: 'image',
          size: 1792000,
          folder: 'location-images',
          tags: ['harbor', 'riva-del-garda', 'location'],
          created_at: '2024-01-13T09:15:00Z',
          is_featured: false,
          alt_text: 'Riva del Garda harbor',
          description: 'Beautiful harbor view'
        },
        {
          id: '4',
          name: 'sailing-instruction.mp4',
          url: 'https://example.com/sailing-video.mp4',
          type: 'video',
          size: 15728640,
          folder: 'videos',
          tags: ['instruction', 'sailing', 'tutorial'],
          created_at: '2024-01-12T16:45:00Z',
          is_featured: false,
          description: 'Sailing instruction video'
        }
      ];
      setMediaItems(mockItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const mockFolders: MediaFolder[] = [
        { id: 'hero-images', name: 'Hero Images', item_count: 5, created_at: '2024-01-01T00:00:00Z' },
        { id: 'racing-images', name: 'Racing Images', item_count: 12, created_at: '2024-01-01T00:00:00Z' },
        { id: 'location-images', name: 'Location Images', item_count: 8, created_at: '2024-01-01T00:00:00Z' },
        { id: 'testimonials', name: 'Testimonials', item_count: 6, created_at: '2024-01-01T00:00:00Z' },
        { id: 'videos', name: 'Videos', item_count: 3, created_at: '2024-01-01T00:00:00Z' },
        { id: 'documents', name: 'Documents', item_count: 4, created_at: '2024-01-01T00:00:00Z' }
      ];
      setFolders(mockFolders);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create new media item
      const newItem: MediaItem = {
        id: fileId,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        size: file.size,
        folder: selectedFolder === 'all' ? 'uploads' : selectedFolder,
        tags: [],
        created_at: new Date().toISOString(),
        is_featured: false,
        description: ''
      };

      setMediaItems(prev => [newItem, ...prev]);
      setUploadProgress(prev => {
        const { [fileId]: _, ...rest } = prev;
        return rest;
      });
    });

    await Promise.all(uploadPromises);
  };

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

  const deleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMediaItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesFolder && matchesType;
  });

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
            onClick={() => setShowFolderModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

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
              />
            </div>

            {/* Folder Filter */}
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
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
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Move className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {filteredItems.length} of {mediaItems.length} items
          </div>
          <div className="text-sm text-gray-600">
            Total size: {formatFileSize(mediaItems.reduce((sum, item) => sum + item.size, 0))}
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
          Supports: JPG, PNG, GIF, MP4, MOV, PDF, DOC (Max 10MB each)
        </p>
        <input
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
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
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(item.type)}
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
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open preview modal
                        }}
                        className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                        title="Preview"
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Featured Badge */}
                  {item.is_featured && (
                    <div className="absolute top-2 right-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                  )}
                  
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
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
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
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Preview</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Folder</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={item.alt_text || item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getFileIcon(item.type)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        {item.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getFileIcon(item.type)}
                        <span className="capitalize">{item.type}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{formatFileSize(item.size)}</td>
                    <td className="px-6 py-4 text-gray-900">{item.folder}</td>
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(item.url)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-300"
                          title="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                          title="Delete"
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
      </div>
    </div>
  );
};

export default MediaLibrary;