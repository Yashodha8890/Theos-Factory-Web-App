import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import FormInput from '../components/FormInput';
import { useAuth } from '../contexts/AuthContext';
import { company, images } from '../data/siteData';
import { getErrorMessage } from '../utils/format';

const Signin = () => {
  const { signIn, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'avery@theosfactory.com', password: 'DemoPass123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signIn(form);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Sign in failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page min-h-screen">
      <div className="grid min-h-[calc(100vh-76px)] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-brand-950 text-white lg:block">
          <img src={images.auth} alt="Luxury event reception" className="absolute inset-0 h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-black/45" />
          <Link to="/" className="absolute left-12 top-10 display text-2xl font-bold">{company.name}</Link>
          <div className="absolute bottom-14 left-12 max-w-lg">
            <div className="mb-6 h-px w-16 bg-accent-400" />
            <p className="display text-3xl font-bold italic">Quiet excellence for unforgettable moments.</p>
            <p className="mt-8 text-xl leading-8 text-slate-200">Access your event portal for appointments, quotations, rental bookings, and profile management.</p>
          </div>
        </section>

        <section className="flex flex-col">
          <header className="flex items-center justify-between px-6 py-6 lg:px-14">
            <Link to="/" className="display text-xl font-bold lg:hidden">{company.name}</Link>
            <nav className="ml-auto flex items-center gap-6 text-sm muted">
              <Link to="/services">Services</Link>
              <Link to="/gallery">Portfolio</Link>
              <button type="button" onClick={toggleTheme} className="btn-outline h-10 w-10 px-0" aria-label="Toggle day night mode">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </nav>
          </header>

          <main className="flex flex-1 items-center px-6 py-10 lg:px-20">
            <div className="mx-auto w-full max-w-xl">
              <p className="eyebrow">Member Access</p>
              <h1 className="display mt-6 text-4xl font-bold">Welcome Back</h1>
              <p className="mt-5 max-w-md text-lg leading-8 muted">Enter your credentials to manage your upcoming events.</p>

              <form onSubmit={handleSubmit} className="mt-14 space-y-8">
                <FormInput label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="e.g. jameson@firm.com" required />
                <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                <label className="flex items-center gap-3 text-sm muted">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 p-0" />
                  Maintain session for 30 days
                </label>
                {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full py-4 uppercase tracking-[0.25em]">
                  {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={17} />
                </button>
              </form>

              <div className="mt-8 flex items-center justify-between border-t pt-6 text-sm muted" style={{ borderColor: 'var(--line)' }}>
                <span>New to the network?</span>
                <Link to="/signup" className="font-bold text-[var(--ink)] underline underline-offset-4">Create an account</Link>
              </div>
              <p className="mt-20 text-xs leading-6 muted">Demo user: avery@theosfactory.com / DemoPass123</p>
            </div>
          </main>
        </section>
      </div>
      <footer className="border-t px-6 py-8 text-xs muted lg:px-14" style={{ borderColor: 'var(--line)' }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span className="display text-xl font-bold text-[var(--ink)]">{company.name}</span>
          <span>© 2026 THEOS FACTORY HOSPITALITY GROUP</span>
        </div>
      </footer>
    </div>
  );
};

export default Signin;
