import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FaIcon from './FaIcon';

const MENU_Z = 10050;

/**
 * Searchable combobox for state/city lists. Menu renders in a portal so it is not clipped by modals.
 */
export default function SearchableLocationSelect({
  label,
  placeholder = 'Select…',
  searchPlaceholder = 'Type to search…',
  options = [],
  value,
  onChange,
  disabled = false,
  emptyMessage = 'No matches',
  id,
  helperText,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuStyle, setMenuStyle] = useState(null);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => String(o.id) === String(value)),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.name || '').toLowerCase().includes(q));
  }, [options, query]);

  const updateMenuPosition = () => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 6;
    const preferredMax = 260;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(preferredMax, openUp ? spaceAbove : spaceBelow);

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: MENU_Z,
      maxHeight: Math.max(120, maxHeight),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return undefined;
    }
    updateMenuPosition();
    const onReflow = () => updateMenuPosition();
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [open, filtered.length, options.length]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      const t = e.target;
      if (anchorRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  const pick = (opt) => {
    onChange(String(opt.id));
    setOpen(false);
    setQuery('');
  };

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
  };

  const menu = open && menuStyle && !disabled && (
    <div
      ref={menuRef}
      role="listbox"
      className="location-select-menu rounded-xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden flex flex-col"
      style={menuStyle}
    >
      <ul
        className="overflow-y-auto overscroll-contain py-1 flex-1 min-h-0 location-select-list"
        style={{ maxHeight: menuStyle.maxHeight }}
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-3 text-sm text-slate-500 text-center">{emptyMessage}</li>
        ) : (
          filtered.map((opt) => {
            const active = String(opt.id) === String(value);
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`w-full text-left px-3 py-2.5 text-sm transition ${
                    active
                      ? 'bg-primary-50 text-primary-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(opt)}
                >
                  {opt.name}
                </button>
              </li>
            );
          })
        )}
      </ul>
      {filtered.length > 0 && (
        <p className="shrink-0 px-3 py-1.5 text-[11px] text-slate-400 border-t border-slate-100 bg-slate-50/80">
          {filtered.length} option{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div ref={anchorRef}>
        {!open ? (
          <button
            id={id}
            type="button"
            disabled={disabled}
            onClick={openMenu}
            className={`input-field w-full text-left flex items-center justify-between gap-2 min-h-[44px] ${
              disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:border-primary-300/80'
            }`}
            aria-haspopup="listbox"
            aria-expanded={false}
          >
            <span className={`truncate ${selected ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
              {selected ? selected.name : placeholder}
            </span>
            <FaIcon icon="fa-chevron-down" className="text-xs text-slate-400 shrink-0" />
          </button>
        ) : (
          <div className="relative">
            <FaIcon
              icon="fa-magnifying-glass"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"
            />
            <input
              ref={inputRef}
              id={id}
              type="search"
              autoComplete="off"
              className="input-field w-full pl-9 pr-9 min-h-[44px] ring-2 ring-primary-400/35 border-primary-300"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
                if (e.key === 'Enter' && filtered[0]) pick(filtered[0]);
              }}
              aria-autocomplete="list"
              aria-expanded
              aria-controls={id ? `${id}-listbox` : undefined}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              aria-label="Close"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpen(false)}
            >
              <FaIcon icon="fa-xmark" className="text-sm" />
            </button>
          </div>
        )}
      </div>

      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}

      {typeof document !== 'undefined' && menu && createPortal(menu, document.body)}
    </div>
  );
}
