import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import GoogleSignInButton, { hasGoogleAuth } from '../components/GoogleSignInButton';
import PasswordInput from '../components/PasswordInput';
import { navigateAfterAuth } from '../utils/authRedirect';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = location.state?.from;
  const urlRole = searchParams.get('role');
  const initialRole = urlRole === 'doctor' ? 'doctor' : 'patient';

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: initialRole,
    specialization: '',
  });

  useEffect(() => {
    if (urlRole === 'doctor' || urlRole === 'patient') {
      setForm((prev) => ({ ...prev, role: urlRole }));
    }
  }, [urlRole]);

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
            <Link
              to={form.role === 'doctor' ? '/login?role=doctor' : '/login?role=patient'}
              state={{ from: redirectTo }}
              className="text-primary-600"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
