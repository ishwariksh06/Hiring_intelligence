import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getById } from '../../db/store';
import { AGENCY } from '../../db/seed';

const ADMIN_NAV = [
  { to: '/dashboard', label: 'Overview', icon: 'grid' },
  { to: '/companies', label: 'Client Companies', icon: 'building' },
  { to: '/ingest', label: 'Resume Ingestion', icon: 'inbox' },
  { to: '/candidates', label: 'Candidate Pool', icon: 'users' },
  { to: '/jobs', label: 'All Jobs', icon: 'briefcase' },
  { to: '/analytics', label: 'Analytics', icon: 'chart' },
];

const RECRUITER_NAV = [
  { to: '/dashboard', label: 'Overview', icon: 'grid' },
  { to: '/jobs', label: 'Jobs & Shortlists', icon: 'briefcase' },
  { to: '/analytics', label: 'Analytics', icon: 'chart' },
  { to: '/reports', label: 'Reports', icon: 'document' },
];

const ICONS = {
  grid: 'M3.75 3.75h6v6h-6v-6zm10.5 0h6v6h-6v-6zm-10.5 10.5h6v6h-6v-6zm10.5 0h6v6h-6v-6z',
  building: 'M3.75 20.25h16.5M5.25 20.25V4.5a.75.75 0 01.75-.75h8.25a.75.75 0 01.75.75v15.75M18 20.25V9.75h1.5a.75.75 0 01.75.75v9.75M8.25 7.5h3m-3 3h3m-3 3h3',
  inbox: 'M3.75 12h4.5l1.5 3h4.5l1.5-3h4.5M4.5 6.75h15a.75.75 0 01.75.75v9a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-9a.75.75 0 01.75-.75z',
  users: 'M15 19.5a6 6 0 00-12 0M9 11.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zm7.5 8.25a5.25 5.25 0 00-3.75-5.02M15 11.25a3 3 0 100-6',
  briefcase: 'M3.75 8.25h16.5v10.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25zM8.25 8.25V6a2.25 2.25 0 012.25-2.25h3A2.25 2.25 0 0115.75 6v2.25M3.75 12.75h16.5',
  chart: 'M3 3v18h18M7 15l3.5-4 3 2.5L18 8',
  document: 'M9 12h6m-6 3.75h6M13.5 3.75H6.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V8.25L13.5 3.75z',
};

function NavIcon({ name }) {
  return (
    <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={ICONS[name]} />
    </svg>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? ADMIN_NAV : RECRUITER_NAV;
  const company = !isAdmin && user?.companyId ? getById('companies', user.companyId) : null;

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-semibold text-slate-900">{AGENCY.name}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400">
          {isAdmin ? 'Agency workspace' : company?.name || 'Client workspace'}
        </p>
      </div>
      <nav className="flex-1 space-y-0.5 px-2.5 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <NavIcon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
        {isAdmin ? 'Administrator access' : 'Client recruiter access'}
      </div>
    </aside>
  );
}
