import { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import PhoneOtpLogin from '../components/PhoneOtpLogin';
import AuthFallbackLogin from '../components/AuthFallbackLogin';
import FaIcon from '../components/FaIcon';

const PATIENT_ACCOUNT_LINKS = [
  { to: '/patient/profile', label: 'Profile', icon: 'fa-user' },
  { to: '/patient/appointments', label: 'Appointments', icon: 'fa-calendar-check' },
  { to: '/patient/packages', label: 'Orders', icon: 'fa-box-open' },
];

function LoginSection({ id, title, subtitle, active, children, footer }) {
  return (
    <section
      id={id}
      className={`glass-strong rounded-3xl p-6 sm:p-8 shadow-xl transition-shadow ${
        active ? 'ring-2 ring-primary-500/80 shadow-primary-100/50' : 'hover-glow'
      }`}
    >
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">{title}</p>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </header>
      {children}
      {footer}
    </section>
  );
}

export default function Login() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = location.state?.from;
  const loginRequiredForBooking = redirectTo?.includes('/book');
  const sectionRole = searchParams.get('role');
  const focusProvider = sectionRole === 'doctor' || sectionRole === 'provider';
  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (focusProvider) {
      document.getElementById('provider-login')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusProvider]);

  const providerDashboardTo = () => {
    if (!user) return '/login?role=doctor';
    if (hasRole('doctor')) return '/doctor';
    if (hasRole('admin', 'super_admin')) return '/admin';
    return '/login?role=doctor';
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14 relative">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Patients and providers use separate sign-in — mobile OTP first, then Google or email if needed.
          </p>
        </div>

        {loginRequiredForBooking && (
          <p className="text-sm text-primary-800 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 mb-6 max-w-2xl mx-auto">
            Please sign in to book an appointment. You&apos;ll return to booking after login.
          </p>
        )}

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <LoginSection
            id="patient-login"
            title="Patient"
            subtitle="My Account — Profile, Appointments, Orders"
            active={!focusProvider}
          >
            <div className="flex flex-wrap gap-2 mb-5">
              {PATIENT_ACCOUNT_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  state={{ from: redirectTo }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 px-3 py-1.5 rounded-full transition"
                >
                  <FaIcon icon={item.icon} className="text-[10px] text-primary-500" />
                  {item.label}
                </Link>
              ))}
            </div>

            <PhoneOtpLogin fixedRole="patient" redirectTo={redirectTo} />

            <AuthFallbackLogin role="patient" redirectTo={redirectTo} forgotPasswordRole="patient" />

            <p className="mt-5 text-center text-sm text-slate-600">
              New patient?{' '}
              <Link
                to="/register?role=patient"
                state={{ from: redirectTo }}
                className="text-primary-600 font-semibold hover:underline"
              >
                Register
              </Link>
            </p>
          </LoginSection>

          <LoginSection
            id="provider-login"
            title="For providers"
            subtitle="Doctors & clinic partners — Login, Register, Dashboard"
            active={focusProvider}
          >
            <PhoneOtpLogin fixedRole="doctor" redirectTo={redirectTo} />

            <AuthFallbackLogin role="doctor" redirectTo={redirectTo} forgotPasswordRole="doctor" />

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
              <Link
                to="/register?role=doctor"
                state={{ from: redirectTo }}
                className="text-primary-600 font-semibold hover:underline"
              >
                Register as physiotherapist
              </Link>
              <span className="hidden sm:inline text-slate-300">|</span>
              <Link
                to={providerDashboardTo()}
                className="text-slate-600 font-medium hover:text-primary-600 hover:underline inline-flex items-center gap-1.5"
              >
                <FaIcon icon="fa-gauge-high" className="text-xs" />
                {user && hasRole('doctor', 'admin', 'super_admin') ? 'Go to dashboard' : 'Provider dashboard'}
              </Link>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Admin accounts: use email &amp; password or Google in the section above.
            </p>
          </LoginSection>
        </div>
      </div>
    </div>
  );
}
