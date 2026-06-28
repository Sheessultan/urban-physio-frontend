/** SEO city listing URL helpers (must match backend CitySeoHelper path prefixes). */

export const CITY_CLINIC_SEO_PREFIX = '/best-physiotherapy-clinic-in/';
export const CITY_DOCTOR_SEO_PREFIX = '/best-physiotherapist-in/';

export function cityClinicsSeoUrl(cityOrSlug) {
  const slug = typeof cityOrSlug === 'string' ? cityOrSlug : cityOrSlug?.slug;
  if (!slug) return '/clinics';
  return `${CITY_CLINIC_SEO_PREFIX}${encodeURIComponent(slug)}`;
}

export function cityDoctorsSeoUrl(cityOrSlug) {
  const slug = typeof cityOrSlug === 'string' ? cityOrSlug : cityOrSlug?.slug;
  if (!slug) return '/doctors';
  return `${CITY_DOCTOR_SEO_PREFIX}${encodeURIComponent(slug)}`;
}
