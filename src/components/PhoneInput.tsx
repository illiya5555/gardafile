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

// European and international country codes with flags
const countryCodes = [
  { code: '+39', flag: '🇮🇹', name: 'Italy', countryCode: 'IT' },
  { code: '+49', flag: '🇩🇪', name: 'Germany', countryCode: 'DE' },
  { code: '+43', flag: '🇦🇹', name: 'Austria', countryCode: 'AT' },
  { code: '+33', flag: '🇫🇷', name: 'France', countryCode: 'FR' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland', countryCode: 'CH' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands', countryCode: 'NL' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom', countryCode: 'GB' },
  { code: '+34', flag: '🇪🇸', name: 'Spain', countryCode: 'ES' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden', countryCode: 'SE' },
  { code: '+47', flag: '🇳🇴', name: 'Norway', countryCode: 'NO' },
  { code: '+358', flag: '🇫🇮', name: 'Finland', countryCode: 'FI' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark', countryCode: 'DK' },
  { code: '+48', flag: '🇵🇱', name: 'Poland', countryCode: 'PL' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic', countryCode: 'CZ' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia', countryCode: 'SK' },
  { code: '+36', flag: '🇭🇺', name: 'Hungary', countryCode: 'HU' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium', countryCode: 'BE' },
  { code: '+972', flag: '🇮🇱', name: 'Israel', countryCode: 'IL' },
  { code: '+61', flag: '🇦🇺', name: 'Australia', countryCode: 'AU' },
  { code: '+1', flag: '🇺🇸', name: 'United States', countryCode: 'US' },
  { code: '+1', flag: '🇨🇦', name: 'Canada', countryCode: 'CA' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil', countryCode: 'BR' },
  { code: '+971', flag: '🇦🇪', name: 'UAE', countryCode: 'AE' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey', countryCode: 'TR' },
  { code: '+40', flag: '🇷🇴', name: 'Romania', countryCode: 'RO' },
  { code: '+30', flag: '🇬🇷', name: 'Greece', countryCode: 'GR' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia', countryCode: 'SI' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia', countryCode: 'HR' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia', countryCode: 'RS' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine', countryCode: 'UA' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria', countryCode: 'BG' }
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
    
    // Default to Italy if no match found (primary market)
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
    // Remove any non-digit characters except spaces and dashes
    const cleanNumber = e.target.value.replace(/[^\d\s-]/g, '');
    onChange(`${countryCode} ${cleanNumber}`);
  };
  
  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0];

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex w-full">
        {/* Country code selector */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center space-x-1 px-3 py-3 bg-gray-100 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:bg-gray-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Select country code"
          >
            <span className="text-lg" role="img" aria-label={selectedCountry.name}>
              {selectedCountry.flag}
            </span>
            <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
              {selectedCountry.code}
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {countryCodes.map((country) => (
                <button
                  key={`${country.code}-${country.countryCode}`}
                  type="button"
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-300 focus:bg-gray-100 focus:outline-none"
                  onClick={() => handleCountryCodeChange(country.code)}
                >
                  <span className="text-lg mr-3" role="img" aria-label={country.name}>
                    {country.flag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 truncate block">
                      {country.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {country.code}
                    </span>
                  </div>
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
          className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 focus:border-primary-500"
          placeholder={placeholder}
          required={required}
          autoComplete="tel"
        />
      </div>
    </div>
  );
};

export default PhoneInput;