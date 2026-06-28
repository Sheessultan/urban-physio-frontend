const RECENT_KEY = 'urban_recent_searches';
const MAX_RECENT = 8;

export const TRENDING_SEARCHES = [
  'Back pain',
  'Knee pain',
  'Neck pain',
  'Sports injury',
  'Physio in Noida',
  'Home visit physiotherapy',
  'Shoulder pain',
  'Post surgery rehab',
];

export const SEARCH_SUGGESTIONS = [
  'Physiotherapist near me',
  'Physio clinic near me',
  'Online physiotherapy',
  'Sports injury rehab',
  'Back pain treatment',
  'Knee pain specialist',
];

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s === 'string' && s.trim()) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(term) {
  const q = String(term || '').trim();
  if (q.length < 2) return;
  const prev = getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
  const next = [q, ...prev].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}
