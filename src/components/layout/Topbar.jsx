import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title }) {
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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-[15px] font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
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
