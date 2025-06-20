import React from 'react';

const BookingContentEditor = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Page Editor</h2>
          <p className="text-gray-600">
            Booking page content editor will be implemented here. This will allow editing of:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• Calendar configuration</li>
            <li>• Time slot management</li>
            <li>• Pricing and packages</li>
            <li>• Payment integration settings</li>
            <li>• Confirmation email templates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingContentEditor;