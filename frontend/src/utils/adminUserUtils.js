export const ROLE_STYLES = {
  doctor: 'bg-violet-100 text-violet-800 border-violet-200',
  patient: 'bg-sky-100 text-sky-800 border-sky-200',
  admin: 'bg-slate-200 text-slate-800 border-slate-300',
  super_admin: 'bg-slate-800 text-white border-slate-700',
};

export const ROLE_ICONS = {
  doctor: 'fa-user-doctor',
  patient: 'fa-user',
  admin: 'fa-user-shield',
  super_admin: 'fa-crown',
};

export function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(d) {
  if (!d) return '—';
  const s = String(d).slice(0, 10);
  return new Date(s + 'T12:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function userLabel(u) {
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'User';
}

export function userSearchBlob(u) {
  return [
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.city_name,
    u.specialization,
    u.role_slug,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
