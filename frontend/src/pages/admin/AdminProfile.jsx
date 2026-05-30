import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import PasswordSecuritySection from '../../components/PasswordSecuritySection';
import FaIcon from '../../components/FaIcon';
import { auth } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'personal', label: 'Personal', icon: 'fa-user' },
  { id: 'security', label: 'Security', icon: 'fa-shield-halved' },
];

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => searchParams.get('tab') || 'personal');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, [searchParams]);

  useEffect(() => {
    auth
      .me()
      .then((res) => {
        const p = res?.data ?? res;
        setForm({
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          email: p.email || '',
          phone: p.phone || '',
        });
        setUser((u) => (u ? { ...u, ...p } : p));
      })
      .catch((err) => toast.error(err.message || 'Could not load profile'))
      .finally(() => setLoading(false));
  }, [setUser]);

  const onPasswordUpdated = (authUser) => {
    if (authUser && typeof authUser === 'object') {
      setUser((u) => {
        const merged = { ...u, ...authUser };
        localStorage.setItem('user', JSON.stringify(merged));
        return merged;
      });
    }
  };

  const switchTab = (id) => {
    setTab(id);
    navigate(id === 'personal' ? '/admin/profile' : `/admin/profile?tab=${id}`, { replace: true });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await auth.updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
      });
      const p = res?.data ?? res;
      setUser((u) => {
        const merged = { ...u, ...p };
        localStorage.setItem('user', JSON.stringify(merged));
        return merged;
      });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60 max-w-xl" />
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Profile settings</h1>
      <p className="text-slate-600 text-sm mt-1 mb-5 md:mb-6">Admin account details and password.</p>

      <div className="flex gap-2 mb-5 md:mb-6 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1 max-w-xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id)}
            className={`shrink-0 px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
              tab === t.id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                : 'bg-white/70 text-slate-600 border border-slate-200 hover:border-primary-300'
            }`}
          >
            <FaIcon icon={t.icon} className="text-xs" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'security' ? (
        <div className="glass-card !p-4 md:!p-6 max-w-xl">
          <PasswordSecuritySection
            passwordCustomized={!!user?.password_customized}
            onUpdated={onPasswordUpdated}
          />
        </div>
      ) : (
        <form onSubmit={save} className="glass-card !p-4 md:!p-6 max-w-xl space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="input-field"
              placeholder="First name"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              required
            />
            <input
              className="input-field"
              placeholder="Last name"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              required
            />
          </div>
          <input className="input-field bg-slate-50" value={form.email} disabled />
          <input
            className="input-field"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}
    </AdminDashboardLayout>
  );
}
