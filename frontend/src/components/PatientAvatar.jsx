import { resolveMediaUrl } from '../utils/mediaUrl';

/**
 * @param {{ patient: { avatar?: string, first_name?: string, last_name?: string }, size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }} props
 */
export default function PatientAvatar({ patient, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-10 h-10 text-sm rounded-lg',
    md: 'w-12 h-12 text-base rounded-xl',
    lg: 'w-16 h-16 text-lg rounded-2xl',
    xl: 'w-24 h-24 text-2xl rounded-2xl',
  };
  const sizeClass = sizes[size] || sizes.md;
  const src = resolveMediaUrl(patient?.avatar);
  const initials = `${patient?.first_name?.[0] || ''}${patient?.last_name?.[0] || ''}`.toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${sizeClass} object-cover shrink-0 ring-2 ring-white/80 shadow-sm bg-slate-100 ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${sizeClass} bg-gradient-to-br from-primary-400 to-orange-500 text-white font-bold flex items-center justify-center shrink-0 ring-2 ring-white/80 shadow-sm ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
