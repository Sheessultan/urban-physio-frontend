export function dashboardPath(roleSlug) {
  const paths = {
    super_admin: '/admin',
    admin: '/admin',
    doctor: '/doctor',
    patient: '/patient',
  };
  return paths[roleSlug] || '/';
}

export function navigateAfterAuth(navigate, user, redirectTo) {
  const canUseRedirect =
    redirectTo &&
    ['patient', 'doctor', 'admin', 'super_admin'].includes(user.role_slug);
  if (canUseRedirect) {
    navigate(redirectTo, { replace: true });
  } else {
    navigate(dashboardPath(user.role_slug), { replace: true });
  }
}
