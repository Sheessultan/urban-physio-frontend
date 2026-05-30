export function googleMapsUrl(lat, lng) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function clinicLocationText(appt) {
  if (!appt || appt.consultation_type !== 'clinic') return null;
  const parts = [appt.clinic_name, appt.clinic_address].filter(Boolean);
  return parts.join(' — ') || appt.doctor_address || null;
}
