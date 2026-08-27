export function redirectByRole(role, navigate) {
  if (role === 'CANDIDATE') {
    navigate('/candidate/upload');
  } else {
    navigate('/dashboard');
  }
}
