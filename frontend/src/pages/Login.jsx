import { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import PhoneOtpLogin from '../components/PhoneOtpLogin';
import AuthFallbackLogin from '../components/AuthFallbackLogin';
import FaIcon from '../components/FaIcon';

const TABS = [
  {
    id: 'patient',
    label: 'Patient',
    icon: 'fa-user',
    role: 'patient',
    subtitle: 'Book appointments, view reports & packages',
    registerLabel: 'Create patient account',
    registerTo: '/register?role=patient',
  },
  {
    id: 'doctor',
    label: 'Doctor / Provider',
    icon: 'fa-user-doctor',
    role: 'doctor',
    subtitle: 'Manage clinics, appointments & patients',
    registerLabel: 'Join as physiotherapist',
    registerTo: '/register?role=doctor',
  },
];

export default function Login() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const redirectTo = location.state?.from;
  const loginRequiredForBooking = redirectTo?.includes('/book');
  const urlRole = searchParams.get('role');
  const activeTab = urlRole === 'doctor' || urlRole === 'provider' ? 'doctor' : 'patient';
  const tab = TABS.find((t) => t.id === activeTab) || TABS[0];
  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (urlRole === 'provider') {
      setSearchParams({ role: 'doctor' }, { replace: true });
    }
  }, [urlRole, setSearchParams]);

  const setTab = (id) => {
    setSearchParams(id === 'doctor' ? { role: 'doctor' } : {}, { replace: true });
  };

  const dashboardTo =
    user && hasRole('doctor')
      ? '/doctor'
      : user && hasRole('admin', 'super_admin')
        ? '/admin'
        : '/login?role=doctor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-white">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/25 mb-4">
            <FaIcon icon="fa-right-to-bracket" className="text-xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in with your registered mobile number</p>
        </div>

        {loginRequiredForBooking && (
          <div className="mb-6 rounded-xl bg-primary-50 border border-primary-200 px-4 py-3 text-sm text-primary-800 flex gap-2 items-start">
            <FaIcon icon="fa-calendar-check" className="mt-0.5 shrink-0 text-primary-600" />
            <span>Sign in to continue booking. You&apos;ll return to your appointment after login.</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-100">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition ${
                  activeTab === t.id
                    ? 'text-primary-700 bg-primary-50/80 border-b-2 border-primary-600 -mb-px'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FaIcon icon={t.icon} className="text-xs" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-sm text-slate-600 mb-6 text-center">{tab.subtitle}</p>

            <PhoneOtpLogin fixedRole={tab.role} redirectTo={redirectTo} />

            <AuthFallbackLogin redirectTo={redirectTo} forgotPasswordRole={tab.role} />

            <p className="mt-6 text-center text-sm text-slate-600">
              New here?{' '}
              <Link
                to={tab.registerTo}
                state={{ from: redirectTo }}
                className="font-semibold text-primary-600 hover:underline"
              >
                {tab.registerLabel}
              </Link>
            </p>

            {activeTab === 'doctor' && user && hasRole('doctor', 'admin', 'super_admin') && (
              <p className="mt-3 text-center">
                <Link to={dashboardTo} className="text-sm font-medium text-slate-600 hover:text-primary-600 inline-flex items-center gap-1.5">
                  <FaIcon icon="fa-gauge-high" className="text-xs" />
                  Go to dashboard
                </Link>
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          OTP is sent via SMS or WhatsApp to your registered mobile only
        </p>
      </div>
    </div>
  );
}
