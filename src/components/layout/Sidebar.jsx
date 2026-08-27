import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RECRUITER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/jobs', label: 'Jobs', icon: 'briefcase' },
  { to: '/upload', label: 'Resume Upload', icon: 'upload' },
  { to: '/assistant', label: 'AI Assistant', icon: 'chat' },
  { to: '/analytics', label: 'Analytics', icon: 'chart' },
  { to: '/reports', label: 'Reports', icon: 'document' },
];

const CANDIDATE_NAV = [
  { to: '/candidate/upload', label: 'Upload Resume', icon: 'upload' },
  { to: '/candidate/status', label: 'Application Status', icon: 'document' },
];

const ICONS = {
  grid: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 3.75h6v6h-6v-6zm10.5 0h6v6h-6v-6zm-10.5 10.5h6v6h-6v-6zm10.5 0h6v6h-6v-6z" />
  ),
  briefcase: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 8.25h16.5v10.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25zM8.25 8.25V6a2.25 2.25 0 012.25-2.25h3A2.25 2.25 0 0115.75 6v2.25M3.75 12.75h16.5" />
  ),
  upload: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 16.5V4.5m0 0L6.75 9.75M12 4.5l5.25 5.25M4.5 19.5h15" />
  ),
  chat: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.25 12.75h.008v.008H8.25v-.008zm3.75 0h.008v.008H12v-.008zm3.75 0h.008v.008h-.008v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0zM5.25 19.5l-1.5 1.5.375-2.25" />
  ),
  chart: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 3v18h18M7 15l3.5-4 3 2.5L18 8" />
  ),
  document: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 3.75h6M13.5 3.75H6.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V8.25L13.5 3.75z" />
  ),
};

function NavIcon({ name }) {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {ICONS[name]}
    </svg>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const navItems = user?.role === 'CANDIDATE' ? CANDIDATE_NAV : RECRUITER_NAV;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">
          HI
        </div>
        <span className="text-sm font-semibold text-slate-800">Hiring Intelligence</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <NavIcon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-400">
        AI-Powered Hiring Intelligence
      </div>
    </aside>
  );
}
