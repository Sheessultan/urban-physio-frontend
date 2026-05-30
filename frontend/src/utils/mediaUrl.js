/**
 * Resolve avatar / upload URLs for dev (Vite) and production (XAMPP subpath).
 */
export function resolveMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }
  return url;
}
