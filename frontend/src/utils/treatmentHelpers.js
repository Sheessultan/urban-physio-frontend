export const TREATMENT_BODY_AREAS = [
  { id: '', label: 'All', icon: 'fa-table-cells' },
  { id: 'back', label: 'Back', icon: 'fa-bone' },
  { id: 'neck', label: 'Neck', icon: 'fa-head-side-virus' },
  { id: 'knee', label: 'Knee', icon: 'fa-person-walking' },
  { id: 'shoulder', label: 'Shoulder', icon: 'fa-hand' },
  { id: 'sports', label: 'Sports', icon: 'fa-person-running' },
  { id: 'general', label: 'General', icon: 'fa-kit-medical' },
];

const SLUG_ICONS = {
  'back-pain': 'fa-bone',
  'neck-pain': 'fa-head-side-virus',
  'knee-pain': 'fa-person-walking',
};

const AREA_ICONS = {
  back: 'fa-bone',
  neck: 'fa-head-side-virus',
  knee: 'fa-person-walking',
  shoulder: 'fa-hand',
  sports: 'fa-person-running',
  general: 'fa-kit-medical',
};

export function treatmentIcon(slug, bodyArea) {
  return SLUG_ICONS[slug] || AREA_ICONS[bodyArea] || 'fa-kit-medical';
}

export function bodyAreaStyle(area) {
  const map = {
    back: 'bg-blue-100/90 text-blue-800 border-blue-200/60',
    neck: 'bg-cyan-100/90 text-cyan-800 border-cyan-200/60',
    knee: 'bg-emerald-100/90 text-emerald-800 border-emerald-200/60',
    shoulder: 'bg-amber-100/90 text-amber-800 border-amber-200/60',
    sports: 'bg-rose-100/90 text-rose-800 border-rose-200/60',
    general: 'bg-primary-100/90 text-primary-800 border-primary-200/60',
  };
  return map[area] || map.general;
}

export function parsePlanPhases(plan) {
  if (!plan) return [];
  return plan
    .split(/\s*→\s*|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
