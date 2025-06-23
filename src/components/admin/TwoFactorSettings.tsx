import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, AlertCircle, Copy } from 'lucide-react';

interface TwoFactorSettingsProps {
  userId: string;
}

/**
 * Component for managing two-factor authentication settings
 */
const TwoFactorSettings: React.FC<TwoFactorSettingsProps> = ({ userId }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  useEffect(() => {
    checkTwoFactorStatus();
  }, [userId]);

  /**
   * Check if 2FA is enabled for the current user
   */
  const checkTwoFactorStatus = async () => {
    try {
      setLoading(true);
      
      // Simulate 2FA status check since MFA table doesn't exist yet
      // In a real implementation, this would use Supabase's MFA API
      setIsEnabled(false);
    } catch (err) {
      console.error('Error checking 2FA status:', err);
      // Set default state instead of showing error for demo
      setIsEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set up 2FA for the user
   */
  const setupTwoFactor = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // This would use Supabase's MFA API
      // For now, we're simulating it
      // The actual implementation would get a QR code and secret from Supabase
      
      // Simulate generating a QR code and secret
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/GardaRacing:admin@example.com&size=200x200&ecc=M');
      setSecret('ABCDEFGHIJKLMNOP');
    } catch (err: any) {
      console.error('Error setting up 2FA:', err);
      setError(err.message || 'Failed to set up 2FA');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy the secret key to clipboard
   */
  const copySecretToClipboard = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 3000);
    }
  };

  /**
   * Verify the 2FA token to complete setup
   */
  const verifyTwoFactor = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would use Supabase's MFA API to verify the code
      // For now, we're simulating a successful verification
      
      // Simulate verification (in reality, this would verify against the server)
      if (verificationCode.length !== 6) {
        throw new Error('Invalid verification code');
      }

      // Simulate a successful verification
      setIsEnabled(true);
      setQrCode(null);
      setSecret(null);
      setVerificationCode('');
      setSuccess('Two-factor authentication has been enabled successfully!');
    } catch (err: any) {
      console.error('Error verifying 2FA:', err);
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disable 2FA for the user
   */
  const disableTwoFactor = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // This would use Supabase's MFA API to disable 2FA
      // For now, we're simulating it
      
      setIsEnabled(false);
      setSuccess('Two-factor authentication has been disabled successfully.');
    } catch (err: any) {
      console.error('Error disabling 2FA:', err);
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !qrCode && !isEnabled) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 2FA settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Two-Factor Authentication</h2>
      <p className="text-gray-600 mb-6">
        Add an extra layer of security to your account by enabling two-factor authentication.
      </p>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {isEnabled ? (
        <div>
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              <p className="text-green-800 font-medium">Two-factor authentication is enabled</p>
            </div>
            <p className="text-green-700 mt-2 text-sm">
              Your account is protected with an additional layer of security. You'll need to enter a code from your authenticator app when signing in.
            </p>
          </div>

          <button
            onClick={disableTwoFactor}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            aria-busy={loading}
          >
            {loading ? 'Processing...' : 'Disable Two-Factor Authentication'}
          </button>
        </div>
      ) : qrCode ? (
        <div>
          <div className="mb-6 space-y-4">
            <p className="text-gray-700">
              Scan this QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.).
            </p>
            
            <div className="flex justify-center my-6">
              <img 
                src={qrCode} 
                alt="QR Code for two-factor authentication" 
                className="h-48 w-48 border border-gray-200 p-2 rounded-lg"
              />
            </div>
            
            {secret && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-gray-700">Manual entry code:</p>
                  <button 
                    onClick={copySecretToClipboard} 
                    className="text-primary-600 hover:text-primary-700 text-xs flex items-center"
                    aria-label="Copy secret key"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {secretCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <code className="block text-sm bg-white p-2 rounded border border-gray-200 font-mono text-gray-800">
                  {secret}
                </code>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
              Enter the 6-digit code from your authenticator app:
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              maxLength={6}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <p className="mt-1 text-xs text-gray-500">Enter the 6-digit code displayed in your app</p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setQrCode(null);
                setSecret(null);
                setError(null);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={verifyTwoFactor}
              disabled={loading || verificationCode.length !== 6}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              type="button"
              aria-busy={loading}
            >
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              Two-factor authentication adds an extra layer of security to your account by requiring a second form of verification when you sign in.
            </p>
          </div>

          <button
            onClick={setupTwoFactor}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            aria-busy={loading}
          >
            {loading ? 'Processing...' : 'Enable Two-Factor Authentication'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;