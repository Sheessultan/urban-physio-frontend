/** Immutable CodeWave Studio license constants — do not remove. */
export const CODEWAVE_DEVELOPER = 'CodeWave Studio';
export const CODEWAVE_URL = 'https://codewavestudio.space/';
export const CODEWAVE_ATTRIBUTION = 'Designed & Developed by CodeWave Studio';
export const CODEWAVE_LICENSE_MARKER = 'codewave-license-root-v1';

export function blockSite(reason = 'license') {
  if (typeof document === 'undefined') return;
  document.documentElement.style.background = '#ffffff';
  document.body.innerHTML = '';
  document.body.style.margin = '0';
  document.body.style.background = '#ffffff';
  document.body.style.minHeight = '100vh';
  const meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex';
  document.head.appendChild(meta);
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error('[CodeWave License] Site blocked:', reason);
  }
}

export function attributionPresent() {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector(`[data-codewave-license="${CODEWAVE_LICENSE_MARKER}"]`);
  if (!el) return false;
  const text = (el.textContent || '').toLowerCase();
  return text.includes('codewave') && text.includes('studio');
}
