import React, { useState } from 'react';
import UnifiedCalendar from '../calendar/UnifiedCalendar';

const BookingContentEditor = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Page Editor</h2>
          <p className="text-gray-600 mb-8">
            Booking page content editor will be implemented here. This will allow editing of:
          </p>
          <ul className="mb-8 space-y-2 text-gray-600">
            <li>• Booking page header and description</li>
            <li>• Pricing information</li>
            <li>• Included features</li>
            <li>• Booking form fields and validation</li>
            <li>• Confirmation messages</li>
          </ul>
          
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Calendar Preview</h3>
            <p className="text-gray-600 mb-4">
              This is a preview of the booking calendar as seen by customers. 
              Any changes made in the Calendar Management section will be reflected here.
            </p>
            
            <UnifiedCalendar 
              mode="select" 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              showTimeSlots={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingContentEditor;