import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Grid2X2,
  HelpCircle,
  Images,
  LogOut,
  Mail,
  MapPin,
  Package,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  UserRound,
  Users,
} from 'lucide-react';
import {
  getAdminBookings,
  getAdminOverview,
  rescheduleAdminBooking,
  updateAdminBookingStatus,
} from '../../api/admin';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import Modal from '../../components/Modal';
import { company, images } from '../../data/siteData';
import { formatDate, getErrorMessage } from '../../utils/format';

const sidebarItems = [
  { label: 'Dashboard', icon: Grid2X2, path: '/admin/dashboard' },
  { label: 'Rental Inventory', icon: Package, path: '/admin/dashboard/inventory' },
  { label: 'Inventory Orders', icon: ShoppingCart, path: '/admin/dashboard/orders' },
  { label: 'Manage Gallery', icon: Images, path: '/admin/dashboard/gallery' },
  { label: 'Appointments', icon: CalendarDays, path: '/admin/dashboard/bookings', active: true },
  { label: 'Quotations', icon: FileText, path: '/admin/dashboard/quotations' },
  { label: 'User Accounts', icon: Users, path: '/admin/dashboard/users' },
];

const statusOptions = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const priorityClasses = {
  Urgent: 'bg-red-100 text-red-700 border-red-200',
  'Follow Up': 'bg-amber-100 text-amber-800 border-amber-200',
  'New Request': 'bg-slate-100 text-slate-700 border-slate-200',
  Confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Completed: 'bg-blue-100 text-blue-700 border-blue-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-100',
};

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ preferredDate: '', preferredTime: '' });
  const [savingId, setSavingId] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationBookings, setNotificationBookings] = useState([]);

  const token = localStorage.getItem('theos_admin_token');

  const adminUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('theos_admin_user'));
    } catch (err) {
      return null;
    }
  }, []);

  const handleAuthError = (err, fallback) => {
    setError(getErrorMessage(err, fallback));
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      localStorage.removeItem('theos_admin_token');
      localStorage.removeItem('theos_admin_user');
      navigate('/admin', { replace: true });
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminBookings(token, { search, status });
      setBookings(data.bookings || []);
      setStats(data.stats || null);
    } catch (err) {
      handleAuthError(err, 'Unable to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getAdminOverview(token);
      setNotificationCount(data.counts?.rentalBookingNotifications || 0);
      setNotificationBookings(data.latestRentalBookings || []);
    } catch (err) {
      handleAuthError(err, 'Unable to load rental notifications');
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(loadBookings, search ? 220 : 0);
    return () => window.clearTimeout(timeout);
  }, [search, status]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('theos_admin_token');
    localStorage.removeItem('theos_admin_user');
    localStorage.removeItem('theos_admin_remember');
    navigate('/admin');
  };

  const updateStatus = async (booking, nextStatus) => {
    setSavingId(booking._id);
    setError('');

    try {
      await updateAdminBookingStatus(token, booking._id, nextStatus);
      await loadBookings();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to update booking'));
    } finally {
      setSavingId('');
    }
  };

  const openReschedule = (booking) => {
    setRescheduleTarget(booking);
    setRescheduleForm({
      preferredDate: booking.preferredDate || '',
      preferredTime: booking.preferredTime || '',
    });
  };

  const submitReschedule = async () => {
    if (!rescheduleTarget || !rescheduleForm.preferredDate || !rescheduleForm.preferredTime) return;

    setSavingId(rescheduleTarget._id);
    try {
      await rescheduleAdminBooking(token, rescheduleTarget._id, rescheduleForm);
      setRescheduleTarget(null);
      await loadBookings();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to reschedule booking'));
    } finally {
      setSavingId('');
    }
  };

  const visibleBookings = bookings;
  const selectedBooking = visibleBookings[0];

  return (
    <div className="min-h-screen bg-[#faf8f8] text-[#171717] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-200 bg-[#f5f8fb] lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="px-6 py-7">
            <p className="text-xl font-bold tracking-tight">{company.name} Admin</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">Management Suite</p>
          </div>

          <nav className="grid gap-1 px-4 py-2 sm:grid-cols-7 lg:block lg:flex-1 lg:space-y-2">
            {sidebarItems.map(({ label, icon: Icon, path, active }) => (
              <button
                key={label}
                type="button"
                onClick={() => path && navigate(path)}
                className={`flex items-center gap-3 rounded-sm border-r-4 px-4 py-3 text-left text-sm font-semibold transition ${
                  active
                    ? 'border-accent-600 bg-accent-50 text-accent-700'
                    : 'border-transparent text-slate-600 hover:bg-white hover:text-slate-950'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline lg:inline">{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-200 p-4">
            <div className="grid grid-cols-2 gap-2 lg:block lg:space-y-2">
              <button type="button" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950">
                <Settings size={18} /> Settings
              </button>
              <button type="button" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950">
                <HelpCircle size={18} /> Support
              </button>
              <button type="button" onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-16 flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-9">
            <label className="relative w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search appointments..."
                className="h-11 rounded-full border-0 bg-slate-50 py-0 pl-11 pr-4 text-sm text-slate-700 shadow-none"
              />
            </label>
            <div className="flex items-center justify-between gap-4 md:justify-end">
              <button type="button" onClick={() => navigate('/book-appointment')} className="text-sm font-bold text-accent-700 hover:text-accent-800">
                New Booking
              </button>
              <AdminNotificationBell
                count={notificationCount}
                bookings={notificationBookings}
                onViewAll={() => navigate('/admin/dashboard#rental-booking-notifications')}
              />
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100" aria-label="Messages">
                <Mail size={19} />
              </button>
              <button type="button" onClick={handleLogout} className="grid h-10 w-10 place-items-center rounded-full bg-accent-100 text-sm font-bold text-accent-700 ring-2 ring-white" aria-label="Admin account">
                {adminUser?.name?.[0] || 'A'}
              </button>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 lg:px-9 lg:py-10">
          <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
            <section>
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-accent-800">Pending Requests</p>
                  <h1 className="display mt-4 text-4xl font-bold leading-tight md:text-5xl">Booking Management</h1>
                  <p className="mt-3 text-sm text-slate-600">
                    Review appointment requests, approve client meetings, and reschedule consultation slots.
                  </p>
                </div>
                <div className="flex gap-3">
                  <SelectStatus value={status} onChange={setStatus} />
                  <button type="button" className="btn-outline bg-white py-2">
                    <SlidersHorizontal size={16} /> Sort
                  </button>
                </div>
              </div>

              {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>}

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <BookingStat label="Pending" value={stats?.pendingRequests || 0} icon={Clock} />
                <BookingStat label="Confirmed" value={stats?.confirmedBookings || 0} icon={CheckCircle2} />
                <BookingStat label="Urgent" value={stats?.urgentRequests || 0} icon={Star} danger />
              </div>

              <div className="mt-8 space-y-6">
                {loading && <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow-soft">Loading booking requests...</div>}

                {!loading && visibleBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    saving={savingId === booking._id}
                    onApprove={() => updateStatus(booking, 'Confirmed')}
                    onReschedule={() => openReschedule(booking)}
                  />
                ))}

                {!loading && !visibleBookings.length && (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center shadow-soft">
                    <CalendarDays className="mx-auto text-slate-400" size={30} />
                    <p className="mt-4 text-sm font-bold text-slate-950">No appointment requests match this view.</p>
                    <p className="mt-2 text-sm text-slate-500">New customer appointment bookings will appear here for admin review.</p>
                  </div>
                )}
              </div>
            </section>

            <QuickReview
              booking={selectedBooking}
              note={note}
              setNote={setNote}
              stats={stats}
            />
          </div>
        </main>
      </div>

      {rescheduleTarget && (
        <Modal
          title="Reschedule Appointment"
          message={`Choose a new date and time for ${rescheduleTarget.userId?.name || 'this client'}.`}
          confirmText={savingId === rescheduleTarget._id ? 'Saving...' : 'Save Schedule'}
          cancelText="Cancel"
          onCancel={() => setRescheduleTarget(null)}
          onConfirm={submitReschedule}
        >
          <div className="grid gap-4">
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Preferred Date
              <input
                type="date"
                value={rescheduleForm.preferredDate}
                onChange={(event) => setRescheduleForm((prev) => ({ ...prev, preferredDate: event.target.value }))}
                className="mt-2"
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Preferred Time
              <input
                type="time"
                value={rescheduleForm.preferredTime}
                onChange={(event) => setRescheduleForm((prev) => ({ ...prev, preferredTime: event.target.value }))}
                className="mt-2"
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
};

const BookingCard = ({ booking, saving, onApprove, onReschedule }) => (
  <article className={`rounded-lg bg-white p-6 shadow-soft ${booking.priority === 'Urgent' ? 'border-l-4 border-red-600' : booking.priority === 'Follow Up' ? 'border-l-4 border-accent-700' : 'border-l-4 border-slate-200'}`}>
    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div className="flex gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white">
          {getInitials(booking.userId?.name)}
        </div>
        <div>
          <h2 className="display text-2xl font-bold leading-tight">{booking.userId?.name || 'Client'}</h2>
          <p className="mt-1 text-sm text-slate-500">{booking.serviceType}</p>
          <p className="mt-1 text-xs text-slate-400">{booking.userId?.email || 'Email unavailable'}</p>
        </div>
      </div>
      <span className={`w-fit rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] ${priorityClasses[booking.priority] || priorityClasses['New Request']}`}>
        {booking.priority}
      </span>
    </div>

    <div className="mt-6 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
      <p className="flex items-center gap-2"><CalendarDays size={16} /> {formatDate(booking.preferredDate)} · {booking.preferredTime}</p>
      <p className="flex items-center gap-2"><MapPin size={16} /> {booking.location}</p>
    </div>

    {booking.notes && <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">{booking.notes}</p>}

    <div className="mt-6 grid gap-3 md:grid-cols-2">
      <button type="button" disabled={saving || booking.status === 'Confirmed'} onClick={onApprove} className="btn-primary bg-black hover:bg-brand-950 disabled:opacity-50">
        {booking.status === 'Confirmed' ? 'Approved' : 'Approve'}
      </button>
      <button type="button" disabled={saving} onClick={onReschedule} className="btn-outline bg-white">
        Reschedule
      </button>
    </div>
  </article>
);

const QuickReview = ({ booking, note, setNote, stats }) => (
  <aside className="rounded-lg bg-white p-6 shadow-lift">
    <h2 className="display text-3xl font-bold">Quick Review</h2>
    <div className="relative mt-7 overflow-hidden rounded-lg">
      <img src={images.venue} alt="" className="h-48 w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm font-semibold text-white">
        Upcoming Highlight: {booking?.serviceType || 'Client Consultation'}
      </div>
    </div>

    <div className="mt-7">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Client Status</p>
      <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <Star className="text-accent-500" size={23} />
        <div>
          <p className="font-bold text-slate-950">{booking?.userId?.name ? 'Active Client' : 'Awaiting Request'}</p>
          <p className="mt-1 text-xs text-slate-500">{stats?.confirmedBookings || 0} confirmed appointments · {stats?.completedBookings || 0} completed</p>
        </div>
      </div>
    </div>

    <div className="mt-7">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Quick Notes</p>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Add a private note for the team..."
        rows="6"
        className="mt-3 bg-slate-50"
      />
    </div>

    <div className="mt-7 divide-y divide-slate-100 text-sm">
      <Metric label="Response Time Avg." value="42 mins" />
      <Metric label="Unresolved Items" value={`${stats?.unresolvedItems || 0} Tasks`} danger />
      <Metric label="Team Occupancy" value="88%" />
    </div>

    <button type="button" className="btn-outline mt-7 w-full bg-white">
      <UserRound size={18} /> Full History
    </button>
  </aside>
);

const BookingStat = ({ label, value, icon: Icon, danger = false }) => (
  <article className="rounded-lg bg-white p-5 shadow-soft">
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <Icon className={danger ? 'text-red-600' : 'text-accent-700'} size={18} />
    </div>
    <p className={`display mt-4 text-3xl font-bold ${danger ? 'text-red-700' : 'text-slate-950'}`}>{value}</p>
  </article>
);

const SelectStatus = ({ value, onChange }) => (
  <label className="relative">
    <span className="sr-only">Filter appointments</span>
    <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 appearance-none rounded-lg bg-white py-0 pl-9 pr-9 text-sm shadow-soft"
    >
      {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>
);

const Metric = ({ label, value, danger = false }) => (
  <div className="flex items-center justify-between py-4">
    <span className="text-slate-600">{label}</span>
    <span className={`font-bold ${danger ? 'text-red-600' : 'text-slate-950'}`}>{value}</span>
  </div>
);

const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  return `${parts[0]?.[0] || 'C'}${parts[1]?.[0] || ''}`.toUpperCase();
};

export default AdminBookings;
