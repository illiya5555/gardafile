import React, { useState, useEffect } from 'react';
import { Edit, Save, Image, Trash2, Plus, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ContentManager from './ContentManager';
import { updateContentReference } from '../../utils/contentHelpers';
import { getStorageItemById, StorageItemWithUrl } from '../../lib/storage';

const HomeContentEditor = () => {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [currentField, setCurrentField] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Example of how to use the content manager to select an image
  const handleSelectMedia = (field: string) => {
    setCurrentField(field);
    setShowMediaLibrary(true);
  };
  
  const handleMediaSelected = async (item: StorageItemWithUrl) => {
    setShowMediaLibrary(false);
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Example of updating a content reference
      // In a real implementation, you would update your content table
      // This is just a placeholder example
      const updated = await updateContentReference(
        item,
        'homepage_content', // table name
        'hero_image_url', // column name
        '1' // record id
      );
      
      if (updated) {
        setSuccess(`Updated ${currentField} with ${item.name}`);
      } else {
        setError(`Failed to update ${currentField}`);
      }
    } catch (err) {
      console.error('Error updating content:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      
      // Clear messages after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {showMediaLibrary ? (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Media for {currentField}</h2>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            
            <ContentManager />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Home Page Editor</h2>
            
            {/* Feedback messages */}
            {(success || error) && (
              <div className={`p-4 mb-6 rounded-lg ${
                success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={success ? 'text-green-800' : 'text-red-800'}>
                    {success || error}
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h3>
                
                <div className="space-y-4">
                  {/* Hero Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Background Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src="/IMG_0967.webp"
                          alt="Hero background"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleSelectMedia('heroBackground')}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                      >
                        <Image className="h-4 w-4" />
                        <span>Change Image</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Hero Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value="Experience the Thrill of Yacht Racing"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Hero Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Subtitle
                    </label>
                    <textarea
                      rows={3}
                      value="Daily yacht racing experiences in world-famous Lake Garda with professional skippers, racing medals, and unforgettable memories"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Features Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Features Section</h3>
                  <button className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                    <Plus className="h-4 w-4" />
                    <span>Add Feature</span>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Feature 1 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900">Feature 1</h4>
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value="Real Racing Format"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value="Authentic yacht regatta with team dynamics, medals, and true competition."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Icon
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Trophy</option>
                          <option>Users</option>
                          <option>Camera</option>
                          <option>Shield</option>
                          <option>Star</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* More features would be listed here */}
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeContentEditor;