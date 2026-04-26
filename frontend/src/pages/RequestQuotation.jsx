import { useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, DollarSign, Layers3, PhoneCall } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { requestQuotation } from '../api/quotations';
import FormInput from '../components/FormInput';
import { useAuth } from '../contexts/AuthContext';
import { company, images } from '../data/siteData';
import { getErrorMessage } from '../utils/format';

const initialForm = {
  eventType: 'Corporate Gala',
  eventDate: '',
  guestCount: '',
  budgetRange: '$25k - $50k',
  serviceCategory: 'Decoration, Planning, Rentals',
  notes: '',
};

const serviceOptions = ['Decoration', 'Planning', 'Rentals'];

const RequestQuotation = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setStatus('');
  };

  const setService = (service) => {
    const current = form.serviceCategory.split(',').map((item) => item.trim()).filter(Boolean);
    const next = current.includes(service) ? current.filter((item) => item !== service) : [...current, service];
    setForm((prev) => ({ ...prev, serviceCategory: next.join(', ') }));
  };

  const validate = () => {
    const next = {};
    if (!form.eventType) next.eventType = 'Choose an event type';
    if (!form.eventDate) next.eventDate = 'Choose an event date';
    if (!form.guestCount) next.guestCount = 'Guest count is required';
    if (!form.budgetRange) next.budgetRange = 'Budget range is required';
    if (!form.serviceCategory) next.serviceCategory = 'Select at least one service';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    if (!user || !token) {
      navigate('/signin?next=/request-quotation');
      return;
    }

    setLoading(true);
    try {
      await requestQuotation(form, token);
      setStatus('Quotation request submitted. Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard/quotations'), 700);
    } catch (error) {
      setErrors({ submit: getErrorMessage(error, 'Unable to submit quotation') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="container-page py-16">
        <div className="max-w-3xl">
          <p className="eyebrow">Exquisite Planning</p>
          <h1 className="display mt-4 text-5xl font-bold md:text-6xl">Request a quotation</h1>
          <p className="mt-6 text-lg leading-8 muted">
            Share your vision and our team will curate a bespoke logistical and aesthetic proposal tailored to your requirements.
          </p>
        </div>

        {!user && (
          <div className="mt-8 rounded-lg border border-accent-300 bg-accent-50 p-5 text-sm text-accent-900">
            Sign in or create an account before submitting a quotation request. You can review the form first.
            <Link to="/signin?next=/request-quotation" className="ml-2 font-bold underline">Sign In</Link>
          </div>
        )}

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">
          <form onSubmit={handleSubmit} className="card p-6 md:p-10">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-100 text-accent-700"><CalendarDays size={21} /></span>
              <h2 className="display text-3xl font-bold">Event Details</h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <FormInput label="Event Type" name="eventType" as="select" value={form.eventType} onChange={handleChange} error={errors.eventType} required>
                <option>Corporate Gala</option>
                <option>Wedding</option>
                <option>Private Dinner</option>
                <option>Birthday Celebration</option>
                <option>Product Launch</option>
              </FormInput>
              <FormInput label="Preferred Date" type="date" name="eventDate" value={form.eventDate} onChange={handleChange} error={errors.eventDate} required />
              <FormInput label="Guest Count" name="guestCount" placeholder="Estimated attendance" value={form.guestCount} onChange={handleChange} error={errors.guestCount} required />
              <FormInput label="Location Preference" placeholder="City or specific venue" />
            </div>

            <div className="mt-10 flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-100 text-accent-700"><Layers3 size={21} /></span>
              <h2 className="display text-3xl font-bold">Services Needed</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {serviceOptions.map((service) => {
                const active = form.serviceCategory.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => setService(service)}
                    className={`rounded-lg border p-5 text-left transition ${active ? 'border-accent-500 bg-accent-50 text-accent-950 dark:bg-accent-400/10 dark:text-accent-100' : 'panel'}`}
                  >
                    <span className="text-xs uppercase tracking-[0.2em] muted">Service</span>
                    <h3 className="mt-6 font-semibold">{service}</h3>
                    <p className="mt-2 text-sm leading-6 muted">{service === 'Decoration' ? 'Floral, lighting, and thematic design.' : service === 'Planning' ? 'End-to-end logistical management.' : 'Furniture, linens, and tableware.'}</p>
                  </button>
                );
              })}
            </div>
            {errors.serviceCategory && <p className="mt-2 text-xs font-semibold text-red-500">{errors.serviceCategory}</p>}

            <div className="mt-10 flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-100 text-accent-700"><DollarSign size={21} /></span>
              <h2 className="display text-3xl font-bold">Contact & Budget</h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <FormInput label="Full Name" value={user?.name || ''} placeholder="Sign in to attach your name" readOnly />
              <FormInput label="Email Address" value={user?.email || ''} placeholder="Sign in to attach your email" readOnly />
              <FormInput label="Budget Range" name="budgetRange" as="select" value={form.budgetRange} onChange={handleChange} error={errors.budgetRange} required>
                <option>$10k - $25k</option>
                <option>$25k - $50k</option>
                <option>$50k - $100k</option>
                <option>$100k+</option>
              </FormInput>
              <FormInput label="Project Notes" name="notes" as="textarea" rows="4" className="md:col-span-2" value={form.notes} onChange={handleChange} placeholder="Tell us about your atmosphere, venue, theme, and must-have details..." />
            </div>

            {errors.submit && <p className="mt-6 text-sm font-semibold text-red-500">{errors.submit}</p>}
            {status && <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 size={17} /> {status}</p>}

            <button type="submit" disabled={loading} className="btn-primary mt-8 w-full">
              {loading ? 'Submitting...' : 'Submit Quote Request'} <ArrowRight size={17} />
            </button>
          </form>

          <aside className="space-y-6">
            <div className="relative overflow-hidden rounded-lg bg-brand-950 p-8 text-white shadow-lift">
              <img src={images.chandeliers} alt="Event inspiration" className="absolute inset-0 h-full w-full object-cover opacity-35" />
              <p className="relative display mt-28 text-2xl italic">"Precision in every detail, luxury in every moment."</p>
            </div>
            <div className="rounded-lg border border-accent-200 bg-accent-50 p-8 text-accent-950 dark:border-accent-400/20 dark:bg-accent-400/10 dark:text-accent-100">
              <h3 className="display text-2xl font-bold">What happens next?</h3>
              <div className="mt-6 space-y-5 text-sm">
                {['Consultation within 24 hours', 'Draft proposal and mood board', 'Final scope and booking confirmation'].map((step, index) => (
                  <p key={step} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-600 text-xs font-bold text-white">{index + 1}</span>{step}</p>
                ))}
              </div>
            </div>
            <div className="card p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] muted">Need Help?</p>
              <p className="mt-4 flex items-center gap-3 display text-xl font-bold"><PhoneCall size={20} className="text-accent-600" /> {company.phone}</p>
              <p className="mt-2 text-sm muted">{company.cityLine} · {company.email}</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default RequestQuotation;
