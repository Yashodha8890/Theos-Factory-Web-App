import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CalendarDays,
  ChevronDown,
  Eye,
  FileText,
  Grid2X2,
  HelpCircle,
  Images,
  LogOut,
  Mail,
  Package,
  PackageCheck,
  Printer,
  Search,
  Settings,
  ShoppingCart,
  UserRound,
  Users,
  Warehouse,
  XCircle,
} from 'lucide-react';
import { getAdminOrders, getAdminOverview, updateAdminOrderStatus } from '../../api/admin';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import Modal from '../../components/Modal';
import { company } from '../../data/siteData';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/format';

const sidebarItems = [
  { label: 'Dashboard', icon: Grid2X2, path: '/admin/dashboard' },
  { label: 'Rental Inventory', icon: Package, path: '/admin/dashboard/inventory' },
  { label: 'Inventory Orders', icon: ShoppingCart, path: '/admin/dashboard/orders', active: true },
  { label: 'Manage Gallery', icon: Images, path: '/admin/dashboard/gallery' },
  { label: 'Appointments', icon: CalendarDays, path: '/admin/dashboard/bookings' },
  { label: 'Quotations', icon: FileText },
  { label: 'User Accounts', icon: Users, path: '/admin/dashboard/users' },
];

const statusOptions = ['All', 'Pending', 'Picked', 'Out for Rental', 'Overdue', 'Returned', 'Cancelled'];

