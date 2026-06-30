import { getSavedDoctorIds, getSavedDoctors, isDoctorSaved, toggleSavedDoctor } from './savedDoctors';

export function getLocalFavourites() {
  return getSavedDoctorIds();
}

export function setLocalFavourites(ids) {
  const list = getSavedDoctors();
  const keep = new Set(ids.map(String));
  const next = list.filter((d) => keep.has(String(d.id)));
  ids.forEach((id) => {
    if (!next.some((d) => String(d.id) === String(id))) {
      next.push({ id: Number(id), first_name: 'Doctor', last_name: `#${id}` });
    }
  });
  localStorage.setItem('tup_saved_doctors', JSON.stringify(next.slice(0, 50)));
  window.dispatchEvent(new CustomEvent('saved-doctors-changed'));
}

export function toggleLocalFavourite(doctorId, doctor) {
  const payload = doctor?.id ? doctor : { id: doctorId };
  return toggleSavedDoctor(payload).saved;
}

export function isLocalFavourite(doctorId) {
  return isDoctorSaved(doctorId);
}
