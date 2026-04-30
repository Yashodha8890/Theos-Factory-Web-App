import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Archive,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Edit3,
  FileText,
  Grid2X2,
  HelpCircle,
  ImageIcon,
  ImagePlus,
  LogOut,
  Mail,
  Package,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  createAdminInventoryItem,
  deleteAdminInventoryItem,
  getAdminInventory,
  updateAdminInventoryItem,
} from '../../api/admin';
import Modal from '../../components/Modal';
import { company } from '../../data/siteData';
import { formatCurrency, getErrorMessage } from '../../utils/format';

const sidebarItems = [
  { label: 'Dashboard', icon: Grid2X2, path: '/admin/dashboard' },
  { label: 'Rental Inventory', icon: Package, path: '/admin/dashboard/inventory', active: true },
  { label: 'Appointments', icon: CalendarDays },
  { label: 'Quotations', icon: FileText },
  { label: 'User Accounts', icon: Users },
];

const statusOptions = ['All', 'Available', 'Low Stock', 'Rented', 'Unavailable'];
const inventoryCategoryOptions = ['Furniture', 'Tableware', 'Decor', 'Lighting'];
const maxImageSize = 1.5 * 1024 * 1024;

const blankForm = {
  name: '',
  sku: '',
  category: '',
  image: '',
  description: '',
  price: '',
  quantity: '',
  availability: true,
};

const statusClasses = {
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Low Stock': 'bg-red-50 text-red-700 ring-red-200',
  Rented: 'bg-blue-50 text-blue-700 ring-blue-200',
  Unavailable: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const statusDotClasses = {
  Available: 'bg-emerald-500',
  'Low Stock': 'bg-red-500',
  Rented: 'bg-blue-500',
  Unavailable: 'bg-slate-400',
};

const AdminInventory = () => {
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

  const adminUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('theos_admin_user'));
    } catch (err) {
      return null;
    }
  }, []);

  const token = localStorage.getItem('theos_admin_token');

  const handleAuthError = (err, fallback) => {
    setError(getErrorMessage(err, fallback));
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      localStorage.removeItem('theos_admin_token');
      localStorage.removeItem('theos_admin_user');
      navigate('/admin', { replace: true });
    }
  };

  const loadInventory = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminInventory(token, { search, category, status });
      setItems(data.items || []);
      setStats(data.stats || null);
    } catch (err) {
      handleAuthError(err, 'Unable to load rental inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(loadInventory, search ? 220 : 0);
    return () => window.clearTimeout(timeout);
  }, [search, category, status]);

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
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || '',
      image: item.image || '',
      description: item.description || '',
      price: item.price ?? '',
      quantity: item.totalQuantity ?? item.quantity ?? '',
      availability: item.availability !== false,
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
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
      setNotice('Inventory image must be 1.5 MB or smaller.');
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
    if (!form.name.trim() || !form.category.trim() || form.price === '') {
      setNotice('Name, category, and rate are required.');
      return;
    }

    setSaving(true);
    setNotice('');

    const payload = {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity || 0),
    };

    try {
      if (editingItem?.mode === 'create') {
        await createAdminInventoryItem(token, payload);
      } else {
        await updateAdminInventoryItem(token, editingItem._id, payload);
      }
      closeEditor();
      await loadInventory();
    } catch (err) {
      setNotice(getErrorMessage(err, 'Unable to save rental item'));
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setSaving(true);
    try {
      await deleteAdminInventoryItem(token, deleteItem._id);
      setDeleteItem(null);
      await loadInventory();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete rental item'));
      setDeleteItem(null);
    } finally {
      setSaving(false);
    }
  };

  const visibleCategories = useMemo(() => ['All', ...inventoryCategoryOptions], []);
  const totalItems = stats?.totalItems ?? items.length;
  const totalUnits = stats?.totalUnits ?? items.reduce((sum, item) => sum + Number(item.totalQuantity || 0), 0);
  const availableUnits = stats?.availableUnits ?? items.reduce((sum, item) => sum + Number(item.availableQuantity || 0), 0);
  const lowStockItems = stats?.lowStockItems ?? items.filter((item) => item.status === 'Low Stock').length;
  const activeRentalUnits = stats?.activeRentalUnits ?? items.reduce((sum, item) => sum + Number(item.reservedQuantity || 0), 0);
  const availabilityRate = totalUnits ? Math.round((availableUnits / totalUnits) * 100) : 0;

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
            <button type="button" onClick={openCreate} className="btn-primary w-full bg-black hover:bg-brand-950">
              <Plus size={16} /> Add Rental Item
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
                placeholder="Search inventory, SKUs, or categories..."
                className="h-11 rounded-full border-0 bg-slate-50 py-0 pl-11 pr-4 text-sm text-slate-700 shadow-none"
              />
            </label>
            <div className="flex items-center justify-between gap-3 md:justify-end">
              <button type="button" onClick={openCreate} className="btn-accent rounded-full px-6 py-2.5">
                <Plus size={16} /> New Item
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
          <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.08em] text-accent-800">Rental Operations</p>
              <h1 className="display mt-4 text-5xl font-bold leading-tight md:text-6xl">Inventory Management</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                Oversee rental assets, monitor active rental cycles, and track stock levels across the full collection.
              </p>
            </div>
            <button type="button" onClick={openCreate} className="btn-primary bg-black px-6 hover:bg-brand-950">
              <Plus size={18} /> Add New Item
            </button>
          </section>

          {error && <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>}

          <section className="mt-9 grid gap-5 md:grid-cols-3">
            <InventoryStat
              label="TOTAL ITEMS"
              value={totalItems}
              caption={`${totalUnits.toLocaleString()} total rental units`}
              icon={Archive}
              tone="text-accent-700 bg-accent-50"
            />
            <InventoryStat
              label="AVAILABLE NOW"
              value={availableUnits.toLocaleString()}
              caption={`${availabilityRate}% of units ready to book`}
              icon={CheckCircle2}
              progress={availabilityRate}
              tone="text-emerald-700 bg-emerald-50"
            />
            <InventoryStat
              label="LOW STOCK ALERTS"
              value={lowStockItems}
              caption={lowStockItems ? 'Requires inventory review' : 'No immediate stock issues'}
              icon={AlertTriangle}
              danger={lowStockItems > 0}
              tone="text-red-700 bg-red-50"
            />
          </section>

          <section className="mt-8 rounded-lg bg-white p-5 shadow-soft">
            <div className="grid gap-4 xl:grid-cols-[1fr_220px_220px]">
              <label className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, SKU, or category..."
                  className="h-12 rounded-lg bg-white py-0 pl-11 pr-4 text-sm text-slate-700"
                />
              </label>
              <SelectControl label="Category" value={category} onChange={setCategory} options={visibleCategories} />
              <SelectControl label="Stock Status" value={status} onChange={setStatus} options={statusOptions} />
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded-lg bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-slate-100 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Item & SKU</th>
                    <th className="px-6 py-4 font-bold">Category</th>
                    <th className="px-6 py-4 font-bold">Rate / Day</th>
                    <th className="px-6 py-4 font-bold">Stock Levels</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">Loading rental inventory...</td>
                    </tr>
                  )}

                  {!loading && items.map((item) => (
                    <tr key={item._id} className="align-middle">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon size={20} />
                            )}
                          </div>
                          <div>
                            <p className="display text-2xl font-bold leading-tight text-slate-950">{item.name}</p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">SKU: {item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-600">{item.category}</td>
                      <td className="px-6 py-5 font-semibold text-slate-950">{formatCurrency(item.price)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <span className="w-16 font-semibold text-slate-950">{item.availableQuantity} / {item.totalQuantity}</span>
                          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${item.status === 'Low Stock' || item.status === 'Rented' ? 'bg-red-600' : 'bg-emerald-500'}`}
                              style={{ width: `${item.totalQuantity ? Math.max((item.availableQuantity / item.totalQuantity) * 100, item.availableQuantity ? 8 : 0) : 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ring-1 ${statusClasses[item.status] || statusClasses.Unavailable}`}>
                          <span className={`h-2 w-2 rounded-full ${statusDotClasses[item.status] || statusDotClasses.Unavailable}`} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEdit(item)} className="grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label={`Edit ${item.name}`}>
                            <Edit3 size={17} />
                          </button>
                          <button type="button" onClick={() => setDeleteItem(item)} className="grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${item.name}`}>
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && !items.length && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No rental items match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <span>Showing {items.length ? `1 to ${items.length}` : '0'} of {totalItems} items</span>
              <span>{activeRentalUnits.toLocaleString()} units currently reserved or in transit</span>
            </div>
          </section>
        </main>
      </div>

      {editingItem && (
        <Modal
          title={editingItem.mode === 'create' ? 'Add Rental Item' : 'Edit Rental Item'}
          message="Maintain the item details customers and the operations team use for rental planning."
          confirmText={saving ? 'Saving...' : 'Save Item'}
          cancelText="Cancel"
          onCancel={closeEditor}
          onConfirm={saveItem}
        >
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs font-bold tracking-[0.14em] text-slate-500">
                <span className="uppercase">Item Name</span>
                <input name="name" value={form.name} onChange={handleFormChange} className="mt-2" />
              </label>
              <label className="text-xs font-bold tracking-[0.14em] text-slate-500">
                <span className="uppercase">SKU</span>
                <input name="sku" value={form.sku} onChange={handleFormChange} placeholder="Auto-generated if empty" className="mt-2" />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs font-bold tracking-[0.14em] text-slate-500">
                <span className="uppercase">Category</span>
                <select name="category" value={form.category} onChange={handleFormChange} className="mt-2">
                  <option value="">Select category</option>
                  {inventoryCategoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  {form.category && !inventoryCategoryOptions.includes(form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                </select>
              </label>
              <label className="text-xs font-bold tracking-[0.14em] text-slate-500">
                <span className="uppercase">Rate / Day</span>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleFormChange} className="mt-2" />
              </label>
            </div>
            <label className="text-xs font-bold tracking-[0.14em] text-slate-500">
              <span className="uppercase">Stock Quantity</span>
              <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleFormChange} className="mt-2" />
            </label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Inventory Image</span>
                {form.image && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    <X size={14} /> Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[112px_1fr] sm:items-center">
                <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-400">
                  {form.image ? (
                    <img src={form.image} alt="Inventory preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={24} />
                  )}
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
            <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              Available for public booking
              <input name="availability" type="checkbox" checked={form.availability} onChange={handleFormChange} className="h-5 w-5 rounded p-0" />
            </label>
            {notice && <p className="text-sm font-semibold text-red-600">{notice}</p>}
          </div>
        </Modal>
      )}

      {deleteItem && (
        <Modal
          title="Delete Rental Item"
          message={`Remove ${deleteItem.name} from the rental inventory. Items with active rental bookings cannot be deleted.`}
          confirmText={saving ? 'Deleting...' : 'Delete Item'}
          cancelText="Cancel"
          danger
          onCancel={() => setDeleteItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

const InventoryStat = ({ label, value, caption, icon: Icon, tone, progress, danger = false }) => (
  <article className="rounded-lg bg-white p-6 shadow-soft">
    <div className="flex items-start justify-between gap-4">
      <div className={`grid h-12 w-12 place-items-center rounded-lg ${tone}`}>
        <Icon size={21} />
      </div>
      {danger && <span className="rounded bg-red-50 px-2 py-1 text-xs font-bold text-red-600">Alert</span>}
    </div>
    <p className="mt-6 text-sm uppercase leading-6 text-slate-600">{label}</p>
    <p className={`display mt-1 text-4xl font-bold ${danger ? 'text-red-700' : 'text-slate-950'}`}>{value}</p>
    {progress !== undefined && (
      <div className="mt-5 h-1.5 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-950" style={{ width: `${progress}%` }} />
      </div>
    )}
    <p className={`mt-5 text-sm ${danger ? 'text-red-600' : 'text-slate-500'}`}>{caption}</p>
  </article>
);

const SelectControl = ({ label, value, onChange, options }) => (
  <label className="relative">
    <span className="sr-only">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 appearance-none rounded-lg bg-white py-0 pl-4 pr-10 text-sm text-slate-700"
    >
      {options.map((option) => (
        <option key={option} value={option}>{option === 'All' ? `All ${label === 'Category' ? 'Categories' : 'Statuses'}` : option}</option>
      ))}
    </select>
    <ChevronDown size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
  </label>
);

export default AdminInventory;
