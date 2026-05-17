import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, ShieldCheck, Sun } from 'lucide-react';
import { loginAdmin } from '../../api/admin';
import { useAuth } from '../../contexts/AuthContext';
import { company, homeCarouselSlides } from '../../data/siteData';
import { getErrorMessage } from '../../utils/format';

const readAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem('theos_admin_user'));
  } catch (error) {
    return null;
  }
};

const AdminLogin = () => {
  const { theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@theosfactory.com', password: 'AdminPass123' });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('theos_admin_token');
    const adminUser = readAdminUser();
    if (token && adminUser?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginAdmin(form);
      localStorage.setItem('theos_admin_token', data.token);
      localStorage.setItem('theos_admin_user', JSON.stringify(data.user));
      if (remember) {
        localStorage.setItem('theos_admin_remember', 'true');
      } else {
        localStorage.removeItem('theos_admin_remember');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Admin login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-950 text-white">
      <main className="grid min-h-screen lg:grid-cols-[42%_58%]">
        <section className="flex min-h-screen flex-col border-r border-white/10 bg-brand-950 px-6 py-8 sm:px-10 lg:px-16">
          <header className="flex items-center justify-between gap-5">
            <Link to="/" className="display text-xl font-bold tracking-[0.18em] text-white">
              {company.name}
            </Link>
            <button type="button" onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white hover:bg-white hover:text-brand-950" aria-label="Toggle day night mode">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </header>

          <div className="flex flex-1 items-center py-14">
            <div className="w-full max-w-md">
              <p className="eyebrow">Theo's Factory Admin</p>
              <h1 className="display mt-5 text-5xl font-bold leading-tight text-white sm:text-6xl">
                Event operations control.
              </h1>
              <p className="mt-6 max-w-sm text-lg leading-8 text-slate-300">
                Manage event decoration, planning, rental inventory, appointments, and quotations from one private workspace.
              </p>

              <form onSubmit={handleSubmit} className="mt-14 space-y-9">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Admin Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="admin@theosfactory.com"
                    className="mt-4 rounded-none border-0 border-b border-white/15 bg-transparent px-0 pb-4 pt-1 text-lg text-white shadow-none placeholder:text-slate-600 focus-visible:ring-0"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Password</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="mt-4 rounded-none border-0 border-b border-white/15 bg-transparent px-0 pb-4 pt-1 text-lg text-white shadow-none placeholder:text-slate-600 focus-visible:ring-0"
                    required
                  />
                </label>

                <div className="flex items-center gap-4 text-xs uppercase tracking-[0.08em] text-slate-400">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 rounded-none border-white/25 bg-transparent p-0"
                    />
                    Remember Session
                  </label>
                </div>

                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-accent w-full py-5 uppercase tracking-[0.28em]">
                  {loading ? 'Verifying...' : 'Enter Admin Portal'} <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          <footer className="border-t border-white/10 pt-8 text-[11px] uppercase tracking-[0.28em] text-slate-500">
            <div className="flex items-center gap-3">
              <ShieldCheck size={14} />
              Authorized Personnel Only
            </div>
            <p className="mt-10 text-right">© 2026</p>
          </footer>
        </section>

        <section className="relative hidden min-h-screen overflow-hidden bg-brand-950 lg:block">
          <img
            src={homeCarouselSlides[0].image}
            onError={(event) => {
              event.currentTarget.src = homeCarouselSlides[0].fallback;
            }}
            alt="Theo's Factory event decoration"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/70 via-black/25 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-brand-950/80" />
          <div className="absolute bottom-12 left-12 max-w-xl">
            <p className="eyebrow">Decoration · Planning · Rentals</p>
            <h2 className="display mt-4 text-5xl font-bold leading-tight">
              A surgical approach to celebration.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Keep the public experience elegant while admin operations stay precise, secure, and ready for scale.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminLogin;
