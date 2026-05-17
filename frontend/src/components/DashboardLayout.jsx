import { NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, CircleUserRound, FileText, Grid2X2, LogOut, Menu, Settings, ShoppingBag, Trash2, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import Navbar from './Navbar';
import { company } from '../data/siteData';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: Grid2X2, end: true },
  { label: 'Profile', to: '/dashboard/profile', icon: UserRound },
  { label: 'Appointments', to: '/dashboard/appointments', icon: CalendarDays },
  { label: 'Rentals', to: '/dashboard/rentals', icon: ShoppingBag },
  { label: 'Quotations', to: '/dashboard/quotations', icon: FileText },
  { label: 'Account', to: '/dashboard/account', icon: Settings },
  { label: 'Delete', to: '/dashboard/delete', icon: Trash2 },
  { label: 'Logout', to: '/dashboard/logout', icon: LogOut },
];

const DashboardLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-white/10 bg-[#080e1c] shadow-lift">
      <div className="px-6 py-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">Customer Portal</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-slate-500">Decoration · Planning · Rentals</p>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) => (
              `flex items-center gap-4 border-l px-4 py-3 text-sm font-semibold tracking-wide transition ${
                isActive
                  ? 'border-white bg-white/10 text-white'
                  : 'border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`
            )}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-5 border-t border-white/10 p-4">
        <button type="button" onClick={() => navigate('/contact')} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-500 hover:text-white">
          <CircleUserRound size={17} /> Support
        </button>
      </div>
    </aside>
  );

  return (
    <div className="page min-h-screen">
      <Navbar />

      <div className="bg-brand-950 text-white lg:grid lg:grid-cols-[280px_1fr]">
        <div className="hidden min-h-[calc(100vh-5rem)] lg:block">{sidebar}</div>
        {open && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-label="Close sidebar" />
            <div className="relative h-full w-[min(86vw,320px)]">
              {sidebar}
              <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white" aria-label="Close dashboard menu">
                <X size={17} />
              </button>
            </div>
          </div>
        )}

        <div className="min-w-0">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-outline w-full border-white/20 text-white hover:bg-white hover:text-brand-950"
              aria-label="Open dashboard menu"
            >
              <Menu size={18} />
              Dashboard Menu
            </button>
          </div>
          <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 md:py-12 lg:px-10 lg:py-14">{children}</main>
          <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 text-[11px] uppercase tracking-[0.18em] text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
            <span>© 2026 {company.name} — Private Portal Access</span>
            <span>Privacy · Security · Terms</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
