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
    (user.role_slug === 'patient' ||
      user.role_slug === 'admin' ||
      user.role_slug === 'super_admin');
  if (canUseRedirect) {
    navigate(redirectTo, { replace: true });
  } else {
    navigate(dashboardPath(user.role_slug), { replace: true });
  }
}
