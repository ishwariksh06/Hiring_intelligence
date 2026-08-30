export function landingPathForRole() {
  return '/dashboard';
}

export function redirectByRole(role, navigate) {
  navigate(landingPathForRole(role));
}
