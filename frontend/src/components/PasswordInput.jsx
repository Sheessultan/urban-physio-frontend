import { useState } from 'react';
import FaIcon from './FaIcon';

/**
 * Password field with show/hide toggle. Forwards standard input props.
 */
export default function PasswordInput({
  id,
  label,
  labelExtra,
  className = '',
  wrapperClassName = '',
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
  name,
  disabled,
}) {
  const [visible, setVisible] = useState(false);
  const inputId = id || (label ? `password-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={wrapperClassName}>
      {(label || labelExtra) && (
        <div className="flex justify-between items-center mb-1">
          {label ? (
            <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
              {label}
            </label>
          ) : (
            <span />
          )}
          {labelExtra}
        </div>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          className={`input-field pr-11 ${className}`.trim()}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          disabled={disabled}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <FaIcon icon={visible ? 'fa-eye-slash' : 'fa-eye'} className="text-base" />
        </button>
      </div>
    </div>
  );
}
