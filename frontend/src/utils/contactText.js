/**
 * Display contact/footer text from API (fixes legacy &amp; without HTML parsing).
 */
export function displayContactText(value) {
  if (value == null || value === '') return '';
  let text = String(value);
  text = text
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+\?\s+/g, ' - ');
  return text.trim();
}

/** Unwrap axios body { success, data } → settings object */
export function unwrapApiData(res) {
  if (!res || typeof res !== 'object') return {};
  if (res.data !== undefined && (res.success === true || res.success === false)) {
    return res.data ?? {};
  }
  return res;
}
