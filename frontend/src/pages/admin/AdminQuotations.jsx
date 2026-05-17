import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Grid2X2,
  HelpCircle,
  Images,
  LogOut,
  Mail,
  Package,
  Phone,
  Search,
  Settings,
  ShoppingCart,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  getAdminOverview,
  getAdminQuotations,
  updateAdminQuotationStatus,
} from '../../api/admin';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import Modal from '../../components/Modal';
import { company } from '../../data/siteData';
import { formatBudgetRange, formatDate, formatNumber, getErrorMessage } from '../../utils/format';

const sidebarItems = [
  { label: 'Dashboard', icon: Grid2X2, path: '/admin/dashboard' },
  { label: 'Rental Inventory', icon: Package, path: '/admin/dashboard/inventory' },
  { label: 'Inventory Orders', icon: ShoppingCart, path: '/admin/dashboard/orders' },
  { label: 'Manage Gallery', icon: Images, path: '/admin/dashboard/gallery' },
  { label: 'Appointments', icon: CalendarDays, path: '/admin/dashboard/bookings' },
  { label: 'Quotations', icon: FileText, path: '/admin/dashboard/quotations', active: true },
  { label: 'User Accounts', icon: Users, path: '/admin/dashboard/users' },
];

const statusOptions = ['All', 'Pending Review', 'Approved', 'Rejected', 'Closed'];
const sortOptions = [
  { value: 'recent', label: 'Recently Submitted' },
  { value: 'oldest', label: 'Oldest First' },
];

const statusPillClasses = {
  'Pending Review': 'bg-amber-100 text-amber-700 ring-amber-200',
  Approved: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-red-100 text-red-700 ring-red-200',
  Closed: 'bg-slate-100 text-slate-500 ring-slate-200',
};

const statusDescriptions = {
  'Pending Review': 'Waiting for admin action',
  Approved: 'Accepted for proposal follow-up',
  Rejected: 'Not moving forward',
  Closed: 'Resolved or archived',
};

const quoteReference = (quotation) => `QUO-${String(quotation?._id || '').slice(-6).toUpperCase() || 'NEW'}`;
const displayQuotationStatus = (status) => (status === 'Review' ? 'Pending Review' : status || 'Pending Review');

