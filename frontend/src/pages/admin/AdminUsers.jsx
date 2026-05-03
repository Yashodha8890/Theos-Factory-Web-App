import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Grid2X2,
  HelpCircle,
  ImagePlus,
  Images,
  LogOut,
  Mail,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  createAdminUser,
  getAdminOverview,
  getAdminUsers,
  updateAdminUser,
} from '../../api/admin';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import Modal from '../../components/Modal';
import { company } from '../../data/siteData';
import { getErrorMessage } from '../../utils/format';

const sidebarItems = [
  { label: 'Dashboard', icon: Grid2X2, path: '/admin/dashboard' },
  { label: 'Rental Inventory', icon: Package, path: '/admin/dashboard/inventory' },
  { label: 'Inventory Orders', icon: ShoppingCart, path: '/admin/dashboard/orders' },
  { label: 'Manage Gallery', icon: Images, path: '/admin/dashboard/gallery' },
  { label: 'Appointments', icon: CalendarDays, path: '/admin/dashboard/bookings' },
  { label: 'Quotations', icon: FileText, path: '/admin/dashboard/quotations' },
  { label: 'User Accounts', icon: Users, path: '/admin/dashboard/users', active: true },
];

const roleOptions = ['All', 'Admin', 'Staff', 'Customer'];
const statusOptions = ['All', 'Active', 'Suspended', 'Pending'];
const sortOptions = [
  { value: 'recent', label: 'Recently Joined' },
  { value: 'name', label: 'Name' },
  { value: 'role', label: 'Role' },
];
const blankAccountForm = {
  name: '',
  email: '',
  phone: '',
  avatar: '',
  password: '',
  role: 'user',
  status: 'Active',
};
const maxAvatarSize = 1.5 * 1024 * 1024;
const roleLabels = {
  admin: 'Admin',
  staff: 'Staff',
  user: 'Customer',
};
const rolePillClasses = {
  admin: 'bg-blue-100 text-blue-800',
  staff: 'bg-slate-950 text-white',
  user: 'bg-amber-100 text-amber-800',
};
const statusClasses = {
  Active: 'text-emerald-700',
  Suspended: 'text-red-700',
  Pending: 'text-amber-700',
};
const statusDotClasses = {
  Active: 'bg-emerald-500',
  Suspended: 'bg-red-600',
  Pending: 'bg-amber-500',
};
const defaultAdminEmail = 'admin@theosfactory.com';

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value ?? 0);

const formatLastActivity = (value) => {
  if (!value) return 'No activity';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No activity';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60000) return 'Just now';

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes} mins ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
};

const getInitials = (name = 'User') => name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase() || 'U';

