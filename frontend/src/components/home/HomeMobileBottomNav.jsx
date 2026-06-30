import { Link } from 'react-router-dom';
import FaIcon from '../FaIcon';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'fa-house', scrollTop: true },
  { key: 'physio', label: 'Physio', icon: 'fa-user-doctor', to: '/doctors' },
  { key: 'clinic', label: 'Clinic', icon: 'fa-hospital', to: '/clinics' },
  { key: 'home-visit', label: 'Home Visit', icon: 'fa-house-medical', to: '/book?type=home_visit' },
];

function scrollHomeToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function NavItem({ item, isActive }) {
  const pillClass = [
    'flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 min-h-[44px] px-1 py-1.5 rounded-2xl',
    'transition-all duration-200 ease-out touch-manipulation',
    isActive
      ? 'bg-white text-primary-600 shadow-md shadow-slate-900/10 border border-slate-200/90 scale-[1.02]'
      : 'text-slate-500 hover:text-slate-700 active:bg-slate-100/90',
  ].join(' ');

  const inner = (
    <>
      <FaIcon icon={item.icon} className={`text-base ${isActive ? 'text-primary-600' : ''}`} />
      <span className={`text-[10px] font-semibold leading-tight text-center truncate max-w-full ${isActive ? 'text-primary-600' : ''}`}>
        {item.label}
      </span>
    </>
  );

  if (item.scrollTop) {
    return (
      <button type="button" onClick={scrollHomeToTop} className={pillClass} aria-current={isActive ? 'page' : undefined}>
        {inner}
      </button>
    );
  }

  return (
    <Link to={item.to} className={pillClass} aria-current={isActive ? 'page' : undefined}>
      {inner}
    </Link>
  );
}

/**
 * Sticky bottom navigation — mobile homepage only (hidden from md / 768px up).
 */
export default function HomeMobileBottomNav() {
  return (
    <nav
      className="home-mobile-bottom-nav md:hidden"
      aria-label="Core services"
    >
      <div className="home-mobile-bottom-nav__inner">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.key} item={item} isActive={item.key === 'home'} />
        ))}
      </div>
    </nav>
  );
}
