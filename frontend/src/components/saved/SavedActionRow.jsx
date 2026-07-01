import { Link } from 'react-router-dom';
import FaIcon from '../FaIcon';

const CHIP = {
  default:
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:scale-[0.98]',
  primary:
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-600 bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-primary-600/20 transition hover:bg-primary-700 active:scale-[0.98]',
  danger:
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 active:scale-[0.98]',
};

function ActionChip({ action }) {
  const cls = action.danger ? CHIP.danger : action.primary ? CHIP.primary : CHIP.default;
  const icon = action.icon ? <FaIcon icon={action.icon} className="text-[10px]" brand={action.brand} /> : null;

  if (action.onClick) {
    return (
      <button type="button" className={cls} onClick={action.onClick}>
        {icon}
        {action.label}
      </button>
    );
  }

  if (action.to) {
    return (
      <Link to={action.to} className={cls}>
        {icon}
        {action.label}
      </Link>
    );
  }

  if (action.href) {
    return (
      <a
        href={action.href}
        className={cls}
        target={action.external ? '_blank' : undefined}
        rel={action.external ? 'noopener noreferrer' : undefined}
      >
        {icon}
        {action.label}
      </a>
    );
  }

  return null;
}

/**
 * One-line action chips — scrolls horizontally without visible scrollbar when overflowed.
 */
export default function SavedActionRow({ actions, className = '' }) {
  const list = (actions || []).filter((a) => a && !a.divider);
  if (!list.length) return null;

  return (
    <div className={`scroll-x-hide flex flex-nowrap gap-2 w-full -mx-0.5 px-0.5 pb-0.5 ${className}`}>
      {list.map((action) => (
        <ActionChip key={action.key || action.label} action={action} />
      ))}
    </div>
  );
}