const isDefaultAdminAccount = (user) => user?.protectedStatus || user?.email?.toLowerCase() === defaultAdminEmail;

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 4, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);
  const [accountForm, setAccountForm] = useState(blankAccountForm);
  const [showCreate, setShowCreate] = useState(false);
  const [manageTarget, setManageTarget] = useState(null);
  const [accessForm, setAccessForm] = useState({ role: 'user', status: 'Active', avatar: '' });
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

  const loadUsers = async (page = pagination.page) => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminUsers(token, { search, role, status, sort, page, limit: pagination.limit });
      setUsers(data.users || []);
      setStats(data.stats || null);
      setPagination(data.pagination || { page, limit: pagination.limit, total: 0, totalPages: 1 });
    } catch (err) {
      handleAuthError(err, 'Unable to load user accounts');
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
    const timeout = window.setTimeout(() => loadUsers(1), search ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [search, role, status, sort]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('theos_admin_token');
    localStorage.removeItem('theos_admin_user');
    localStorage.removeItem('theos_admin_remember');
    navigate('/admin');
  };

  const openCreate = () => {
    setAccountForm(blankAccountForm);
    setShowCreate(true);
    setError('');
    setModalError('');
  };

  const attachAvatar = (event, setter) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setModalError('Choose a valid image file.');
      return;
    }
    if (file.size > maxAvatarSize) {
      setModalError('Account image must be 1.5 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter((prev) => ({ ...prev, avatar: reader.result }));
      setModalError('');
    };
    reader.onerror = () => setModalError('Unable to read the selected image.');
    reader.readAsDataURL(file);
  };

  const submitCreate = async () => {
    setSaving(true);
    setError('');
    setModalError('');
    setNotice('');

    try {
      await createAdminUser(token, accountForm);
      setShowCreate(false);
      setNotice('Account created successfully.');
      await loadUsers(1);
    } catch (err) {
      setModalError(getErrorMessage(err, 'Unable to create account'));
    } finally {
      setSaving(false);
    }
  };

  const openManage = (user) => {
    setManageTarget(user);
    setAccessForm({ role: user.role || 'user', status: isDefaultAdminAccount(user) ? 'Active' : user.status || 'Active', avatar: user.avatar || '' });
    setError('');
    setModalError('');
  };

  const submitManage = async () => {
    if (!manageTarget) return;

    setSaving(true);
    setError('');
    setModalError('');
    setNotice('');

    try {
      await updateAdminUser(token, manageTarget._id, {
        ...accessForm,
        status: isDefaultAdminAccount(manageTarget) ? 'Active' : accessForm.status,
      });
      setManageTarget(null);
      setNotice('Account access updated.');
      await loadUsers(pagination.page);
    } catch (err) {
      setModalError(getErrorMessage(err, 'Unable to update account access'));
    } finally {
      setSaving(false);
    }
  };

  const exportReport = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Last Activity'],
      ...users.map((user) => [
        user.name,
        user.email,
        user.phone || '',
        roleLabels[user.role] || user.roleLabel || 'Customer',
        user.status || 'Active',
        formatLastActivity(user.lastActivity),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'theos-user-accounts.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const pageStart = pagination.total ? ((pagination.page - 1) * pagination.limit) + 1 : 0;
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total || 0);
  const activeAvatars = users.filter((user) => (user.status || 'Active') === 'Active').slice(0, 3);

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
                placeholder="Search user accounts..."
                className="h-11 rounded-full border-0 bg-slate-50 py-0 pl-11 pr-4 text-sm text-slate-700 shadow-none"
              />
            </label>
            <div className="flex items-center justify-between gap-3 md:justify-end">
              <AdminNotificationBell count={notificationCount} bookings={notificationBookings} />
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
              <h1 className="display text-4xl font-bold leading-tight md:text-5xl">User Account Management</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                Manage permissions, monitor activity, and oversee system access for all elite members.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={exportReport} className="btn-outline border-slate-400 bg-white px-8 text-slate-950">
                <Download size={17} /> Export Report
              </button>
              <button type="button" onClick={openCreate} className="btn-primary bg-black px-8 shadow-lift hover:bg-brand-950">
                <UserPlus size={18} /> Add New Account
              </button>
            </div>
          </section>

          {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
          {notice && <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{notice}</div>}

          <section className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <UserStatCard label="Total Users" value={stats?.totalUsers ?? 0} badge="+12%" />
            <UserStatCard label="Active Now" value={stats?.activeNow ?? 0}>
              <div className="flex -space-x-2">
                {activeAvatars.map((user) => (
                  <Avatar key={user._id} user={user} small />
                ))}
                {!!activeAvatars.length && (
                  <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500">
                    +{Math.max((stats?.activeNow || 0) - activeAvatars.length, 0)}
                  </span>
                )}
              </div>
            </UserStatCard>
            <UserStatCard label="Staff Members" value={stats?.staffMembers ?? 0} icon={ShieldCheck} />
            <UserStatCard label="Pending Requests" value={stats?.pendingRequests ?? 0} alert />
          </section>

          <section className="mt-8 rounded-lg bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <button type="button" className="btn-outline bg-slate-50 py-2 text-slate-600">
                  <Filter size={16} /> Filters
                </button>
                <div className="hidden h-8 w-px bg-slate-200 md:block" />
                <SelectControl allLabel="All Roles" value={role} onChange={setRole} options={roleOptions} />
                <SelectControl allLabel="All Status" value={status} onChange={setStatus} options={statusOptions} />
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
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-8 py-5">User Identity</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Last Activity</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user._id} className={user.status === 'Suspended' ? 'bg-slate-50/70 text-slate-400' : 'text-slate-700'}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar user={user} muted={user.status === 'Suspended'} />
                          <div className="min-w-0">
                            <p className={`font-bold ${user.status === 'Suspended' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{user.name}</p>
                            <p className="mt-1 truncate text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] ${rolePillClasses[user.role] || rolePillClasses.user}`}>
                          {roleLabels[user.role] || user.roleLabel || 'Customer'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 font-bold ${statusClasses[user.status] || statusClasses.Active}`}>
                          <span className={`h-2 w-2 rounded-full ${statusDotClasses[user.status] || statusDotClasses.Active}`} />
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-500">{formatLastActivity(user.lastActivity)}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button type="button" onClick={() => openManage(user)} className="text-xs font-bold text-slate-600 hover:text-slate-950">
                            View Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => openManage(user)}
                            className={`rounded-md px-5 py-3 text-xs font-bold transition ${
                              user.status === 'Suspended'
                                ? 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                                : 'bg-accent-600 text-white shadow-sm hover:bg-accent-700'
                            }`}
                          >
                            {user.status === 'Suspended' ? 'Reactivate' : 'Manage Access'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && !users.length && (
                    <tr>
                      <td colSpan="5" className="px-8 py-12 text-center">
                        <Users className="mx-auto text-slate-400" size={28} />
                        <p className="mt-4 font-bold text-slate-950">No user accounts found</p>
                        <p className="mt-2 text-sm text-slate-500">Adjust filters or add a new account.</p>
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td colSpan="5" className="px-8 py-12 text-center text-slate-500">Loading user accounts...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 px-8 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>Showing {pageStart} to {pageEnd} of {formatNumber(pagination.total)} accounts</p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={pagination.page <= 1} onClick={() => loadUsers(pagination.page - 1)} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white disabled:opacity-40">
                  <ChevronLeft size={17} />
                </button>
                {[1, 2, 3].filter((page) => page <= pagination.totalPages).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => loadUsers(page)}
                    className={`grid h-10 w-10 place-items-center rounded-md border text-sm font-bold ${
                      pagination.page === page ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {pagination.totalPages > 3 && <span className="px-2">...</span>}
                {pagination.totalPages > 3 && (
                  <button type="button" onClick={() => loadUsers(pagination.totalPages)} className="grid h-10 min-w-10 place-items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600">
                    {pagination.totalPages}
                  </button>
                )}
                <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => loadUsers(pagination.page + 1)} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white disabled:opacity-40">
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {showCreate && (
        <Modal
          title="Add New Account"
          message="Create an admin-managed account and assign initial access."
          onCancel={() => setShowCreate(false)}
          onConfirm={submitCreate}
          confirmText={saving ? 'Creating...' : 'Create Account'}
        >
          <div className="grid gap-4">
            {modalError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{modalError}</div>}
            <AvatarAttachControl
              avatar={accountForm.avatar}
              name={accountForm.name || 'New account'}
              onAttach={(event) => attachAvatar(event, setAccountForm)}
              onRemove={() => setAccountForm((prev) => ({ ...prev, avatar: '' }))}
            />
            <input value={accountForm.name} onChange={(event) => setAccountForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Full name" />
            <input value={accountForm.email} onChange={(event) => setAccountForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email address" />
            <input value={accountForm.phone} onChange={(event) => setAccountForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Phone number" />
            <input type="password" value={accountForm.password} onChange={(event) => setAccountForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Temporary password" />
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={accountForm.role} onChange={(event) => setAccountForm((prev) => ({ ...prev, role: event.target.value }))}>
                <option value="user">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <select value={accountForm.status} onChange={(event) => setAccountForm((prev) => ({ ...prev, status: event.target.value }))}>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {manageTarget && (
        <Modal
          title="Manage Access"
          message={`${manageTarget.name} can be assigned a new role or account status.`}
          onCancel={() => setManageTarget(null)}
          onConfirm={submitManage}
          confirmText={saving ? 'Saving...' : 'Save Access'}
        >
          <div className="grid gap-4">
            {modalError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{modalError}</div>}
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">{manageTarget.name}</p>
              <p className="mt-1 text-xs text-slate-500">{manageTarget.email}</p>
            </div>
            <AvatarAttachControl
              avatar={accessForm.avatar}
              name={manageTarget.name}
              onAttach={(event) => attachAvatar(event, setAccessForm)}
              onRemove={() => setAccessForm((prev) => ({ ...prev, avatar: '' }))}
            />
            <select value={accessForm.role} onChange={(event) => setAccessForm((prev) => ({ ...prev, role: event.target.value }))}>
              <option value="user">Customer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={isDefaultAdminAccount(manageTarget) ? 'Active' : accessForm.status}
              disabled={isDefaultAdminAccount(manageTarget)}
              onChange={(event) => setAccessForm((prev) => ({ ...prev, status: event.target.value }))}
              className={isDefaultAdminAccount(manageTarget) ? 'opacity-70' : ''}
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
            {isDefaultAdminAccount(manageTarget) && (
              <p className="rounded-md bg-emerald-50 p-3 text-xs font-semibold leading-5 text-emerald-700">
                Theo Admin is the default administrator and must always remain Active.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

const UserStatCard = ({ label, value, badge, icon: Icon, alert, children }) => (
  <article className="rounded-lg bg-white p-6 shadow-soft">
    <div className="flex min-h-[82px] items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="display mt-5 text-4xl font-bold">{formatNumber(value)}</p>
      </div>
      {badge && <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{badge}</span>}
      {Icon && <Icon size={30} className="text-slate-300" />}
      {alert && <AlertCircle size={27} className="text-red-500" />}
      {children}
    </div>
  </article>
);

const SelectControl = ({ allLabel, value, onChange, options }) => (
  <label className="flex items-center gap-2 text-sm text-slate-500">
    <span className="sr-only">{allLabel}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-auto border-0 bg-transparent px-2 py-2 text-sm font-semibold text-slate-600 shadow-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>{option === 'All' ? allLabel : option}</option>
      ))}
    </select>
  </label>
);

const AvatarAttachControl = ({ avatar, name, onAttach, onRemove }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Account Image</p>
      {avatar && (
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700">
          <X size={14} /> Remove
        </button>
      )}
    </div>
    <div className="mt-3 grid gap-3 sm:grid-cols-[76px_1fr] sm:items-center">
      <Avatar user={{ name, avatar }} />
      <div className="space-y-2">
        <label className="btn-outline w-fit cursor-pointer bg-white py-2">
          <ImagePlus size={16} /> Attach Image
          <input type="file" accept="image/*" onChange={onAttach} className="sr-only" />
        </label>
        <p className="text-xs leading-5 text-slate-500">JPG, PNG, or WebP up to 1.5 MB.</p>
      </div>
    </div>
  </div>
);

const Avatar = ({ user, small = false, muted = false }) => {
  const size = small ? 'h-8 w-8 text-[10px]' : 'h-12 w-12 text-sm';

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${size} shrink-0 rounded-lg object-cover ring-2 ring-white ${muted ? 'grayscale' : ''}`}
      />
    );
  }

  return (
    <span className={`${size} grid shrink-0 place-items-center rounded-lg bg-brand-950 font-bold text-white ring-2 ring-white ${muted ? 'bg-slate-400' : ''}`}>
      {getInitials(user.name)}
    </span>
  );
};

export default AdminUsers;
