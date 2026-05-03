import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { company } from '../data/siteData';

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Appointment', to: '/book-appointment' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
  { label: 'Quotation', to: '/request-quotation' },
];

const navClass = ({ isActive }) => (
  `text-sm transition ${isActive ? 'text-accent-600 underline underline-offset-8' : 'muted hover:text-accent-600'}`
);

const Navbar = ({ showDashboardLink = true }) => {
  const { user, theme, toggleTheme, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    setOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 120) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="border-b backdrop-blur-xl bg-white/90 text-slate-950 dark:bg-slate-950/90 dark:text-white" style={{ borderColor: 'rgba(148,163,184,0.16)' }}>
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:-translate-y-0.5">
            <img src="/images/logo.png" alt={company.name} className="h-20 w-auto object-contain" />
          </Link>

          <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/rentals" className={navClass}>Rentals</NavLink>
            {showDashboardLink && !loading && user && <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>}
          </nav>

          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleTheme} className="btn-outline h-10 w-10 px-0" aria-label="Toggle day night mode">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {!loading && !user && (
              <button type="button" onClick={() => navigate('/signin')} className="btn-outline py-2">
                Sign In
              </button>
            )}
            {!loading && user && (
              <button
                type="button"
                onClick={handleLogout}
                className="group grid h-10 w-10 place-items-center rounded-full border border-red-100 bg-red-50 text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-600 hover:text-white"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={17} className="transition group-hover:-translate-x-0.5" />
              </button>
            )}
            <button type="button" onClick={() => setOpen((value) => !value)} className="btn-outline h-10 w-10 px-0 md:hidden" aria-label="Toggle menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t md:hidden bg-white/95 text-slate-950 dark:bg-slate-950/95 dark:text-white" style={{ borderColor: 'rgba(148,163,184,0.16)' }}>
          <div className="container-page flex flex-col gap-3 py-4">
            {[...navItems, { label: 'Rentals', to: '/rentals' }].map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={navClass}>
                {item.label}
              </NavLink>
            ))}
            {showDashboardLink && !loading && user && <NavLink to="/dashboard" onClick={() => setOpen(false)} className={navClass}>Dashboard</NavLink>}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {!loading && !user ? (
                <button type="button" onClick={() => navigate('/signin')} className="btn-outline col-span-2">Sign In</button>
              ) : showDashboardLink ? (
                <button type="button" onClick={() => navigate('/dashboard')} className="btn-outline col-span-2">Portal</button>
              ) : null}
              {!loading && user && (
                <button type="button" onClick={handleLogout} className="btn-outline col-span-2 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                  <LogOut size={16} /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
