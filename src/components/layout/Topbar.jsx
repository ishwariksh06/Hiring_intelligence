import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function Topbar({ title, onMenu = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenu}
          className="rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 md:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="truncate text-[15px] font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-[13px] font-medium text-slate-800">{user?.name}</p>
          <p className="text-[11px] text-slate-400">{user?.title || (user?.role === 'ADMIN' ? 'Administrator' : 'Recruiter')}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white">
          {initials}
        </div>
        <button
          onClick={handleLogout}
          className="ml-1 rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
