const STORAGE_KEY = 'tup_saved_doctors';
const LEGACY_KEY = 'urbanphysio_fav_doctors';

function readList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  window.dispatchEvent(new CustomEvent('saved-doctors-changed'));
}

function migrateLegacy() {
  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (!legacyRaw) return;
    const legacy = JSON.parse(legacyRaw);
    if (!Array.isArray(legacy) || legacy.length === 0) {
      localStorage.removeItem(LEGACY_KEY);
      return;
    }
    const list = readList();
    const ids = new Set(list.map((d) => String(d.id)));
    legacy.forEach((id) => {
      const sid = String(id);
      if (!ids.has(sid)) {
        list.push({
          id: Number(id),
          first_name: 'Doctor',
          last_name: `#${id}`,
          saved_at: Date.now(),
        });
      }
    });
    writeList(list);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

migrateLegacy();

export function getSavedDoctors() {
  return readList();
}

export function getSavedDoctorIds() {
  return getSavedDoctors().map((d) => String(d.id));
}

export function isDoctorSaved(doctorId) {
  const id = Number(doctorId);
  return getSavedDoctors().some((d) => Number(d.id) === id);
}

export function toggleSavedDoctor(doctor) {
  const id = Number(doctor?.id);
  if (!id) return { saved: false, list: getSavedDoctors() };

  const list = getSavedDoctors();
  const idx = list.findIndex((d) => Number(d.id) === id);
  let saved;

  if (idx >= 0) {
    list.splice(idx, 1);
    saved = false;
  } else {
    list.unshift({
      id,
      slug: doctor.slug || '',
      first_name: doctor.first_name || 'Doctor',
      last_name: doctor.last_name || '',
      specialization: doctor.specialization || '',
      city_name: doctor.city_name || '',
      avatar: doctor.avatar || '',
      phone: doctor.phone || '',
      consultation_fee: doctor.consultation_fee ?? null,
      saved_at: Date.now(),
    });
    saved = true;
  }

  writeList(list);
  return { saved, list: getSavedDoctors() };
}

export function removeSavedDoctor(doctorId) {
  const id = Number(doctorId);
  const list = getSavedDoctors().filter((d) => Number(d.id) !== id);
  writeList(list);
  return list;
}
