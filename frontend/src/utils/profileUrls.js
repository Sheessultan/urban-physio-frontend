/** SEO-friendly public profile URLs */

export function doctorProfileUrl(doctor) {
  if (!doctor) return '/doctors';
  if (doctor.slug) return `/doctor/${encodeURIComponent(doctor.slug)}`;
  if (doctor.id) return `/doctors/${doctor.id}`;
  return '/doctors';
}

export function clinicProfileUrl(clinic) {
  if (!clinic) return '/clinics';
  if (clinic.slug) return `/clinic/${encodeURIComponent(clinic.slug)}`;
  if (clinic.id) return `/clinic/id/${clinic.id}`;
  return '/clinics';
}

export function doctorBookUrl(doctor) {
  if (!doctor) return '/book';
  if (doctor.id) return `/doctors/${doctor.id}/book`;
  return '/book';
}

export function clinicBookUrl(clinic) {
  if (!clinic?.id) return '/book?type=clinic';
  return `/book?type=clinic&clinic_id=${clinic.id}`;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatAvailabilitySummary(slots = []) {
  if (!slots.length) return 'Contact for availability';
  const byDay = {};
  slots.forEach((s) => {
    const d = Number(s.day_of_week);
    const label = DAY_NAMES[d] ?? `Day ${d}`;
    const range = `${String(s.start_time).slice(0, 5)}–${String(s.end_time).slice(0, 5)}`;
    byDay[label] = byDay[label] ? `${byDay[label]}, ${range}` : range;
  });
  return Object.entries(byDay)
    .map(([day, time]) => `${day}: ${time}`)
    .join(' · ');
}

export function formatOpeningHours(hours) {
  if (!hours || typeof hours !== 'object') return null;
  return Object.entries(hours)
    .map(([day, slots]) => {
      const list = Array.isArray(slots) ? slots.join(', ') : String(slots);
      return `${day.charAt(0).toUpperCase()}${day.slice(1)}: ${list}`;
    })
    .join(' · ');
}
