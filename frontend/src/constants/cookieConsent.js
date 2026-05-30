/**
 * Cookie consent config — align with /cookie-policy
 * Bump COOKIE_CONSENT_VERSION to re-show banner after policy changes.
 */
export const COOKIE_STORAGE_KEY = 'tup_cookie_consent';
export const COOKIE_CONSENT_VERSION = 1;

export const COOKIE_CATEGORIES = [
  {
    id: 'essential',
    label: 'Essential',
    required: true,
    icon: 'fa-shield-halved',
    description:
      'Required for login, security, and booking. Includes session tokens (localStorage) and cannot be disabled.',
  },
  {
    id: 'functional',
    label: 'Functional',
    required: false,
    icon: 'fa-sliders',
    description: 'Remembers your selected city and location preferences for a smoother experience.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    required: false,
    icon: 'fa-chart-line',
    description: 'Helps us understand how the site is used so we can improve performance (optional).',
  },
];

export function readCookieConsent() {
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== COOKIE_CONSENT_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeCookieConsent(prefs) {
  const data = {
    version: COOKIE_CONSENT_VERSION,
    consentedAt: new Date().toISOString(),
    essential: true,
    functional: !!prefs.functional,
    analytics: !!prefs.analytics,
  };
  localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function clearNonEssentialCookieData() {
  localStorage.removeItem('selectedCity');
}

export function hasFunctionalConsent(consent = readCookieConsent()) {
  return consent?.functional === true;
}

export function hasAnalyticsConsent(consent = readCookieConsent()) {
  return consent?.analytics === true;
}
