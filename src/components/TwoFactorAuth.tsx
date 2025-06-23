import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface TwoFactorAuthProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Two-factor authentication component
 * Handles verification of 2FA codes
 */
const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  email,
  onSuccess,
  onCancel
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Verify the 2FA token - implementation depends on Supabase MFA API
      const { data, error } = await supabase.auth.verifyOTP({
        email,
        token: code,
        type: 'totp'
      });

      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      console.error('2FA verification error:', err);
      setError(err.message || 'Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Two-Factor Authentication
        </h3>
        <p className="text-gray-600 text-sm">
          Please enter the 6-digit verification code from your authenticator app.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
            placeholder="000000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            aria-label="Enter your verification code"
          />
          <p className="mt-1 text-xs text-gray-500">Enter the 6-digit code from your authenticator app</p>
        </div>

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            aria-busy={loading}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorAuth;