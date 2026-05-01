import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  CalendarDays,
  ChevronDown,
  Edit3,
  Eye,
  FileImage,
  FileText,
  Grid2X2,
  HelpCircle,
  ImageIcon,
  ImagePlus,
  Images,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  createAdminGalleryItem,
  deleteAdminGalleryItem,
  getAdminGallery,
  getAdminOverview,
  updateAdminGalleryItem,
} from '../../api/admin';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import Modal from '../../components/Modal';
import { company } from '../../data/siteData';
import { formatDate, getErrorMessage } from '../../utils/format';

const sidebarItems = [
  { label: 'Dashboard', icon: Grid2X2, path: '/admin/dashboard' },
  { label: 'Rental Inventory', icon: Package, path: '/admin/dashboard/inventory' },
  { label: 'Inventory Orders', icon: ShoppingCart, path: '/admin/dashboard/orders' },
  { label: 'Manage Gallery', icon: Images, path: '/admin/dashboard/gallery', active: true },
  { label: 'Appointments', icon: CalendarDays, path: '/admin/dashboard/bookings' },
  { label: 'Quotations', icon: FileText },
  { label: 'User Accounts', icon: Users, path: '/admin/dashboard/users' },
];

const categoryOptions = ['Wedding', 'Corporate', 'Private', 'Gala', 'Decoration', 'Rentals', 'Exhibition'];
const statusOptions = ['All', 'Public', 'Private'];
const maxImageSize = 1.5 * 1024 * 1024;

const blankForm = {
  title: '',
  category: '',
  image: '',
  description: '',
  status: 'Public',
};

const AdminGallery = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(blankForm);
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

  const loadGallery = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminGallery(token, { search, category, status });
      setItems(data.items || []);
      setStats(data.stats || null);
    } catch (err) {
      handleAuthError(err, 'Unable to load gallery');
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
    const timeout = window.setTimeout(loadGallery, search ? 220 : 0);
    return () => window.clearTimeout(timeout);
  }, [search, category, status]);

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
    setForm(blankForm);
    setEditingItem({ mode: 'create' });
    setNotice('');
  };

  const openEdit = (item) => {
    setForm({
      title: item.title || '',
      category: item.category || '',
      image: item.image || '',
      description: item.description || '',
      status: item.status || 'Public',
    });
    setEditingItem(item);
    setNotice('');
  };

  const closeEditor = () => {
    setEditingItem(null);
    setForm(blankForm);
    setSaving(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageAttach = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotice('Choose a valid image file.');
      return;
    }
    if (file.size > maxImageSize) {
      setNotice('Gallery image must be 1.5 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: reader.result }));
      setNotice('');
    };
    reader.onerror = () => setNotice('Unable to read the selected image.');
    reader.readAsDataURL(file);
  };

  const saveItem = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.image) {
      setNotice('Title, category, and image are required.');
      return;
    }

    setSaving(true);
    setNotice('');

    try {
      if (editingItem?.mode === 'create') {
        await createAdminGalleryItem(token, form);
      } else {
        await updateAdminGalleryItem(token, editingItem._id, form);
      }
      closeEditor();
      await loadGallery();
    } catch (err) {
      setNotice(getErrorMessage(err, 'Unable to save gallery image'));
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setSaving(true);
    try {
      await deleteAdminGalleryItem(token, deleteItem._id);
      setDeleteItem(null);
      await loadGallery();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete gallery image'));
      setDeleteItem(null);
    } finally {
      setSaving(false);
    }
  };

  const recentUploadText = stats?.recentUpload?.createdAt ? formatDate(stats.recentUpload.createdAt) : 'No uploads';
  const mostViewedTitle = stats?.mostViewed?.title || 'No views yet';

  return (
    <div className="min-h-screen bg-[#faf8f8] text-[#171717] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-200 bg-[#f5f8fb] lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="px-6 py-7">
            <p className="text-xl font-bold tracking-tight">{company.name} Admin</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">Content Control</p>
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
            <button type="button" onClick={openCreate} className="btn-primary w-full bg-black hover:bg-brand-950">
              <Upload size={16} /> Upload Images
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
                placeholder="Search gallery images..."
                className="h-11 rounded-full border-0 bg-slate-50 py-0 pl-11 pr-4 text-sm text-slate-700 shadow-none"
              />
            </label>

            <div className="flex items-center justify-between gap-3 md:justify-end">
              <AdminNotificationBell
                count={notificationCount}
                bookings={notificationBookings}
                onViewAll={() => navigate('/admin/dashboard#rental-booking-notifications')}
              />
              <button type="button" onClick={handleLogout} className="grid h-10 w-10 place-items-center rounded-full bg-accent-100 text-sm font-bold text-accent-700 ring-2 ring-white" aria-label="Admin account">
                {adminUser?.name?.[0] || 'A'}
              </button>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 lg:px-9 lg:py-10">
          <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.08em] text-slate-500">Admin / Gallery</p>
              <h1 className="display mt-4 text-5xl font-bold leading-tight md:text-6xl">Manage Gallery</h1>
            </div>
            <button type="button" onClick={openCreate} className="btn-primary bg-black px-6 hover:bg-brand-950">
              <Upload size={18} /> Upload Images
            </button>
          </section>

          {error && <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>}

          <section className="mt-9 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
            <GalleryStat label="Total Images" value={stats?.totalImages ?? 0} caption="+ managed assets" icon={FileImage} />
            <GalleryStat label="Categories" value={stats?.categories ?? 0} caption="Active segments" icon={Archive} />
            <GalleryStat label="Most Viewed" value={truncate(mostViewedTitle, 14)} caption={`${(stats?.mostViewed?.views || 0).toLocaleString()} views`} icon={Eye} />
            <GalleryStat label="Recent Uploads" value={recentUploadText} caption={stats?.recentUpload?.title || 'Upload a gallery image'} icon={CalendarDays} />
          </section>

          <section className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectControl label="Category" value={category} onChange={setCategory} options={['All', ...categoryOptions]} />
              <SelectControl label="Status" value={status} onChange={setStatus} options={statusOptions} />
            </div>
            <p className="text-sm text-slate-500">Showing {items.length ? `1 - ${items.length}` : '0'} of {stats?.totalImages ?? items.length} items</p>
          </section>

          <section className="mt-8 grid gap-7 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {loading && <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow-soft sm:col-span-2 xl:col-span-3 2xl:col-span-4">Loading gallery...</div>}

            {!loading && items.map((item) => (
              <article key={item._id} className="overflow-hidden rounded-lg bg-white shadow-soft">
                <div className="relative h-56 bg-slate-100">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-slate-400"><ImageIcon size={30} /></div>
                  )}
                  <span className={`absolute left-4 top-4 rounded bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${item.status === 'Private' ? 'text-slate-950' : 'text-slate-600'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="display text-2xl font-bold leading-tight text-slate-950">{truncate(item.title, 18)}</h2>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => openEdit(item)} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-950" aria-label={`Edit ${item.title}`}>
                        <Edit3 size={16} />
                      </button>
                      <button type="button" onClick={() => setDeleteItem(item)} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${item.title}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-3 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">{item.category}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </article>
            ))}

            {!loading && !items.length && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center shadow-soft sm:col-span-2 xl:col-span-3 2xl:col-span-4">
                <Images className="mx-auto text-slate-400" size={30} />
                <p className="mt-4 text-sm font-bold text-slate-950">No gallery images match the current filters.</p>
                <p className="mt-2 text-sm text-slate-500">Upload a new image or adjust category and status filters.</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {editingItem && (
        <Modal
          title={editingItem.mode === 'create' ? 'Upload Gallery Image' : 'Edit Gallery Image'}
          message="Manage the image, category, visibility, and gallery description."
          confirmText={saving ? 'Saving...' : 'Save Image'}
          cancelText="Cancel"
          onCancel={closeEditor}
          onConfirm={saveItem}
        >
          <div className="grid gap-4">
            <label className="text-xs font-bold tracking-[0.14em] text-slate-500">
              <span className="uppercase">Title</span>
              <input name="title" value={form.title} onChange={handleFormChange} className="mt-2" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs font-bold tracking-[0.14em] text-slate-500">
                <span className="uppercase">Category</span>
                <select name="category" value={form.category} onChange={handleFormChange} className="mt-2">
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  {form.category && !categoryOptions.includes(form.category) && <option value={form.category}>{form.category}</option>}
                </select>
              </label>
              <label className="text-xs font-bold tracking-[0.14em] text-slate-500">
                <span className="uppercase">Status</span>
                <select name="status" value={form.status} onChange={handleFormChange} className="mt-2">
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </label>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Gallery Image</span>
                {form.image && (
                  <button type="button" onClick={() => setForm((prev) => ({ ...prev, image: '' }))} className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700">
                    <X size={14} /> Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[128px_1fr] sm:items-center">
                <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-400">
                  {form.image ? <img src={form.image} alt="Gallery preview" className="h-full w-full object-cover" /> : <ImageIcon size={26} />}
                </div>
                <div className="space-y-3">
                  <label className="btn-outline w-fit cursor-pointer bg-white py-2">
                    <ImagePlus size={16} /> Attach Image
                    <input type="file" accept="image/*" onChange={handleImageAttach} className="sr-only" />
                  </label>
                  <p className="text-xs font-medium tracking-normal text-slate-500">JPG, PNG, or WebP up to 1.5 MB.</p>
                </div>
              </div>
            </div>
            <label className="text-xs font-bold tracking-[0.14em] text-slate-500">
              <span className="uppercase">Description</span>
              <textarea name="description" value={form.description} onChange={handleFormChange} rows="3" className="mt-2" />
            </label>
            {notice && <p className="text-sm font-semibold text-red-600">{notice}</p>}
          </div>
        </Modal>
      )}

      {deleteItem && (
        <Modal
          title="Delete Gallery Image"
          message={`Remove ${deleteItem.title} from the gallery. This cannot be undone.`}
          confirmText={saving ? 'Deleting...' : 'Delete Image'}
          cancelText="Cancel"
          danger
          onCancel={() => setDeleteItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

const GalleryStat = ({ label, value, caption, icon: Icon }) => (
  <article className="rounded-lg bg-white p-6 shadow-soft">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="display mt-4 text-3xl font-bold text-slate-950">{value}</p>
      </div>
      <Icon className="text-slate-400" size={20} />
    </div>
    <p className="mt-6 text-sm text-slate-500">{caption}</p>
  </article>
);

const SelectControl = ({ label, value, onChange, options }) => (
  <label className="relative min-w-[220px]">
    <span className="sr-only">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 appearance-none rounded-lg bg-white py-0 pl-4 pr-10 text-sm text-slate-700 shadow-soft">
      {options.map((option) => (
        <option key={option} value={option}>{option === 'All' ? `All ${label}` : option}</option>
      ))}
    </select>
    <ChevronDown size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
  </label>
);

const truncate = (value = '', max = 20) => (
  value.length > max ? `${value.slice(0, max - 3)}...` : value
);

export default AdminGallery;
