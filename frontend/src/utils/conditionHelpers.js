export const CONDITION_CATEGORIES = [
  { id: '', label: 'All', icon: 'fa-table-cells' },
  { id: 'injury', label: 'Injury', icon: 'fa-user-injured', color: 'rose' },
  { id: 'rehab', label: 'Rehab', icon: 'fa-heart-pulse', color: 'violet' },
  { id: 'chronic', label: 'Chronic', icon: 'fa-clock', color: 'amber' },
  { id: 'sports', label: 'Sports', icon: 'fa-person-running', color: 'emerald' },
];

const SLUG_ICONS = {
  'acl-injury': 'fa-person-running',
  'rotator-cuff': 'fa-hand',
  'post-stroke': 'fa-brain',
  'frozen-shoulder': 'fa-snowflake',
  'tennis-elbow': 'fa-baseball',
  sciatica: 'fa-bone',
  'ankle-sprain': 'fa-shoe-prints',
  parkinsons: 'fa-person-walking',
  'runners-knee': 'fa-person-running',
};

const CATEGORY_ICONS = {
  injury: 'fa-user-injured',
  rehab: 'fa-heart-pulse',
  chronic: 'fa-clock',
  sports: 'fa-person-running',
};

export function conditionIcon(slug, category) {
  return SLUG_ICONS[slug] || CATEGORY_ICONS[category] || 'fa-notes-medical';
}

export function categoryStyle(category) {
  const map = {
    injury: 'bg-rose-100/90 text-rose-800 border-rose-200/60',
    rehab: 'bg-violet-100/90 text-violet-800 border-violet-200/60',
    chronic: 'bg-amber-100/90 text-amber-800 border-amber-200/60',
    sports: 'bg-emerald-100/90 text-emerald-800 border-emerald-200/60',
  };
  return map[category] || 'bg-primary-100/90 text-primary-800 border-primary-200/60';
}

/** Split rehab_program on → or newlines into phases */
export function parseRehabPhases(rehabProgram) {
  if (!rehabProgram) return [];
  return rehabProgram
    .split(/\s*→\s*|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
