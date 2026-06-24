const STORAGE_KEY = 'tup_saved_clinics';

export function getSavedClinics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isClinicSaved(clinicId) {
  const id = Number(clinicId);
  return getSavedClinics().some((c) => Number(c.id) === id);
}

export function toggleSavedClinic(clinic) {
  const id = Number(clinic?.id);
  if (!id) return { saved: false, list: getSavedClinics() };

  const list = getSavedClinics();
  const idx = list.findIndex((c) => Number(c.id) === id);
  let saved;

  if (idx >= 0) {
    list.splice(idx, 1);
    saved = false;
  } else {
    list.unshift({
      id,
      slug: clinic.slug || '',
      name: clinic.name || 'Clinic',
      city_name: clinic.city_name || '',
      saved_at: Date.now(),
    });
    saved = true;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  window.dispatchEvent(new CustomEvent('saved-clinics-changed'));
  return { saved, list: getSavedClinics() };
}
