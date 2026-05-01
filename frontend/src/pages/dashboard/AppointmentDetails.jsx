import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, MoreVertical, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyAppointments } from '../../api/appointments';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { images } from '../../data/siteData';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/format';

const AppointmentDetails = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAppointments(token)
      .then(setAppointments)
      .catch((error) => console.error('Failed to load appointments:', error))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingSpinner label="Loading appointments" />;
  const featured = appointments[0];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Event Management</p>
          <h1 className="display mt-3 text-4xl font-bold md:text-6xl">Appointment Details</h1>
          <p className="mt-4 text-lg muted">Manage upcoming design consultations, venue walk-throughs, and planning sessions.</p>
        </div>
        <Link to="/book-appointment" className="btn-primary">Book New <ArrowRight size={16} /></Link>
      </section>

      {!appointments.length ? (
        <EmptyState title="No appointments booked" message="Book a consultation and it will appear here." actionLabel="Book Appointment" actionTo="/book-appointment" />
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.65fr]">
            <article className="card overflow-hidden p-0 text-slate-950 dark:text-slate-100 md:grid md:grid-cols-[320px_1fr]">
              <img src={images.table} alt="Featured event appointment" className="h-full min-h-[360px] w-full object-cover" />
              <div className="p-8">
                <span className="status-pill bg-accent-100 text-accent-800">{featured.status}</span>
                <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="display text-4xl font-bold">{featured.serviceType}</h2>
                    <p className="mt-3 text-lg muted">Theo's Factory Studio · Virtual or in-person</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm uppercase tracking-[0.2em] text-accent-700">{formatDate(featured.preferredDate).split(',')[0]}</p>
                    <p className="display text-4xl font-bold">{featured.preferredTime}</p>
                  </div>
                </div>
                <div className="mt-10 grid gap-6 border-t pt-8 sm:grid-cols-2" style={{ borderColor: 'var(--line)' }}>
                  <p className="flex items-center gap-3"><UserRound className="text-accent-600" /> <span><span className="block text-xs uppercase muted">Coordinator</span> Julianne Vance</span></p>
                  <p className="flex items-center gap-3"><Clock3 className="text-accent-600" /> <span><span className="block text-xs uppercase muted">Duration</span> 90 Minutes</span></p>
                </div>
                {featured.notes && <p className="mt-8 text-sm leading-7 muted">{featured.notes}</p>}
              </div>
            </article>

            <article className="card p-8 text-slate-950 dark:text-slate-100">
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-accent-100 text-accent-700"><CalendarDays /></span>
              <h2 className="display mt-10 text-4xl font-bold">Next Consultation</h2>
              <div className="mt-8 space-y-4 text-sm">
                <p className="flex justify-between"><span className="muted">Date</span><strong>{formatDate(featured.preferredDate)}</strong></p>
                <p className="flex justify-between"><span className="muted">Time</span><strong>{featured.preferredTime}</strong></p>
                <p className="flex justify-between"><span className="muted">Status</span><strong>{featured.status}</strong></p>
              </div>
              <Link to="/book-appointment" className="btn-outline mt-10 w-full">Modify Request</Link>
            </article>
          </section>

          <section className="card overflow-hidden text-slate-950 dark:text-slate-100">
            <div className="flex items-center justify-between p-6">
              <h2 className="display text-2xl font-bold">Additional Consultations</h2>
              <MoreVertical className="muted" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead style={{ background: 'var(--surface-soft)' }}>
                  <tr className="text-slate-600 dark:text-slate-300">
                    <th className="px-6 py-4 font-semibold">Service Type</th>
                    <th className="px-6 py-4 font-semibold">Date & Time</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                      <td className="px-6 py-5 font-semibold text-slate-950 dark:text-slate-100">{appointment.serviceType}</td>
                      <td className="px-6 py-5 text-slate-700 dark:text-slate-200">{formatDate(appointment.preferredDate)} · {appointment.preferredTime}</td>
                      <td className="px-6 py-5"><span className="status-pill bg-accent-100 text-accent-800">{appointment.status}</span></td>
                      <td className="px-6 py-5 muted">{appointment.notes || 'No notes'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AppointmentDetails;
