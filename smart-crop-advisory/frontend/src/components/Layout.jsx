import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { History as HistoryIcon, LayoutDashboard, LogOut, ShieldCheck, Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const linkCls = ({ isActive }) =>
  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const signOut = () => {
    logout();
    nav('/login');
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-4 flex items-center gap-2 text-lg font-bold text-emerald-700">
            <Sprout className="h-6 w-6" /> Smart Crop Advisory
          </Link>
          <nav className="flex flex-wrap gap-1">
            <NavLink end to="/" className={linkCls}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/recommend" className={linkCls}>
              <Sprout className="h-4 w-4" /> New recommendation
            </NavLink>
            <NavLink to="/history" className={linkCls}>
              <HistoryIcon className="h-4 w-4" /> History
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={linkCls}>
                <ShieldCheck className="h-4 w-4" /> Admin
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-600">
            <span className="hidden sm:inline">{user?.name}</span>
            <button onClick={signOut} className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-slate-100">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
