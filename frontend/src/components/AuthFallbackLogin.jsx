import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton, { hasGoogleAuth } from './GoogleSignInButton';
import PasswordInput from './PasswordInput';
import { navigateAfterAuth } from '../utils/authRedirect';

/**
 * Google + email/password sign-in for accounts without a registered mobile number.
 */
export default function AuthFallbackLogin({ role = 'patient', redirectTo, forgotPasswordRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      navigateAfterAuth(navigate, user, redirectTo);
    } catch (err) {
      if (err.needsVerification) {
        toast.error('Please verify your email first');
        navigate('/verify-otp', {
          state: { email: err.email || email, from: redirectTo },
        });
        return;
      }
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    setGoogleLoading(true);
    try {
      const user = await googleLogin(credential, role);
      toast.success('Welcome back!');
      navigateAfterAuth(navigate, user, redirectTo);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      <p className="text-sm text-slate-600 text-center mb-4">
        No mobile number on your account? Sign in with Google or email &amp; password
      </p>

      {hasGoogleAuth() && (
        <>
          <GoogleSignInButton
            onSuccess={handleGoogle}
            onError={(err) => toast.error(err.message)}
            text="continue_with"
          />
          {googleLoading && (
            <p className="text-center text-xs text-slate-500 mt-2">Signing in with Google…</p>
          )}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400 uppercase tracking-wide">or use email</span>
            </div>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <PasswordInput
          label="Password"
          labelExtra={
            <Link
              to="/forgot-password"
              state={{ from: redirectTo, loginRole: forgotPasswordRole }}
              className="text-xs text-primary-600 font-medium hover:underline"
            >
              Forgot password?
            </Link>
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit" disabled={loading} className="btn-outline w-full text-sm">
          {loading ? 'Signing in…' : 'Sign in with email'}
        </button>
      </form>
    </div>
  );
}
