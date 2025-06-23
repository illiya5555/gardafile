import React from 'react';
import { PersonStanding as Person, Users, Shield } from 'lucide-react';

interface LoginSelectionProps {
  onSelect: (role: 'client' | 'manager' | 'admin') => void;
  onClose: () => void;
}

/**
 * Component for selecting which dashboard role to login as
 */
const LoginSelection: React.FC<LoginSelectionProps> = ({ onSelect, onClose }) => {
  return (
    <div className="p-6 space-y-4">
      <p className="text-gray-600 mb-4 text-center">Select your access level to continue:</p>
      
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onSelect('client')}
          className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
          aria-label="Access Client Portal"
        >
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Person className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Client Portal</h3>
            <p className="text-sm text-gray-600">Access your bookings and profile</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('manager')}
          className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
          aria-label="Access Manager Dashboard"
        >
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Manager Dashboard</h3>
            <p className="text-sm text-gray-600">Manage bookings and clients</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('admin')}
          className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
          aria-label="Access Admin Control Panel"
        >
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Admin Control Panel</h3>
            <p className="text-sm text-gray-600">Full system administration</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LoginSelection;