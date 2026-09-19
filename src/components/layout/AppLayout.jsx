import { useState } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const matches = useMatches();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = [...matches].reverse().find((m) => m.handle?.title);
  const title = current?.handle?.title || 'Hiring Intelligence Platform';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
