import React, { useState } from 'react';
import { FaGoogle, FaUserSecret } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { signInWithGoogle, signInAsGuest, error, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      clearError();
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error signing in:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      clearError();
      await signInAsGuest();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error signing in as guest:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 mb-4">
            PlankUP
          </h1>
          <p className="text-xl text-slate-600 font-medium">
            Build core strength, one day at a time
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
            Get Started
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button
              variant="primary"
              fullWidth
              onClick={handleGoogleSignIn}
              disabled={loading}
              aria-label="Sign in with Google"
            >
              <FaGoogle className="mr-3 text-xl" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              fullWidth
              onClick={handleGuestSignIn}
              disabled={loading}
              aria-label="Continue as guest"
            >
              <FaUserSecret className="mr-3 text-xl" />
              Continue as Guest
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>
              Guest mode stores data locally. Sign in with Google to sync across
              devices.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600 mb-1">3</div>
            <div className="text-xs text-slate-600">Baseline Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent-600 mb-1">+3s</div>
            <div className="text-xs text-slate-600">Daily Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600 mb-1">∞</div>
            <div className="text-xs text-slate-600">Your Potential</div>
          </div>
        </div>
      </div>
    </div>
  );
};
