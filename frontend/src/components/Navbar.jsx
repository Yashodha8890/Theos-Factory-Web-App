import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { company } from '../data/siteData';

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

const navClass = ({ isActive }) => (
  `text-sm transition ${isActive ? 'text-accent-600 underline underline-offset-8' : 'muted hover:text-accent-600'}`
);

const Navbar = () => {
  const { user, theme, toggleTheme, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--surface) 92%, transparent)', borderColor: 'var(--line)' }}>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="display text-xl font-bold tracking-[0.18em] text-[var(--ink)]">
          {company.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/rentals" className={navClass}>Rentals</NavLink>
          {!loading && user && <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-outline h-10 w-10 px-0"
            aria-label="Toggle day night mode"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          {!loading && !user && (
            <button type="button" onClick={() => navigate('/signin')} className="btn-outline py-2">
              Sign In
            </button>
          )}
          <button type="button" onClick={() => navigate('/book-appointment')} className="btn-accent py-2">
            Book Now
          </button>
        </div>

        <button type="button" onClick={() => setOpen((value) => !value)} className="btn-outline h-10 w-10 px-0 md:hidden" aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t md:hidden" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
          <div className="container-page flex flex-col gap-3 py-4">
            {[...navItems, { label: 'Rentals', to: '/rentals' }].map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={navClass}>
                {item.label}
              </NavLink>
            ))}
            {!loading && user && <NavLink to="/dashboard" onClick={() => setOpen(false)} className={navClass}>Dashboard</NavLink>}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={toggleTheme} className="btn-outline">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Day' : 'Night'}
              </button>
              {!loading && !user ? (
                <button type="button" onClick={() => navigate('/signin')} className="btn-outline">Sign In</button>
              ) : (
                <button type="button" onClick={() => navigate('/dashboard')} className="btn-outline">Portal</button>
              )}
              <button type="button" onClick={() => navigate('/book-appointment')} className="btn-accent col-span-2">Book Now</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
