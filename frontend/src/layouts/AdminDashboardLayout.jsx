import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/admin/AdminSidebar';
import FaIcon from '../components/FaIcon';
import { ADMIN_NAV } from '../constants/adminNav';
import { notifications } from '../services/api';
import { hasStoredToken } from '../utils/authSession';

function AdminMobileNavLink({ link, pathname, unreadCount }) {
  const active = pathname === link.to;
  return (
    <Link
      to={link.to}
      className={`dashboard-mobile-nav-link ${active ? 'dashboard-mobile-nav-link--active' : ''}`}
    >
      {typeof link.icon === 'string' && link.icon.startsWith('fa-') ? (
        <FaIcon icon={link.icon} className="text-xs shrink-0" />
      ) : (
        <span>{link.icon}</span>
      )}
      <span className="whitespace-nowrap">{link.label}</span>
      {link.notifyKey && unreadCount > 0 && (
        <span className="min-w-[1.1rem] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}

export default function AdminDashboardLayout({ children, links = ADMIN_NAV }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = () => {
    if (!hasStoredToken()) return;
    notifications
      .unreadCount()
      .then((res) => setUnreadCount(res.data?.unread_count ?? 0))
      .catch(() => setUnreadCount(0));
  };

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => setSidebarOpen(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen || window.innerWidth >= 1024) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (user && hasStoredToken()) refreshUnread();
  }, [user, pathname]);

  useEffect(() => {
    const onUpdate = () => refreshUnread();
    window.addEventListener('notifications-updated', onUpdate);
    return () => window.removeEventListener('notifications-updated', onUpdate);
  }, []);

  const closeSidebar = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const sidebarToggle = (
    <>
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        className="site-header-menu-btn lg:hidden shrink-0"
        aria-label={sidebarOpen ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={sidebarOpen}
      >
        <FaIcon icon={sidebarOpen ? 'fa-xmark' : 'fa-bars'} />
      </button>
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        className="site-header-menu-btn hidden lg:inline-flex shrink-0"
        aria-label={sidebarOpen ? 'Collapse admin menu' : 'Expand admin menu'}
        aria-expanded={sidebarOpen}
      >
        <FaIcon icon={sidebarOpen ? 'fa-angles-left' : 'fa-angles-right'} />
      </button>
    </>
  );

  return (
    <div className="min-h-screen relative admin-shell">
      <Navbar beforeLogo={sidebarToggle} />
      <AdminSidebar open={sidebarOpen} onClose={closeSidebar} links={links} unreadCount={unreadCount} />

      <nav
        className="lg:hidden sticky top-16 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md"
        aria-label="Admin navigation"
      >
        <div className="max-w-7xl mx-auto px-3 py-2.5 flex gap-2 overflow-x-auto scrollbar-thin">
          {links.map((link) => (
            <AdminMobileNavLink key={link.to} link={link} pathname={pathname} unreadCount={unreadCount} />
          ))}
        </div>
      </nav>

      <div
        className={`admin-main-wrap transition-[padding] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
        }`}
      >
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-5 sm:py-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