const statusClass = {
  Pending: 'bg-slate-100 text-slate-700',
  Picked: 'bg-blue-50 text-blue-700',
  'Out for Rental': 'bg-slate-950 text-white',
  Overdue: 'bg-red-600 text-white',
  Returned: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-red-50 text-red-700',
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState('');
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

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminOrders(token, { search, status });
      setOrders(data.orders || []);
      setStats(data.stats || null);
    } catch (err) {
      handleAuthError(err, 'Unable to load inventory orders');
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
    const timeout = window.setTimeout(loadOrders, search ? 220 : 0);
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

  const updateStatus = async (order, nextStatus) => {
    setUpdatingId(order._id);
    setError('');

    try {
      await updateAdminOrderStatus(token, order._id, nextStatus);
      await Promise.all([loadOrders(), loadNotifications()]);
      if (selectedOrder?._id === order._id) setSelectedOrder(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to update rental order status'));
    } finally {
      setUpdatingId('');
    }
  };

  const showNotificationOrders = () => {
    setStatus('Pending');
    document.getElementById('inventory-orders-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const orderStats = [
    {
      label: 'Active Orders',
      value: stats?.activeOrders ?? 0,
      caption: 'Live rental requests',
      icon: ShoppingCart,
      tone: 'text-accent-700 bg-accent-50',
    },
    {
      label: 'Pending Fulfillment',
      value: stats?.pendingFulfillment ?? 0,
      caption: 'Orders waiting for review',
      icon: Package,
      tone: 'text-brand-700 bg-brand-50',
    },
    {
      label: 'Upcoming Returns',
      value: stats?.upcomingReturns ?? 0,
      caption: 'Due within seven days',
      icon: CalendarDays,
      tone: 'text-blue-700 bg-blue-50',
    },
    {
      label: 'Late Returns',
      value: stats?.lateReturns ?? 0,
      caption: 'Immediate action required',
      icon: XCircle,
      tone: 'text-red-700 bg-red-50',
      danger: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f8] text-[#171717] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-200 bg-[#f5f8fb] lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="px-6 py-7">
            <p className="text-xl font-bold tracking-tight">{company.name} Admin</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">Inventory Control</p>
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
            <button type="button" onClick={() => navigate('/admin/dashboard/inventory')} className="btn-primary w-full bg-black hover:bg-brand-950">
              <Warehouse size={16} /> Open Inventory
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
                placeholder="Search factory orders..."
                className="h-11 rounded-full border-0 bg-slate-50 py-0 pl-11 pr-4 text-sm text-slate-700 shadow-none"
              />
            </label>

            <div className="flex items-center justify-between gap-4 md:justify-end">
              <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-500 lg:flex">

              </nav>
              <AdminNotificationBell count={notificationCount} bookings={notificationBookings} onViewAll={showNotificationOrders} />
              <button type="button" onClick={handleLogout} className="grid h-10 w-10 place-items-center rounded-full bg-accent-100 text-sm font-bold text-accent-700 ring-2 ring-white" aria-label="Admin initials">
                {adminUser?.name?.[0] || 'A'}
              </button>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 lg:px-9 lg:py-10">
          <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.08em] text-accent-800">Rental Fulfillment</p>
              <h1 className="display mt-4 text-5xl font-bold leading-tight md:text-6xl">Inventory Orders</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                Track customer rental requests, fulfillment status, returns, and priority follow-up from one admin view.
              </p>
            </div>
            <button type="button" onClick={() => navigate('/admin/dashboard/inventory')} className="btn-primary bg-black px-6 hover:bg-brand-950">
              <PackageCheck size={18} /> Create Manual Order
            </button>
          </section>

          {error && <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>}

          <section className="mt-9 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {orderStats.map((stat) => (
              <OrderStat key={stat.label} {...stat} />
            ))}
          </section>

          <section className="mt-8 rounded-lg bg-white p-5 shadow-soft">
            <div className="grid gap-4 xl:grid-cols-[1fr_240px_240px]">
              <label className="relative">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Customer Search</span>
                <Search size={18} className="absolute bottom-3.5 left-4 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, email, item, or order..."
                  className="h-12 rounded-lg bg-white py-0 pl-11 pr-4 text-sm text-slate-700"
                />
              </label>
              <SelectControl label="Fulfillment Status" value={status} onChange={setStatus} options={statusOptions} />
              <label className="relative">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Event Date Range</span>
                <Calendar size={17} className="absolute bottom-3.5 left-4 text-slate-400" />
                <input disabled placeholder="Select dates" className="h-12 rounded-lg bg-white py-0 pl-11 pr-4 text-sm text-slate-400 disabled:opacity-100" />
              </label>
            </div>
          </section>

          <section id="inventory-orders-table" className="mt-8 scroll-mt-24 overflow-hidden rounded-lg bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Order ID</th>
                    <th className="px-6 py-4 font-bold">Customer Name</th>
                    <th className="px-6 py-4 font-bold">Event Date</th>
                    <th className="px-6 py-4 font-bold">Rental Period</th>
                    <th className="px-6 py-4 font-bold">Items Ordered</th>
                    <th className="px-6 py-4 font-bold">Total Value</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-500">Loading inventory orders...</td>
                    </tr>
                  )}

                  {!loading && orders.map((order) => (
                    <tr key={order._id} className={order.status === 'Overdue' ? 'bg-red-50/40 text-red-700' : ''}>
                      <td className="px-6 py-5 font-semibold">{order.orderNumber}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${order.status === 'Overdue' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {getInitials(order.customer?.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-950">{order.customer?.name || 'Customer'}</p>
                            <p className="mt-1 text-xs text-slate-500">{order.customer?.email || 'Email unavailable'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">{formatDate(order.startDate)}</td>
                      <td className="px-6 py-5">{order.rentalDays} Day{order.rentalDays === 1 ? '' : 's'}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex max-w-[150px] rounded px-3 py-2 text-xs ${order.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                          {order.item?.name || 'Rental item'}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">Qty {order.quantity} · {order.item?.category || 'Rental'}</p>
                      </td>
                      <td className="px-6 py-5 font-semibold text-slate-950">{formatCurrency(order.totalValue)}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded px-3 py-1.5 text-xs font-bold ${statusClass[order.status] || 'bg-slate-100 text-slate-700'}`}>
                          {order.status}
                        </span>
                        {order.highPriority && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-600">High priority</p>}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setSelectedOrder(order)} className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label={`View ${order.orderNumber}`}>
                            <Eye size={16} />
                          </button>
                          {getOrderAction(order, updatingId, updateStatus)}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && !orders.length && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-500">No inventory orders match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <span>Showing {orders.length ? `1-${orders.length}` : '0'} of {stats?.totalOrders ?? orders.length} orders</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled className="rounded border border-slate-200 px-3 py-2 text-slate-400">Previous</button>
                <span className="rounded bg-slate-950 px-3 py-2 text-white">1</span>
                <button type="button" disabled className="rounded border border-slate-200 px-3 py-2 text-slate-400">Next</button>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-8 xl:grid-cols-[1fr_320px]">
            <article className="relative min-h-[300px] overflow-hidden rounded-lg bg-slate-900 p-8 text-white shadow-lift">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #ffffff 0 2px, transparent 3px), radial-gradient(circle at 70% 40%, #ffffff 0 2px, transparent 3px), radial-gradient(circle at 45% 70%, #ffffff 0 2px, transparent 3px)' }} />
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(115deg, transparent 0 23%, rgba(255,255,255,0.45) 23.2%, transparent 24%), linear-gradient(35deg, transparent 0 48%, rgba(255,255,255,0.35) 48.2%, transparent 49%)' }} />
              <div className="relative max-w-md rounded-lg bg-white p-6 text-slate-950 shadow-soft">
                <h2 className="display text-2xl font-bold">Live Fulfillment Status</h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">Real-time tracking of active rental orders and customer returns.</p>
                <div className="mt-5 space-y-3 text-sm">
                  <p className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {stats?.activeOrders || 0} active orders in progress</p>
                  <p className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> {stats?.upcomingReturns || 0} upcoming returns due soon</p>
                </div>
              </div>
            </article>

            <article className="rounded-lg bg-[#080d14] p-6 text-white shadow-lift">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Warehouse Capacity</p>
              <h2 className="display mt-5 text-2xl font-bold">Optimized Floor Space</h2>
              <div className="mt-8 space-y-6">
                <Capacity label="Furniture" value={84} />
                <Capacity label="Lighting & Decor" value={42} />
                <Capacity label="Tableware" value={68} />
              </div>
              <button type="button" onClick={() => navigate('/admin/dashboard/inventory')} className="mt-10 w-full rounded-md border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                View Inventory Map
              </button>
            </article>
          </section>
        </main>
      </div>

      {selectedOrder && (
        <Modal
          title={selectedOrder.orderNumber}
          message="Rental order details for admin fulfillment review."
          confirmText={selectedOrder.rawStatus === 'Returned' ? 'Close' : 'Mark Returned'}
          cancelText="Close"
          onCancel={() => setSelectedOrder(null)}
          onConfirm={() => (
            selectedOrder.rawStatus === 'Returned'
              ? setSelectedOrder(null)
              : updateStatus(selectedOrder, 'Returned')
          )}
        >
          <div className="space-y-4 text-sm">
            <DetailRow label="Customer" value={`${selectedOrder.customer?.name || 'Customer'} · ${selectedOrder.customer?.email || 'No email'}`} />
            <DetailRow label="Item" value={`${selectedOrder.item?.name || 'Rental item'} · Qty ${selectedOrder.quantity}`} />
            <DetailRow label="Rental Window" value={`${formatDate(selectedOrder.startDate)} to ${formatDate(selectedOrder.endDate)}`} />
            <DetailRow label="Total Value" value={formatCurrency(selectedOrder.totalValue)} />
            <DetailRow label="Status" value={selectedOrder.status} />
          </div>
        </Modal>
      )}
    </div>
  );
};

const OrderStat = ({ label, value, caption, icon: Icon, tone, danger = false }) => (
  <article className={`rounded-lg bg-white p-6 shadow-soft ${danger ? 'border border-red-200' : ''}`}>
    <div className="flex items-start justify-between gap-4">
      <div className={`grid h-12 w-12 place-items-center rounded-lg ${tone}`}>
        <Icon size={21} />
      </div>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
    </div>
    <p className={`display mt-6 text-4xl font-bold ${danger ? 'text-red-700' : 'text-slate-950'}`}>{value}</p>
    <p className={`mt-5 text-sm ${danger ? 'text-red-600' : 'text-slate-500'}`}>{caption}</p>
  </article>
);

const SelectControl = ({ label, value, onChange, options }) => (
  <label className="relative">
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 appearance-none rounded-lg bg-white py-0 pl-4 pr-10 text-sm text-slate-700"
    >
      {options.map((option) => (
        <option key={option} value={option}>{option === 'All' ? 'All Statuses' : option}</option>
      ))}
    </select>
    <ChevronDown size={17} className="pointer-events-none absolute bottom-3.5 right-4 text-slate-400" />
  </label>
);

const getOrderAction = (order, updatingId, updateStatus) => {
  const disabled = updatingId === order._id;

  if (order.status === 'Pending') {
    return (
      <button type="button" disabled={disabled} onClick={() => updateStatus(order, 'In Transit')} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
        Pick
      </button>
    );
  }

  if (order.status === 'Picked') {
    return (
      <button type="button" disabled={disabled} onClick={() => updateStatus(order, 'Out For Delivery')} className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-black disabled:opacity-50">
        Out
      </button>
    );
  }

  if (order.status === 'Out for Rental' || order.status === 'Overdue') {
    return (
      <button type="button" disabled={disabled} onClick={() => updateStatus(order, 'Returned')} className={`rounded-md px-3 py-2 text-xs font-bold disabled:opacity-50 ${order.status === 'Overdue' ? 'bg-red-600 text-white hover:bg-red-700' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
        Mark Returned
      </button>
    );
  }

  if (order.customer?.email) {
    return (
      <a href={`mailto:${order.customer.email}`} className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label={`Contact ${order.customer.name || 'customer'}`}>
        <Mail size={16} />
      </a>
    );
  }

  return (
    <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-slate-400" aria-label="Print order">
      <Printer size={16} />
    </button>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-4">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    <p className="mt-2 font-semibold text-slate-950">{value}</p>
  </div>
);

const Capacity = ({ label, value }) => (
  <div>
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-300">{label}</span>
      <span className="font-bold">{value}%</span>
    </div>
    <div className="mt-3 h-1.5 rounded-full bg-white/15">
      <div className="h-full rounded-full bg-white" style={{ width: `${value}%` }} />
    </div>
  </div>
);

const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  return `${parts[0]?.[0] || 'C'}${parts[1]?.[0] || ''}`.toUpperCase();
};

export default AdminOrders;
