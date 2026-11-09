import { NavLink } from 'react-router-dom';
import { BookHeart, FileText, HeartPulse, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/report', label: 'Laporan medis', icon: FileText },
  { to: '/library', label: 'Pustaka kesehatan', icon: BookHeart },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6">
      <header className="no-print glass mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sunset-gradient">
            <HeartPulse size={19} aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold">FemCare Analytics</span>
        </div>

        <nav className="flex flex-wrap items-center gap-1" aria-label="Navigasi utama">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={16} aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-white/70 sm:inline">{user?.name}</span>
          <button onClick={logout} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut size={16} aria-hidden /> Keluar
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