const getSubmittedAge = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No submission date';

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Submitted just now';
  if (diffHours < 24) return `Submitted ${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Submitted yesterday';
  if (diffDays < 7) return `Submitted ${diffDays} days ago`;
  return `Submitted ${formatDate(value)}`;
};

const AdminQuotations = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);
  const [manageTarget, setManageTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationBookings, setNotificationBookings] = useState([]);

  const token = localStorage.getItem('theos_admin_token');

  const adminUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('theos_admin_user') || '{}');
    } catch (err) {
      return {};
    }
  }, []);

  const handleAuthError = (err, fallback) => {
    setError(getErrorMessage(err, fallback));
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      localStorage.removeItem('theos_admin_token');
      localStorage.removeItem('theos_admin_user');
      navigate('/admin');
    }
  };

  const loadQuotations = async (page = pagination.page) => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminQuotations(token, {
        search,
        status,
        sort,
        page,
        limit: pagination.limit,
      });
      setQuotations(data.quotations || []);
      setStats(data.stats || null);
      setPagination(data.pagination || { page, limit: pagination.limit, total: 0, totalPages: 1 });
    } catch (err) {
      handleAuthError(err, 'Unable to load quotations');
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
    const timeout = window.setTimeout(() => loadQuotations(1), search ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [search, status, sort]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('theos_admin_token');
    localStorage.removeItem('theos_admin_user');
    localStorage.removeItem('theos_admin_remember');
    navigate('/admin');
  };

  const openManage = (quotation) => {
    setManageTarget(quotation);
    setNewStatus(displayQuotationStatus(quotation.status));
    setError('');
    setModalError('');
    setNotice('');
  };

  const submitManage = async () => {
    if (!manageTarget) return;

    setSaving(true);
    setError('');
    setModalError('');
    setNotice('');

    try {
      await updateAdminQuotationStatus(token, manageTarget._id, newStatus);
      setManageTarget(null);
      setNotice('Quotation status updated.');
      await loadQuotations(pagination.page);
    } catch (err) {
      setModalError(getErrorMessage(err, 'Unable to update quotation status'));
    } finally {
      setSaving(false);
    }
  };

  const exportReport = () => {
    const rows = [
      ['Quote ID', 'Customer', 'Email', 'Phone', 'Event Type', 'Service Category', 'Event Date', 'Guest Count', 'Budget', 'Status', 'Submitted', 'Notes'],
      ...quotations.map((quotation) => [
        quoteReference(quotation),
        quotation.customer?.name || '',
        quotation.customer?.email || '',
        quotation.customer?.phone || '',
        quotation.eventType || '',
        quotation.serviceCategory || '',
        quotation.eventDate || '',
        quotation.guestCount || '',
        formatBudgetRange(quotation.budgetRange),
        displayQuotationStatus(quotation.status),
        formatDate(quotation.createdAt),
        quotation.notes || '',
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'theos-quotations.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const pageStart = pagination.total ? ((pagination.page - 1) * pagination.limit) + 1 : 0;
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total || 0);
  const statCards = [
    {
      label: 'Total Quotations',
      value: stats?.totalQuotations ?? 0,
      caption: 'All submitted requests',
      icon: FileText,
      tone: 'bg-slate-100 text-slate-600',
    },
    {
      label: 'Pending Review',
      value: stats?.pendingReview ?? 0,
      caption: 'Open admin work',
      icon: AlertCircle,
      tone: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Approved',
      value: stats?.approved ?? 0,
      caption: 'Ready for follow-up',
      icon: CheckCircle2,
      tone: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Rejected',
      value: stats?.rejected ?? 0,
      caption: 'Declined requests',
      icon: X,
      tone: 'bg-red-100 text-red-700',
    },
    {
      label: 'Closed',
      value: stats?.closed ?? 0,
      caption: 'Resolved quotes',
      icon: Archive,
      tone: 'bg-slate-100 text-slate-500',
    },
  ];

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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customers, contact info, or event details..."
                className="h-11 rounded-full border-0 bg-slate-50 py-0 pl-11 pr-4 text-sm text-slate-700 shadow-none"
              />
            </label>
            <div className="flex items-center justify-between gap-3 md:justify-end">
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
          <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="display text-4xl font-bold leading-tight md:text-5xl">Quotation Management</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                Manage quote details, customer contact information, event scope, budget range, service needs, notes, and admin status.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={exportReport} className="btn-outline border-slate-400 bg-white px-8 text-slate-950">
                <Download size={17} /> Export Report
              </button>
            </div>
          </section>

          {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
          {notice && <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{notice}</div>}

          <section className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {statCards.map(({ label, value, caption, icon: Icon, tone }) => (
              <div key={label} className="rounded-lg bg-white p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-950">{formatNumber(value)}</p>
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    <p className="mt-1 text-xs text-slate-500">{caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-lg bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <button type="button" className="btn-outline bg-slate-50 py-2 text-slate-600">
                  <Filter size={16} /> Filters
                </button>
                <div className="hidden h-8 w-px bg-slate-200 md:block" />
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="select">
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>Sort by:</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="w-auto border-0 bg-transparent px-2 py-2 text-sm font-bold text-slate-700 shadow-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded-lg bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-8 py-5">Customer</th>
                    <th className="px-6 py-5">Quote Scope</th>
                    <th className="px-6 py-5">Schedule</th>
                    <th className="px-6 py-5">Guests & Budget</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Submitted</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.map((quotation) => (
                    <tr key={quotation._id} className="text-slate-700">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                            {quotation.customer?.name?.[0] || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800">{quotation.customer?.name || 'Unknown'}</p>
                            <p className="mt-1 truncate text-xs text-slate-400">{quotation.customer?.email || 'No email'}</p>
                            <p className="mt-1 truncate text-xs text-slate-400">{quotation.customer?.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900">{quotation.eventType || '-'}</p>
                        <p className="mt-1 text-xs text-slate-500">{quotation.serviceCategory || 'No service category'}</p>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">{quoteReference(quotation)}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-800">{quotation.eventDate ? formatDate(quotation.eventDate) : 'No date'}</p>
                        <p className="mt-1 text-xs text-slate-500">Event date</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-800">{quotation.guestCount || '-'} guests</p>
                        <p className="mt-1 text-xs text-slate-500">{quotation.budgetRange ? formatBudgetRange(quotation.budgetRange) : 'No budget range'}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${statusPillClasses[displayQuotationStatus(quotation.status)] || statusPillClasses['Pending Review']}`}>
                          {displayQuotationStatus(quotation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-800">{formatDate(quotation.createdAt)}</p>
                        <p className="mt-1 text-xs text-slate-500">{getSubmittedAge(quotation.createdAt)}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button type="button" onClick={() => openManage(quotation)} className="text-xs font-bold text-slate-600 hover:text-slate-950">
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => openManage(quotation)}
                            className="rounded-md px-5 py-3 text-xs font-bold transition bg-accent-600 text-white shadow-sm hover:bg-accent-700"
                          >
                            Manage Quote
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && !quotations.length && (
                    <tr>
                      <td colSpan="7" className="px-8 py-12 text-center">
                        <FileText className="mx-auto text-slate-400" size={28} />
                        <p className="mt-4 font-bold text-slate-950">No quotations found</p>
                        <p className="mt-2 text-sm text-slate-500">Adjust filters or check back later.</p>
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td colSpan="7" className="px-8 py-12 text-center text-slate-500">Loading quotations...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 px-8 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>Showing {pageStart} to {pageEnd} of {formatNumber(pagination.total)} quotations</p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={pagination.page <= 1} onClick={() => loadQuotations(pagination.page - 1)} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white disabled:opacity-40">
                  <ChevronLeft size={17} />
                </button>
                {[1, 2, 3].filter((page) => page <= pagination.totalPages).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => loadQuotations(page)}
                    className={`grid h-10 w-10 place-items-center rounded-md border text-sm font-bold ${
                      pagination.page === page ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {pagination.totalPages > 3 && <span className="px-2">...</span>}
                {pagination.totalPages > 3 && (
                  <button type="button" onClick={() => loadQuotations(pagination.totalPages)} className="grid h-10 min-w-10 place-items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600">
                    {pagination.totalPages}
                  </button>
                )}
                <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => loadQuotations(pagination.page + 1)} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white disabled:opacity-40">
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {manageTarget && (
        <Modal
          title={`Manage ${quoteReference(manageTarget)}`}
          message="Check the customer, event, budget, service request, notes, and update the quotation workflow status."
          onCancel={() => setManageTarget(null)}
          onConfirm={submitManage}
          confirmText={saving ? 'Updating...' : 'Save Status'}
          maxWidth="max-w-3xl"
        >
          <div className="grid max-h-[70vh] gap-5 overflow-y-auto pr-1">
            {modalError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{modalError}</div>}

            <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-lg border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-accent-700 shadow-sm">
                    <UserRound size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">{manageTarget.customer?.name || 'Unknown Customer'}</p>
                    <p className="mt-2 flex items-center gap-2 truncate text-sm text-slate-600">
                      <Mail size={15} /> {manageTarget.customer?.email || 'No email on file'}
                    </p>
                    <p className="mt-2 flex items-center gap-2 truncate text-sm text-slate-600">
                      <Phone size={15} /> {manageTarget.customer?.phone || 'No phone on file'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Current Status</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${statusPillClasses[displayQuotationStatus(manageTarget.status)] || statusPillClasses['Pending Review']}`}>
                    {displayQuotationStatus(manageTarget.status)}
                  </span>
                  <span className="text-sm text-slate-500">{statusDescriptions[displayQuotationStatus(manageTarget.status)] || 'Quote is active'}</span>
                </div>
                <p className="mt-4 text-xs text-slate-500">Last updated {formatDate(manageTarget.updatedAt || manageTarget.createdAt)}</p>
              </section>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500"><FileText size={14} /> Event Type</p>
                <p className="mt-2 font-semibold text-slate-900">{manageTarget.eventType || '-'}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500"><Package size={14} /> Service</p>
                <p className="mt-2 font-semibold text-slate-900">{manageTarget.serviceCategory || '-'}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500"><CalendarDays size={14} /> Event Date</p>
                <p className="mt-2 font-semibold text-slate-900">{manageTarget.eventDate ? formatDate(manageTarget.eventDate) : '-'}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500"><Users size={14} /> Guest Count</p>
                <p className="mt-2 font-semibold text-slate-900">{manageTarget.guestCount || '-'}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Budget Range</p>
                <p className="mt-2 font-semibold text-slate-900">{manageTarget.budgetRange ? formatBudgetRange(manageTarget.budgetRange) : '-'}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Submitted</p>
                <p className="mt-2 font-semibold text-slate-900">{formatDate(manageTarget.createdAt)}</p>
              </div>
            </section>

            <section className="rounded-lg bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-950">Customer Notes</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {manageTarget.notes || 'No additional notes were included with this quotation request.'}
              </p>
            </section>

            <section className="rounded-lg border border-slate-100 p-5">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Set Workflow Status</span>
                <select value={newStatus} onChange={(event) => setNewStatus(event.target.value)} className="select mt-3">
                  {statusOptions.slice(1).map((statusOption) => (
                    <option key={statusOption} value={statusOption}>{statusOption}</option>
                  ))}
                </select>
              </label>
              <div className="mt-4 grid gap-2 sm:grid-cols-5">
                {statusOptions.slice(1).map((statusOption) => (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => setNewStatus(statusOption)}
                    className={`rounded-md border px-3 py-2 text-xs font-bold transition ${
                      newStatus === statusOption
                        ? 'border-accent-500 bg-accent-50 text-accent-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950'
                    }`}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminQuotations;
