import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Filter, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { bookRentalItem, getRentalItems } from '../api/rentals';
import Modal from '../components/Modal';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../contexts/AuthContext';
import { images, rentalFallback } from '../data/siteData';
import { formatCurrency, getErrorMessage } from '../utils/format';

const categories = ['All', 'Furniture', 'Tableware', 'Decor', 'Lighting'];

const Rentals = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(rentalFallback);
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState({ startDate: '', endDate: '', quantity: 1 });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRentalItems()
      .then((data) => data?.length && setItems(data))
      .catch((error) => console.warn('Using rental fallback:', error.message));
  }, []);

  const filtered = useMemo(() => (
    category === 'All' ? items : items.filter((item) => item.category === category)
  ), [items, category]);

  const openBooking = (item) => {
    if (!user || !token) {
      navigate('/signin?next=/rentals');
      return;
    }
    setSelected(item);
    setMessage('');
  };

  const submitBooking = async () => {
    if (!booking.startDate || !booking.endDate || !booking.quantity) {
      setMessage('Choose dates and quantity before booking.');
      return;
    }
    setLoading(true);
    try {
      await bookRentalItem({ ...booking, itemId: selected._id, quantity: Number(booking.quantity) }, token);
      setMessage('Rental booking saved. Redirecting...');
      setTimeout(() => navigate('/dashboard/rentals'), 700);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Unable to book rental item'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="container-page py-16">
        {!user && (
          <div className="mb-10 flex items-center justify-between gap-4 rounded-lg bg-brand-950 p-5 text-white">
            <p className="text-sm muted text-slate-300">Sign in to book rental items for your next event.</p>
            <Link to="/signin?next=/rentals" className="text-sm font-bold text-accent-300 underline">Access Guest Portal</Link>
          </div>
        )}
        <div className="mb-10">
          <p className="eyebrow">Curated Collection</p>
          <h1 className="display mt-4 text-5xl font-bold">Rental inventory</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 muted">Elevate your celebration with premium furnishings, tableware, textiles, decor, and lighting equipment.</p>
        </div>

        <div className="flex flex-col gap-5 border-b pb-8 md:flex-row md:items-center md:justify-between" style={{ borderColor: 'var(--line)' }}>
          <div className="flex flex-wrap gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-5 py-2 text-sm transition ${category === item ? 'bg-accent-700 text-white' : 'panel muted'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <button className="btn-outline w-fit"><Filter size={16} /> Sort: Featured</button>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article key={item._id} className="card overflow-hidden p-0">
              <div className="relative">
                <img src={item.image} alt={item.name} className="h-64 w-full object-cover" />
                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-950">{item.category}</span>
              </div>
              <div className="p-6">
                <h2 className="display text-xl font-bold">{item.name}</h2>
                <p className="mt-2 min-h-[48px] text-sm leading-6 muted">{item.description}</p>
                <div className="mt-6 flex items-end justify-between border-t pt-5" style={{ borderColor: 'var(--line)' }}>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] muted">Starting from</p>
                    <p className="mt-1 font-semibold">{formatCurrency(item.price)} <span className="text-xs muted">/ea</span></p>
                  </div>
                  <button type="button" onClick={() => openBooking(item)} className="btn-outline py-2">
                    Book Item
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-lg bg-brand-950 p-10 text-center text-white shadow-lift md:p-16">
          <img src={images.lights} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="relative">
            <ShoppingBag className="mx-auto text-accent-400" size={30} />
            <h2 className="display mt-5 text-3xl font-bold">Need a custom logistical solution?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">Our event architects can source specialized items and manage full installations for larger productions.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/request-quotation" className="btn-accent">Speak with an Architect</Link>
              <Link to="/services" className="btn-outline border-white/25 text-white hover:bg-white hover:text-brand-950">Download Catalog PDF</Link>
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <Modal
          title={`Book ${selected.name}`}
          message="Choose your rental window and requested quantity. Availability is confirmed by our team after submission."
          confirmText={loading ? 'Booking...' : 'Confirm Booking'}
          cancelText="Cancel"
          onCancel={() => setSelected(null)}
          onConfirm={submitBooking}
        >
          <div className="grid gap-3">
            <input type="date" value={booking.startDate} onChange={(e) => setBooking((prev) => ({ ...prev, startDate: e.target.value }))} />
            <input type="date" value={booking.endDate} onChange={(e) => setBooking((prev) => ({ ...prev, endDate: e.target.value }))} />
            <input type="number" min="1" max={selected.quantity} value={booking.quantity} onChange={(e) => setBooking((prev) => ({ ...prev, quantity: e.target.value }))} />
            {message && <p className={`flex items-center gap-2 text-sm font-semibold ${message.includes('saved') ? 'text-emerald-600' : 'text-red-500'}`}><CheckCircle2 size={16} /> {message}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Rentals;
