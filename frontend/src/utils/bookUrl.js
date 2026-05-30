/**
 * Build booking URLs with pre-selection query params.
 * Plain `/book` opens the normal empty wizard.
 */

export function bookDoctorUrl(doctorId) {
  if (!doctorId) return '/book';
  return `/doctors/${doctorId}/book`;
}

export function bookClinicUrl(clinicId) {
  if (!clinicId) return '/book?type=clinic';
  return `/book?type=clinic&clinic_id=${clinicId}`;
}

export function bookTreatmentUrl(treatment) {
  if (!treatment) return '/book';
  const params = new URLSearchParams();
  if (treatment.slug) params.set('treatment', treatment.slug);
  else if (treatment.title) params.set('pain_type', treatment.title);
  const q = params.toString();
  return q ? `/book?${q}` : '/book';
}

export function bookConditionUrl(condition) {
  if (!condition) return '/book';
  const params = new URLSearchParams();
  if (condition.slug) params.set('condition', condition.slug);
  else if (condition.title) params.set('condition_title', condition.title);
  const q = params.toString();
  return q ? `/book?${q}` : '/book';
}

/** Match treatment/condition title to admin pain-type labels */
export function matchPainTypeLabel(title, painTypes = []) {
  if (!title) return '';
  const cleaned = title.replace(/\s+treatment$/i, '').replace(/\s+rehabilitation$/i, '').trim();
  if (painTypes.includes(cleaned)) return cleaned;
  const lower = cleaned.toLowerCase();
  const hit = painTypes.find(
    (p) => lower.includes(p.toLowerCase()) || p.toLowerCase().includes(lower.split(' ')[0])
  );
  return hit || cleaned;
}

export function matchHomeConditionLabel(title, homeConditions = []) {
  if (!title || !homeConditions.length) return '';
  const lower = title.toLowerCase();
  return homeConditions.find((c) => lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower.split(' ')[0])) || '';
}
