import { useState } from 'react';
import { ArrowRight, CheckCircle2, CircleUserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { bookAppointment } from '../api/appointments';
import FormInput from '../components/FormInput';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/format';

const initialForm = {
  serviceType: 'Decoration Consultation',
  preferredDate: '',
  preferredTime: '11:30',
  notes: '',
};

const BookAppointment = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setStatus('');
  };

  const validate = () => {
    const next = {};
    if (!form.serviceType) next.serviceType = 'Choose a service';
    if (!form.preferredDate) next.preferredDate = 'Choose a date';
    if (!form.preferredTime) next.preferredTime = 'Choose a time';
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
      navigate('/signin?next=/book-appointment');
      return;
    }

    setLoading(true);
    try {
      await bookAppointment(form, token);
      setStatus('Appointment confirmed. Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard/appointments'), 700);
    } catch (error) {
      setErrors({ submit: getErrorMessage(error, 'Unable to book appointment') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="container-page py-16">
        <SectionHeader
          eyebrow="Consultation Booking"
          title="Secure Your Appointment Today"
          copy="Schedule a private consultation with our creative team to discuss your vision, event needs, and service timeline."
        />

        {!user && (
          <div className="mt-12 flex flex-col gap-4 rounded-lg border border-accent-300 bg-accent-50 p-5 text-accent-900 md:flex-row md:items-center md:justify-between">
            <p className="flex items-center gap-3 text-sm"><CircleUserRound size={19} /> Already have an account? Sign in for faster booking and event history.</p>
            <Link to="/signin?next=/book-appointment" className="btn-outline border-accent-700 text-accent-900">Sign In</Link>
          </div>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.75fr_1.45fr]">
          <aside>
            <h2 className="display text-3xl font-bold">The Process</h2>
            <div className="mt-8 space-y-8">
              {[
                ['Select Your Slot', 'Choose a time that suits your schedule. Consultations are conducted by video or in person.'],
                ['Briefing Call', 'A focused deep dive into requirements, budget, mood, rentals, and aesthetic preferences.'],
                ['Concept Proposal', 'Receive a preliminary vision board and logistical outline within 48 hours.'],
              ].map(([title, copy]) => (
                <div key={title} className="flex gap-5">
                  <span className="mt-1 h-8 w-8 shrink-0 rounded-full bg-brand-950 dark:bg-white" />
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 muted">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 rounded-lg bg-[url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80')] bg-cover p-6 text-brand-950 shadow-soft">
              <div className="rounded-md bg-white/80 p-5 backdrop-blur">
                <h3 className="display text-xl">Our Studio</h3>
                <p className="mt-3 text-sm leading-6">Visits are by appointment only for rental reviews and design consultation.</p>
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="card p-6 md:p-10">
            <p className="eyebrow">1. Choose Date & Time</p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <FormInput label="Preferred Date" name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange} error={errors.preferredDate} required />
              <FormInput label="Preferred Time" name="preferredTime" as="select" value={form.preferredTime} onChange={handleChange} error={errors.preferredTime} required>
                <option value="09:00">09:00 AM - 09:30 AM</option>
                <option value="11:30">11:30 AM - 12:00 PM</option>
                <option value="14:00">02:00 PM - 02:30 PM</option>
                <option value="16:30">04:30 PM - 05:00 PM</option>
              </FormInput>
            </div>

            <div className="my-10 border-t" style={{ borderColor: 'var(--line)' }} />

            <p className="eyebrow">2. Event Details</p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <FormInput label="Full Name" value={user?.name || ''} placeholder="Sign in to attach your name" readOnly />
              <FormInput label="Email Address" value={user?.email || ''} placeholder="Sign in to attach your email" readOnly />
              <FormInput label="Event Type" name="serviceType" as="select" className="md:col-span-2" value={form.serviceType} onChange={handleChange} error={errors.serviceType} required>
                <option>Decoration Consultation</option>
                <option>Planning Review</option>
                <option>Rental Collection Review</option>
                <option>Full Event Consultation</option>
              </FormInput>
              <FormInput label="Project Brief & Vision" name="notes" as="textarea" rows="5" className="md:col-span-2" placeholder="Briefly describe your event goals, guest count, and desired atmosphere..." value={form.notes} onChange={handleChange} />
            </div>

            {errors.submit && <p className="mt-6 text-sm font-semibold text-red-500">{errors.submit}</p>}
            {status && <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 size={17} /> {status}</p>}

            <button type="submit" disabled={loading} className="btn-primary mt-8 w-full">
              {loading ? 'Confirming...' : 'Confirm Appointment'} <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default BookAppointment;
