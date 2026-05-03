import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  FileText,
  Grid2X2,
  HelpCircle,
  Images,
  LogOut,
  Mail,
  Package,
  Search,
  Settings,
  ShoppingCart,
  UserPlus,
  Users,
} from 'lucide-react';
import { getAdminOverview } from '../../api/admin';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import { company } from '../../data/siteData';
import { formatDate, getErrorMessage } from '../../utils/format';

const sidebarItems = [
  { label: 'Dashboard', icon: Grid2X2, path: '/admin/dashboard', active: true },
  { label: 'Rental Inventory', icon: Package, path: '/admin/dashboard/inventory' },
  { label: 'Inventory Orders', icon: ShoppingCart, path: '/admin/dashboard/orders' },
  { label: 'Manage Gallery', icon: Images, path: '/admin/dashboard/gallery' },
  { label: 'Appointments', icon: CalendarDays, path: '/admin/dashboard/bookings' },
  { label: 'Quotations', icon: FileText, path: '/admin/dashboard/quotations' },
  { label: 'User Accounts', icon: Users, path: '/admin/dashboard/users' },
];

const formatDashboardNumber = (value) => new Intl.NumberFormat('en-US').format(value ?? 0);
const OVERVIEW_REFRESH_MS = 30000;

const formatActivityTime = (value) => {
  if (!value) return 'Just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60000) return 'Just now';

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return formatDate(value);
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const adminUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('theos_admin_user'));
    } catch (err) {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const token = localStorage.getItem('theos_admin_token');
        const data = await getAdminOverview(token);
        if (!isMounted) return;
        setOverview(data);
        setError('');
      } catch (err) {
        if (!isMounted) return;
        if (!silent) setError(getErrorMessage(err, 'Unable to load admin overview'));
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem('theos_admin_token');
          localStorage.removeItem('theos_admin_user');
          navigate('/admin', { replace: true });
        }
      } finally {
        if (isMounted && !silent) setLoading(false);
      }
    };

    loadOverview();
    const refreshTimer = window.setInterval(() => loadOverview(true), OVERVIEW_REFRESH_MS);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('theos_admin_token');
    localStorage.removeItem('theos_admin_user');
    localStorage.removeItem('theos_admin_remember');
    navigate('/admin');
  };

  const scrollToRentalNotifications = () => {
    document.getElementById('rental-booking-notifications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!loading && window.location.hash === '#rental-booking-notifications') {
      window.setTimeout(scrollToRentalNotifications, 0);
    }
  }, [loading]);

  const counts = overview?.counts || {};
  const appointments = overview?.latestAppointments || [];
  const quotations = overview?.latestQuotations || [];
  const rentalBookings = overview?.latestRentalBookings || [];
  const users = overview?.latestUsers || [];
  const rentalNotificationCount = counts.rentalBookingNotifications ?? 0;
  const rentalCount = counts.activeRentalBookings ?? counts.rentalBookings ?? 0;

  const stats = [
    ['TOTAL USERS', counts.users ?? 0, Users],
    ['QUOTATION REQUESTS', counts.quotations ?? 0, FileText, 'Pending', 'bg-amber-50 text-amber-600'],
    ['APPOINTMENTS', counts.appointments ?? 0, CalendarDays, 'Today', 'bg-slate-100 text-slate-500'],
    [
      'ACTIVE RENTALS',
      rentalCount,
      Package,
      rentalNotificationCount ? `${rentalNotificationCount} new` : 'Live',
      rentalNotificationCount ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600',
    ],
  ];
  const volumeData = [
    { label: 'Users', chartLabel: 'Users', value: counts.users ?? 0, color: 'bg-slate-950', tint: 'bg-slate-100', text: 'text-slate-950' },
    { label: 'Quotation Requests', chartLabel: 'Quotes', value: counts.quotations ?? 0, color: 'bg-accent-600', tint: 'bg-accent-50', text: 'text-accent-700' },
    { label: 'Appointments', chartLabel: 'Appoint', value: counts.appointments ?? 0, color: 'bg-blue-600', tint: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Rentals', chartLabel: 'Rentals', value: rentalCount, color: 'bg-emerald-600', tint: 'bg-emerald-50', text: 'text-emerald-700' },
  ];
  const highestVolume = Math.max(...volumeData.map((item) => item.value), 1);

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
            <button type="button" onClick={() => navigate('/book-appointment')} className="btn-primary w-full bg-black hover:bg-brand-950">
              Create Event
            </button>
            <div className="mt-6 grid grid-cols-2 gap-2 lg:block lg:space-y-2">
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
                placeholder="Search bookings, clients, or quotes..."
                className="h-11 rounded-full border-0 bg-slate-50 py-0 pl-11 pr-4 text-sm text-slate-700 shadow-none"
              />
            </label>
            <div className="flex items-center justify-between gap-3 md:justify-end">
              <AdminNotificationBell count={rentalNotificationCount} bookings={rentalBookings} onViewAll={scrollToRentalNotifications} />
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
          <section>
            <p className="text-sm uppercase tracking-[0.08em] text-accent-800">Welcome Back, Administrator</p>
            <h1 className="display mt-4 text-5xl font-bold leading-tight md:text-6xl">Dashboard Overview</h1>
          </section>

          {loading && <div className="mt-8 rounded-lg bg-white p-8 text-center text-slate-500 shadow-soft">Loading admin overview...</div>}
          {error && !loading && <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}

          {!loading && overview && (
            <>
              <section className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {stats.map(([label, value, Icon, badge, badgeClass]) => (
                  <article key={label} className="rounded-lg bg-white p-6 shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid h-14 w-14 place-items-center rounded-lg bg-slate-50 text-accent-600">
                        <Icon size={22} />
                      </div>
                      <span className={`rounded px-2 py-1 text-xs font-bold ${badgeClass}`}>{badge}</span>
                    </div>
                    <p className="mt-6 text-sm uppercase leading-6 text-slate-600">{label}</p>
                    <p className="display mt-1 text-4xl font-bold">{value}</p>
                  </article>
                ))}
              </section>

              <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_320px]">
                <article className="rounded-lg bg-white p-6 shadow-soft">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="display text-2xl font-bold">Request Volume</h2>
                      <p className="mt-1 text-sm text-slate-600">Users, quotation requests, appointments, and rentals shown as live admin totals.</p>
                    </div>
                    <button type="button" className="rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">Last 30 Days</button>
                  </div>
                  <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-5 pb-5 pt-7">
                      <div className="relative flex h-72 items-end gap-4 border-b border-slate-200 px-2">
                        <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-slate-200" />
                        <div className="pointer-events-none absolute inset-x-2 top-1/3 h-px bg-slate-200/80" />
                        <div className="pointer-events-none absolute inset-x-2 top-2/3 h-px bg-slate-200/80" />
                        {volumeData.map((item) => {
                          const percentage = Math.round((item.value / highestVolume) * 100);
                          const barHeight = item.value ? Math.max(percentage, 12) : 2;

                          return (
                            <div key={item.label} className="relative z-10 flex h-full flex-1 flex-col items-center justify-end gap-3">
                              <div className="rounded bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm">
                                {formatDashboardNumber(item.value)}
                              </div>
                              <div className="flex h-full w-full max-w-[76px] items-end">
                                <div className={`w-full rounded-t-lg ${item.color} shadow-sm`} style={{ height: `${barHeight}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-slate-500 sm:text-[11px] sm:tracking-[0.1em]">
                        {volumeData.map((item) => (
                          <span key={item.label} className="min-w-0 whitespace-normal break-words px-1">{item.chartLabel}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {volumeData.map((item) => {
                        const percentage = Math.round((item.value / highestVolume) * 100);

                        return (
                          <div key={item.label} className={`rounded-lg p-4 ${item.tint}`}>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                              <p className={`display mt-1 text-3xl font-bold ${item.text}`}>{formatDashboardNumber(item.value)}</p>
                            </div>
                            <div className="mt-4 h-2 rounded-full bg-white">
                              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>

                <RecentActivity appointments={appointments} quotations={quotations} rentalBookings={rentalBookings} users={users} />
              </section>

              <RentalBookingNotifications
                bookings={rentalBookings}
                count={rentalNotificationCount}
                onManageInventory={() => navigate('/admin/dashboard/orders')}
              />

              <section className="mt-8">
                <UpcomingAppointments appointments={appointments} />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const RecentActivity = ({ appointments, quotations, rentalBookings, users }) => {
  const activities = [
    ...appointments.map((appointment) => ({
      id: `appointment-${appointment._id}`,
      icon: CalendarDays,
      tone: 'bg-amber-50 text-accent-600',
      title: `Appointment: ${appointment.serviceType || 'Event consultation'}`,
      meta: `${appointment.userId?.name || 'Client'} · ${formatDate(appointment.preferredDate)} · ${appointment.status || 'Pending'}`,
      createdAt: appointment.createdAt,
    })),
    ...quotations.map((quotation) => ({
      id: `quotation-${quotation._id}`,
      icon: FileText,
      tone: 'bg-blue-50 text-blue-600',
      title: `Quotation: ${quotation.eventType || quotation.serviceCategory || 'Event request'}`,
      meta: `${quotation.userId?.name || 'Client'} · ${quotation.status || 'Pending Review'} · ${quotation.guestCount || 'Guest count pending'}`,
      createdAt: quotation.createdAt,
    })),
    ...rentalBookings.map((booking) => ({
      id: `rental-${booking._id}`,
      icon: Package,
      tone: 'bg-emerald-50 text-emerald-600',
      title: `Rental request: ${booking.itemId?.name || 'Rental item'}`,
      meta: `${booking.userId?.name || 'Client'} · Qty ${booking.quantity || 1} · ${booking.status || 'Reserved'}`,
      createdAt: booking.createdAt,
    })),
    ...users.map((user) => ({
      id: `user-${user._id}`,
      icon: UserPlus,
      tone: 'bg-slate-100 text-slate-600',
      title: `New user: ${user.name || 'Customer account'}`,
      meta: user.email || user.phone || 'Customer account created',
      createdAt: user.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  return (
    <article className="rounded-lg bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="display text-2xl font-bold">Recent Activity</h2>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>
      <div className="mt-6 space-y-6">
        {activities.map(({ id, icon: Icon, tone, title, meta, createdAt }) => (
          <div key={id} className="flex gap-4">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tone}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-slate-950">{title}</p>
                <span className="shrink-0 text-[11px] font-semibold text-slate-400">{formatActivityTime(createdAt)}</span>
              </div>
              <p className="mt-1 truncate text-xs text-slate-500">{meta}</p>
            </div>
          </div>
        ))}

        {!activities.length && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm font-bold text-slate-950">No recent activity yet</p>
            <p className="mt-2 text-xs text-slate-500">New bookings, quotes, rentals, and user registrations will appear here automatically.</p>
          </div>
        )}
      </div>
    </article>
  );
};

const RentalBookingNotifications = ({ bookings, count, onManageInventory }) => (
  <section id="rental-booking-notifications" className="mt-8 scroll-mt-24 rounded-lg bg-white p-6 shadow-soft">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-red-50 text-red-600">
            <AlertCircle size={20} />
          </span>
          <div>
            <h2 className="display text-2xl font-bold">Rental Booking Notifications</h2>
            <p className="mt-1 text-sm text-slate-600">User-submitted rental inventory requests that need admin review.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${count ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {count ? `${count} new` : 'No new requests'}
        </span>
        <button type="button" onClick={onManageInventory} className="btn-outline py-2 text-sm">
          Inventory <ArrowRight size={16} />
        </button>
      </div>
    </div>

    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      {bookings.map((booking) => (
        <article key={booking._id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="flex gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-white text-slate-400">
              {booking.itemId?.image ? (
                <img src={booking.itemId.image} alt={booking.itemId?.name || 'Rental item'} className="h-full w-full object-cover" />
              ) : (
                <Package size={22} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="display text-xl font-bold leading-tight text-slate-950">{booking.itemId?.name || 'Rental item'}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {booking.itemId?.category || 'Rental'} · Qty {booking.quantity}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
                  {booking.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Client</p>
                  <p className="mt-1 font-semibold text-slate-950">{booking.userId?.name || 'Customer'}</p>
                  <p className="mt-1 truncate text-xs">{booking.userId?.email || 'Email unavailable'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Rental Window</p>
                  <p className="mt-1 font-semibold text-slate-950">{formatDate(booking.startDate)}</p>
                  <p className="mt-1 text-xs">to {formatDate(booking.endDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}

      {!bookings.length && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center xl:col-span-2">
          <Package className="mx-auto text-slate-400" size={26} />
          <p className="mt-4 text-sm font-bold text-slate-950">No active rental booking requests</p>
          <p className="mt-2 text-sm text-slate-500">New customer rental reservations will appear here for quick admin review.</p>
        </div>
      )}
    </div>
  </section>
);

const UpcomingAppointments = ({ appointments }) => (
  <article className="overflow-hidden rounded-lg bg-white p-6 shadow-soft">
    <h2 className="display text-2xl font-bold">Upcoming Appointments</h2>
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-slate-100 text-[11px] uppercase text-slate-500">
          <tr>
            <th className="py-3 font-bold">Client</th>
            <th className="py-3 font-bold">Event Type</th>
            <th className="py-3 font-bold">Date & Time</th>
            <th className="py-3 font-bold">Status</th>
            <th className="py-3 font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(appointments.length ? appointments : []).map((appointment) => (
            <tr key={appointment._id}>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {appointment.userId?.name?.[0] || 'C'}
                  </div>
                  <span className="font-bold">{appointment.userId?.name || 'Client'}</span>
                </div>
              </td>
              <td className="py-4">{appointment.serviceType}</td>
              <td className="py-4">{formatDate(appointment.preferredDate)} · {appointment.preferredTime}</td>
              <td className="py-4">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase text-accent-700">
                  {appointment.status}
                </span>
              </td>
              <td className="py-4 text-slate-500">⋮</td>
            </tr>
          ))}
          {!appointments.length && (
            <tr>
              <td colSpan="5" className="py-8 text-center text-slate-500">No appointments yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </article>
);

export default AdminDashboard;
