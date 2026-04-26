import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, FileText, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyAppointments } from '../../api/appointments';
import { getMyQuotations } from '../../api/quotations';
import { getMyRentals } from '../../api/rentals';
import EmptyState from '../../components/EmptyState';
import SummaryCard from '../../components/SummaryCard';
import { images } from '../../data/siteData';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/format';

const DashboardOverview = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [appointmentData, quotationData, rentalData] = await Promise.all([
          getMyAppointments(token),
          getMyQuotations(token),
          getMyRentals(token),
        ]);
        setAppointments(appointmentData);
        setQuotations(quotationData);
        setRentals(rentalData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const nextAppointment = useMemo(() => appointments[0], [appointments]);
  const activeRental = rentals[0];
  const activeQuote = quotations[0];

  if (loading) {
    return <div className="rounded-lg border border-white/10 bg-[#202020] p-10 text-center text-slate-400">Loading your portal...</div>;
  }

  return (
    <div className="space-y-10 md:space-y-14">
      <section className="relative overflow-hidden rounded-lg border border-white/10 bg-brand-950 p-7 shadow-lift md:p-10 lg:p-12">
        <img src={images.hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/85 to-brand-950/55" />
        <div className="relative max-w-3xl">
          <p className="eyebrow">Client Portal</p>
          <h1 className="display mt-4 text-5xl font-bold italic leading-tight md:text-7xl">
            Welcome back, {user?.name?.split(' ')[0] || 'Guest'}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            Your curation pipeline is active. Review upcoming milestones, active rental configurations, and quotation progress below.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/request-quotation" className="btn-accent">Request New Event <ArrowRight size={16} /></Link>
            <Link to="/gallery" className="btn-outline border-white/20 text-white hover:bg-white hover:text-brand-950">View Portfolio</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 md:gap-5">
        <SummaryCard title="Next Consultation" value={nextAppointment ? formatDate(nextAppointment.preferredDate).slice(0, 6) : '--'} icon={<CalendarDays size={22} />} caption={nextAppointment ? `${nextAppointment.preferredTime} · ${nextAppointment.serviceType}` : 'No appointment scheduled'} />
        <SummaryCard title="Pending Proposals" value={quotations.length.toString().padStart(2, '0')} icon={<FileText size={22} />} tone="blue" caption={activeQuote ? `${activeQuote.status} · ${activeQuote.eventType}` : 'No quotation activity'} />
        <SummaryCard title="Active Rentals" value={rentals.length.toString().padStart(2, '0')} icon={<ShoppingBag size={22} />} caption={activeRental ? `${activeRental.status} · ${activeRental.itemId?.name}` : 'No active rental curation'} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
        <article className="relative overflow-hidden rounded-lg border border-white/10 bg-[#07101d] p-7 text-white shadow-lift md:p-9">
          <img src={activeRental?.itemId?.image || images.lounge} alt="" className="absolute inset-y-0 right-0 hidden h-full w-2/5 object-cover opacity-35 md:block" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07101d] via-[#07101d]/90 to-[#07101d]/70" />
          <div className="relative max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Active Rental Curation</p>
            <h2 className="display mt-6 text-3xl font-bold italic md:text-4xl">
              {activeRental?.itemId?.name || 'No active rental set'}
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              {activeRental
                ? `${activeRental.quantity} pieces reserved from ${formatDate(activeRental.startDate)} to ${formatDate(activeRental.endDate)}.`
                : 'Browse the rental collection to reserve furniture, lighting, textiles, and event details.'}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/dashboard/rentals" className="btn-primary rounded-none uppercase tracking-[0.18em]">Manage Set</Link>
              <Link to="/rentals" className="btn-outline rounded-none border-white/20 text-white hover:bg-white hover:text-brand-950">Details</Link>
            </div>
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-[#0c0c0d] p-7 shadow-soft md:p-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-white">Recent Activity</h2>
          <div className="mt-7 space-y-6">
            {[
              nextAppointment ? `Consultation scheduled for ${formatDate(nextAppointment.preferredDate)}.` : 'Portal opened for new event planning.',
              activeQuote ? `${activeQuote.eventType} quotation is ${activeQuote.status}.` : 'No active quotation review yet.',
              activeRental ? `${activeRental.itemId?.name} rental is ${activeRental.status}.` : 'No active rental return window.',
            ].map((activity, index) => (
              <div key={activity} className="border-l border-white/15 pl-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{index === 0 ? 'Today' : 'Recently'}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{activity}</p>
              </div>
            ))}
          </div>
          <Link to="/dashboard/appointments" className="btn-outline mt-8 w-full rounded-none border-white/15 text-white hover:bg-white hover:text-brand-950">View Full Log</Link>
        </article>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Curation Vault</p>
            <h2 className="display mt-3 text-4xl font-bold italic md:text-5xl">The Event Library</h2>
          </div>
          <Link to="/gallery" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300 hover:text-white">Explore all resources</Link>
        </div>

        {appointments.length || quotations.length || rentals.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ['Technical Specs', 'AV & lighting guidelines', images.sketch],
              ['Visual Direction', 'Aesthetic references', images.table],
              ['Floorplans', 'Walkthrough notes', images.ballroom],
            ].map(([title, copy, image]) => (
              <article key={title} className="group">
                <img src={image} alt="" className="aspect-[4/5] w-full rounded-lg border border-white/10 object-cover opacity-75 transition group-hover:opacity-100" />
                <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-400">{copy}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Your event library is empty" message="Book an appointment or request a quote to begin building your event archive." actionLabel="Start Planning" actionTo="/book-appointment" />
        )}
      </section>
    </div>
  );
};

export default DashboardOverview;
