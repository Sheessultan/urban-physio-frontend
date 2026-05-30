/** Normalize login/verify/google API responses (axios interceptor already unwraps axios.data). */
export function extractAuthSession(res) {
  if (!res) return null;
  if (res.token && res.user) return { token: res.token, user: res.user };
  if (res.data?.token && res.data?.user) return { token: res.data.token, user: res.data.user };
  return null;
}

/** Normalize /auth/me (or profile) payload — never treat a bad body as "logged out". */
export function normalizeAuthUser(res) {
  if (!res || typeof res !== 'object') return null;
  const data = res.data ?? res;
  if (!data || typeof data !== 'object') return null;
  if (data.user && typeof data.user === 'object' && data.user.role_slug) return data.user;
  if (data.role_slug && (data.id != null || data.email)) return data;
  return null;
}

export function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function hasStoredToken() {
  return Boolean(localStorage.getItem('token')?.trim());
}
