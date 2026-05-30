import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password updated. You can sign in now.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="glass-strong rounded-3xl p-8 text-center">
            <p className="text-slate-700 mb-4">This reset link is invalid or expired.</p>
            <Link to="/forgot-password" className="btn-primary inline-block">
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16 relative">
        <div className="glass-strong rounded-3xl p-8 animate-slide-up shadow-xl">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Set new password</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
