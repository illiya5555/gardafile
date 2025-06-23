import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  helpText?: string;
}

/**
 * Accessible form field component that ensures proper labeling
 * and error handling for form inputs.
 */
const FormField: React.FC<FormFieldProps> = ({ 
  id, 
  label, 
  required = false,
  error,
  children,
  className = '',
  helpText
}) => {
  // Generate a unique ID for the error message if there is one
  const errorId = error ? `${id}-error` : undefined;
  const helpTextId = helpText ? `${id}-help` : undefined;
  
  // Determine what IDs to associate with the input
  const ariaDescribedBy = [
    errorId,
    helpTextId
  ].filter(Boolean).join(' ') || undefined;
  
  return (
    <div className={`space-y-1 ${className}`}>
      <label 
        htmlFor={id} 
        className={`block text-sm font-medium ${error ? 'text-red-600' : 'text-gray-700'}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Clone the child element (input, textarea, etc.) with additional props */}
      {React.isValidElement(children) ? 
        React.cloneElement(children as React.ReactElement, {
          id,
          'aria-invalid': error ? 'true' : undefined,
          'aria-describedby': ariaDescribedBy,
          'aria-required': required
        }) : 
        children
      }
      
      {/* Help text for additional context */}
      {helpText && (
        <p id={helpTextId} className="text-xs text-gray-500">
          {helpText}
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <p id={errorId} className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;