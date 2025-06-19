import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  name?: string;
}

// Common country codes with flags
const countryCodes = [
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+36', flag: '🇭🇺', name: 'Hungary' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
];

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = 'Phone number',
  required = false,
  className = '',
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse the current value to extract country code and number
  const parseValue = (val: string) => {
    // Check if the value starts with a plus sign
    if (val.startsWith('+')) {
      // Find the country code that matches the beginning of the value
      const matchedCountry = countryCodes.find(country => 
        val.startsWith(country.code)
      );
      
      if (matchedCountry) {
        return {
          countryCode: matchedCountry.code,
          number: val.substring(matchedCountry.code.length).trim()
        };
      }
    }
    
    // Default to Italy if no match found
    return {
      countryCode: '+39',
      number: val.startsWith('+') ? '' : val
    };
  };
  
  const { countryCode, number } = parseValue(value);
  
  const handleCountryCodeChange = (code: string) => {
    onChange(`${code} ${number}`);
    setIsOpen(false);
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${countryCode} ${e.target.value}`);
  };
  
  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0];

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex w-full">
        {/* Country code selector */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center space-x-1 px-3 py-3 bg-gray-100 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.code}</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-300"
                  onClick={() => handleCountryCodeChange(country.code)}
                >
                  <span className="text-lg mr-2">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                  <span className="ml-2 text-gray-500">{country.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Phone number input */}
        <input
          type="tel"
          name={name}
          value={number}
          onChange={handleNumberChange}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
};

export default PhoneInput;