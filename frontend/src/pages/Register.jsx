import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import GoogleSignInButton, { hasGoogleAuth } from '../components/GoogleSignInButton';
import PasswordInput from '../components/PasswordInput';
import { navigateAfterAuth } from '../utils/authRedirect';

export default function Register() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'patient',
    specialization: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await register(form);
      toast.success('Check your email for the verification code');
      navigate('/verify-otp', {
        state: { email: result.email || form.email, from: redirectTo },
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    setGoogleLoading(true);
    try {
      const user = await googleLogin(credential, form.role);
      toast.success('Account created! Check your email for your sign-in password.');
      navigateAfterAuth(navigate, user, redirectTo);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12 relative">
        <div className="glass-strong rounded-3xl p-8 animate-scale-in shadow-xl hover-glow">
          <h1 className="text-2xl font-bold mb-6">Create Account</h1>
          <div className="flex gap-2 mb-6">
            {['patient', 'doctor'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 py-2 rounded-lg font-medium capitalize ${
                  form.role === r ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {hasGoogleAuth() && (
            <>
              <GoogleSignInButton
                onSuccess={handleGoogle}
                onError={(err) => toast.error(err.message)}
                text="signup_with"
              />
              {googleLoading && (
                <p className="text-center text-sm text-slate-500 mt-2">Creating account with Google...</p>
              )}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/80 text-slate-500">or register with email</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                className="input-field"
                placeholder="First name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
              />
              <input
                className="input-field"
                placeholder="Last name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
              />
            </div>
            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="input-field"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <PasswordInput
              placeholder="Password (min 8 chars)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {form.role === 'doctor' && (
              <input
                className="input-field"
                placeholder="Specialization"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              />
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating...' : 'Register & verify email'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" state={{ from: redirectTo }} className="text-primary-600">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
