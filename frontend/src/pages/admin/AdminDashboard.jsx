import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  CreditCard,
  FileText,
  Grid2X2,
  HelpCircle,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  Search,
  Settings,
  ShoppingCart,
  UserPlus,
  Users,
} from 'lucide-react';
import { getAdminOverview } from '../../api/admin';
import { company } from '../../data/siteData';
import { formatDate, getErrorMessage } from '../../utils/format';

const sidebarItems = [
  { label: 'Dashboard', icon: Grid2X2, path: '/admin/dashboard', active: true },
  { label: 'Rental Inventory', icon: Package, path: '/admin/dashboard/inventory' },
  { label: 'Appointments', icon: CalendarDays },
  { label: 'Quotations', icon: FileText },
  { label: 'User Accounts', icon: Users },
];

const volumeBars = [38, 62, 48, 82, 67, 43];

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
    const loadOverview = async () => {
      try {
        const token = localStorage.getItem('theos_admin_token');
        const data = await getAdminOverview(token);
        setOverview(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load admin overview'));
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem('theos_admin_token');
          localStorage.removeItem('theos_admin_user');
          navigate('/admin', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('theos_admin_token');
    localStorage.removeItem('theos_admin_user');
    localStorage.removeItem('theos_admin_remember');
    navigate('/admin');
  };

  const counts = overview?.counts || {};
  const appointments = overview?.latestAppointments || [];
  const quotations = overview?.latestQuotations || [];

  const stats = [
    ['TOTAL USERS', counts.users ?? 0, Users, '+12%', 'bg-emerald-50 text-emerald-600'],
    ['QUOTATION REQUESTS', counts.quotations ?? 0, FileText, 'Pending', 'bg-amber-50 text-amber-600'],
    ['APPOINTMENTS', counts.appointments ?? 0, CalendarDays, 'Today', 'bg-slate-100 text-slate-500'],
    ['ACTIVE RENTALS', counts.rentalBookings ?? 0, Package, 'Live', 'bg-emerald-50 text-emerald-600'],
  ];

  return (
    <div className="min-h-screen bg-[#faf8f8] text-[#171717] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-200 bg-[#f5f8fb] lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="px-6 py-7">
            <p className="text-xl font-bold tracking-tight">{company.name} Admin</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">Management Suite</p>
          </div>

          <nav className="grid gap-1 px-4 py-2 sm:grid-cols-5 lg:block lg:flex-1 lg:space-y-2">
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
              <button type="button" onClick={() => navigate('/book-appointment')} className="btn-accent rounded-full px-6 py-2.5">
                New Booking
              </button>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100" aria-label="Notifications">
                <Bell size={19} />
              </button>
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
                      <p className="mt-1 text-sm text-slate-600">Historical quotation trends over the last 30 days.</p>
                    </div>
                    <button type="button" className="rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">Last 30 Days</button>
                  </div>
                  <div className="mt-9 flex h-72 items-end gap-6 border-y border-slate-100 px-4 py-8">
                    {volumeBars.map((height, index) => (
                      <div key={height + index} className="flex flex-1 items-end">
                        <div
                          className={`w-full rounded-t-lg ${index === 3 ? 'bg-accent-600' : index === 4 ? 'bg-amber-300' : 'bg-amber-100'}`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </article>

                <RecentActivity appointments={appointments} quotations={quotations} />
              </section>

              <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_320px]">
                <UpcomingAppointments appointments={appointments} />
                <SystemHealth />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const RecentActivity = ({ appointments, quotations }) => {
  const activities = [
    {
      icon: ShoppingCart,
      tone: 'bg-amber-50 text-accent-600',
      title: appointments[0] ? `New booking: ${appointments[0].serviceType}` : 'New booking: Event consultation',
      meta: appointments[0] ? `${formatDate(appointments[0].preferredDate)} · ${appointments[0].userId?.name || 'Client'}` : 'Awaiting scheduling activity',
    },
    {
      icon: CreditCard,
      tone: 'bg-emerald-50 text-emerald-600',
      title: 'Payment received',
      meta: 'Invoice activity will appear here',
    },
    {
      icon: MessageSquare,
      tone: 'bg-blue-50 text-blue-600',
      title: quotations[0] ? `Quote from ${quotations[0].eventType}` : 'Message from client',
      meta: quotations[0] ? `${quotations[0].status} · ${quotations[0].userId?.name || 'Client'}` : 'No quote messages yet',
    },
    {
      icon: UserPlus,
      tone: 'bg-slate-100 text-slate-500',
      title: 'New user registration',
      meta: 'Customer accounts are synced',
    },
  ];

  return (
    <article className="rounded-lg bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="display text-2xl font-bold">Recent Activity</h2>
        <button type="button" className="text-xs font-bold text-accent-600">View All</button>
      </div>
      <div className="mt-6 space-y-6">
        {activities.map(({ icon: Icon, tone, title, meta }) => (
          <div key={title} className="flex gap-4">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tone}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">{title}</p>
              <p className="mt-1 text-xs text-slate-500">{meta}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};

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

const SystemHealth = () => (
  <article className="rounded-lg bg-[#0b1728] p-6 text-white shadow-lift">
    <h2 className="display text-2xl font-bold text-slate-300">System Health</h2>
    <p className="mt-2 text-sm text-slate-400">All systems operational across booking, quote, and rental services.</p>
    <div className="mt-8 space-y-6">
      <Metric label="Server Load" value="24%" width="24%" color="bg-accent-500" />
      <Metric label="API Latency" value="42ms" width="15%" color="bg-emerald-500" />
    </div>
    <button type="button" className="mt-16 w-full rounded-md bg-white/15 px-5 py-3 text-sm font-bold text-white hover:bg-white/25">
      Diagnostics
    </button>
  </article>
);

const Metric = ({ label, value, width, color }) => (
  <div>
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-300">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
    <div className="mt-3 h-1 rounded-full bg-white/15">
      <div className={`h-full rounded-full ${color}`} style={{ width }} />
    </div>
  </div>
);

export default AdminDashboard;
