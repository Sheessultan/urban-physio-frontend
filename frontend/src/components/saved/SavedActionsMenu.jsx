import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FaIcon from '../FaIcon';

/**
 * Single "Actions" control — opens a dropdown with profile, book, call, etc.
 */
export default function SavedActionsMenu({ items, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!items?.length) return null;

  return (
    <div ref={ref} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-outline text-sm inline-flex items-center gap-1.5 !py-2.5"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <FaIcon icon="fa-ellipsis-vertical" />
        Actions
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 z-30 min-w-[12.5rem] rounded-xl border border-slate-200 bg-white shadow-lg py-1 animate-fade-in"
        >
          {items.map((item) => {
            if (item.divider) {
              return <hr key={item.key || 'divider'} className="my-1 border-slate-100" />;
            }

            const rowClass = `w-full text-left px-3.5 py-2.5 text-sm flex items-center gap-2.5 transition hover:bg-slate-50 ${
              item.danger ? 'text-red-700 hover:bg-red-50' : item.primary ? 'text-primary-700 font-semibold' : 'text-slate-700'
            }`;

            const content = (
              <>
                {item.icon && <FaIcon icon={item.icon} className={`text-xs w-4 ${item.brand ? '' : 'text-slate-400'}`} brand={item.brand} />}
                <span>{item.label}</span>
              </>
            );

            if (item.onClick) {
              return (
                <button
                  key={item.key || item.label}
                  type="button"
                  role="menuitem"
                  className={rowClass}
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                >
                  {content}
                </button>
              );
            }

            if (item.to) {
              return (
                <Link
                  key={item.key || item.label}
                  to={item.to}
                  role="menuitem"
                  className={rowClass}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </Link>
              );
            }

            if (item.href) {
              return (
                <a
                  key={item.key || item.label}
                  href={item.href}
                  role="menuitem"
                  className={rowClass}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </a>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
