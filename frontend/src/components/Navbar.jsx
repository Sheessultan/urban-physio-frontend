import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import FaIcon from './FaIcon';
import Logo from './Logo';
import GlobalSearch from './GlobalSearch';
import MobileNavDrawer from './MobileNavDrawer';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/doctors', label: 'Find Doctors' },
  { to: '/clinics', label: 'Find Clinics' },
  { to: '/treatments', label: 'Treatments' },
  { to: '/packages', label: 'Packages' },
  { to: '/conditions', label: 'Conditions' },
];

/**
 * Public site header — same on home, booking, login, and admin (admin adds sidebar toggle via beforeLogo).
 * @param {{ beforeLogo?: import('react').ReactNode, headerSpacerClass?: string }} props
 */
export default function Navbar({ beforeLogo = null, headerSpacerClass = '' }) {
  const { pathname } = useLocation();
  const { user, logout, hasRole } = useAuth();
  const { city, setShowSelector, locationLabel } = useLocationContext();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const dashboardPath = () => {
    if (!user) return '/login';
    if (hasRole('super_admin', 'admin')) return '/admin';
    if (hasRole('doctor')) return '/doctor';
    return '/patient';
  };

  const dashboardLabel = () => {
    if (hasRole('super_admin', 'admin')) return 'Admin';
    if (hasRole('doctor')) return 'Dashboard';
    if (hasRole('patient')) return 'My account';
    return 'Dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const linkClass = (to) => {
    const active = to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);
    return `site-header-link ${active ? 'site-header-link--active' : ''}`;
  };

  return (
    <>
      <header
        className={`site-header glass-nav fixed top-0 left-0 right-0 z-[110] w-full ${
          scrolled ? 'glass-nav--scrolled' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center h-14 sm:h-16 w-full">
            {/* Logo + optional admin sidebar toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {beforeLogo}
              <Link to="/" className="flex items-center shrink-0" onClick={() => setMobileOpen(false)}>
                <Logo className="h-8 md:h-9 w-auto max-w-[120px] md:max-w-[150px] object-contain" showText={false} />
              </Link>
            </div>

            {/* Desktop navigation — spaced from logo */}
            <nav
              className="hidden lg:flex items-center gap-0.5 ml-6 xl:ml-10 2xl:ml-12 shrink-0"
              aria-label="Main"
            >
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden xl:flex flex-1 max-w-[280px] min-w-0 justify-center px-4 lg:px-6 mx-auto">
              <GlobalSearch variant="header" onNavigate={() => setMobileOpen(false)} />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="hidden md:inline-flex xl:hidden site-header-menu-btn"
                aria-label="Open search and menu"
              >
                <FaIcon icon="fa-magnifying-glass" />
              </button>
              {city && (
                <button
                  type="button"
                  onClick={() => setShowSelector(true)}
                  className="hidden md:inline-flex text-xs text-primary-700 glass px-2.5 py-1.5 rounded-full font-medium items-center gap-1 max-w-[140px]"
                >
                  <FaIcon icon="fa-location-dot" className="shrink-0" />
                  <span className="truncate">{locationLabel || city.name}</span>
                </button>
              )}
              <Link to="/book" className="hidden sm:inline-flex btn-primary text-sm !py-2 !px-4">
                Book Appointment
              </Link>
              {user ? (
                <>
                  <Link
                    to={dashboardPath()}
                    className="hidden md:inline-flex text-sm font-medium text-slate-600 hover:text-primary-600 px-1"
                  >
                    {dashboardLabel()}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="hidden sm:inline-flex btn-outline text-sm !py-2 !px-3"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-primary-600 px-2"
                >
                  Login
                </Link>
              )}
              <button
                type="button"
                className="site-header-menu-btn lg:hidden"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                <FaIcon icon={mobileOpen ? 'fa-xmark' : 'fa-bars'} className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        hasRole={hasRole}
        dashboardPath={dashboardPath}
        dashboardLabel={dashboardLabel}
        city={city}
        locationLabel={locationLabel}
        onShowLocation={() => setShowSelector(true)}
        onLogout={handleLogout}
      />

      <div
        className={`site-header-spacer h-14 sm:h-16 shrink-0 ${headerSpacerClass}`}
        aria-hidden="true"
      />
    </>
  );
}
