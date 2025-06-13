import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Save, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      await updateProfile({
        ...profile,
        ...formData
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || ''
    });
    setIsEditing(false);
  };

  if (!user || !profile) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-gray-600 mb-4">{profile.email}</p>
              <div className="text-sm text-gray-500">
                <p>Member since</p>
                <p>{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors duration-300"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{profile.first_name || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{profile.last_name || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{profile.email}</span>
                    <span className="text-xs text-gray-500 ml-auto">Cannot be changed</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+39 345 678 9012"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profile.phone || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h3>
              <div className="space-y-4">
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-300">
                  <h4 className="font-semibold text-gray-900 mb-1">Download My Data</h4>
                  <p className="text-sm text-gray-600">Get a copy of all your account data</p>
                </button>
                
                <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-300">
                  <h4 className="font-semibold text-red-900 mb-1">Delete Account</h4>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;