import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import FormInput from '../components/FormInput';
import { useAuth } from '../contexts/AuthContext';
import { company, images } from '../data/siteData';
import { getErrorMessage } from '../utils/format';

const Signup = () => {
  const { signUp, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Sign up failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-brand-950 text-white lg:block">
          <img src={images.table} alt="Formal event table" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-black/45" />
          <Link to="/" className="absolute left-12 top-10 display text-2xl font-bold">{company.name}</Link>
          <div className="absolute bottom-14 left-12 max-w-lg">
            <p className="eyebrow">Client Access</p>
            <h2 className="display mt-5 text-5xl font-bold">Create your event portal.</h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">Book consultations, request quotations, and manage rental items from one polished workspace.</p>
          </div>
        </section>

        <section className="flex min-h-screen flex-col">
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
              <p className="eyebrow">Guest Portal</p>
              <h1 className="display mt-6 text-4xl font-bold">Create Account</h1>
              <p className="mt-5 max-w-md text-lg leading-8 muted">Join Theo's Factory to book appointments, request quotations, and reserve rental inventory.</p>

              <form onSubmit={handleSubmit} className="mt-12 grid gap-6 md:grid-cols-2">
                <FormInput className="md:col-span-2" label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Avery Stone" required />
                <FormInput label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="avery@example.com" required />
                <FormInput label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder={company.phone} />
                <FormInput className="md:col-span-2" label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Minimum 6 characters" required />
                {error && <p className="text-sm font-semibold text-red-500 md:col-span-2">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full py-4 md:col-span-2">
                  {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={17} />
                </button>
              </form>

              <div className="mt-8 flex items-center justify-between border-t pt-6 text-sm muted" style={{ borderColor: 'var(--line)' }}>
                <span>Already have an account?</span>
                <Link to="/signin" className="font-bold text-[var(--ink)] underline underline-offset-4">Sign In</Link>
              </div>
            </div>
          </main>
        </section>
      </div>
    </div>
  );
};

export default Signup;
