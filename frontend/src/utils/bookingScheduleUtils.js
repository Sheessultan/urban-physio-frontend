export const CUSTOM_PACKAGE_ID = 'custom';
export const SINGLE_PACKAGE_ID = 'single';

export function isStructuredPackageId(packageId) {
  return packageId && packageId !== SINGLE_PACKAGE_ID && packageId !== CUSTOM_PACKAGE_ID;
}

export function isMultiSessionMode(packageId) {
  return isStructuredPackageId(packageId) || packageId === CUSTOM_PACKAGE_ID;
}

export function createEmptySessions(count) {
  const n = Math.max(1, Number(count) || 1);
  return Array.from({ length: n }, () => ({ date: '', time: '' }));
}

/** Fill empty session dates from consecutive available working days; copy session-1 time. */
export function applySmartSessionDefaults(sessions, availableDates, { onlyEmptyDates = true } = {}) {
  if (!Array.isArray(sessions) || !availableDates?.length) return sessions;

  const next = sessions.map((s) => ({ ...s }));
  const anchorTime = next[0]?.time || '';

  for (let i = 0; i < next.length; i++) {
    const suggestedDate = availableDates[i];
    if (!suggestedDate) break;

    if (!onlyEmptyDates || !next[i].date) {
      next[i].date = suggestedDate;
    }

    if (i > 0 && anchorTime && (!next[i].time || next[i].time === anchorTime)) {
      next[i].time = anchorTime;
    }
  }

  if (next[0]?.date && anchorTime) {
    for (let i = 1; i < next.length; i++) {
      if (next[i].date && !next[i].time) next[i].time = anchorTime;
    }
  }

  return next;
}

export function buildSchedulePayload(packageId, scheduleSessions) {
  if (packageId === SINGLE_PACKAGE_ID) {
    const first = scheduleSessions[0];
    if (!first?.date || !first?.time) return [];
    return [{ date: first.date, start_time: first.time, time: first.time }];
  }

  if (isMultiSessionMode(packageId)) {
    return scheduleSessions
      .filter((s) => s.date && s.time)
      .map((s) => ({ date: s.date, start_time: s.time, time: s.time }));
  }

  return [];
}

export function formatSlotLabel(time) {
  if (!time) return '';
  const [h, m] = String(time).slice(0, 5).split(':').map(Number);
  if (Number.isNaN(h)) return time;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateChip(d) {
  if (d === todayIso()) return 'Today';
  return new Date(`${d}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateHeading(d) {
  if (!d) return '';
  return new Date(`${d}T12:00:00`)
    .toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    .toUpperCase();
}

export function packageSessionCount(pkg) {
  if (!pkg) return 1;
  return Math.max(1, Number(pkg.total_sessions || pkg.duration_days || 1));
}
