import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Download, Filter, Package, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyRentals } from '../../api/rentals';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import SummaryCard from '../../components/SummaryCard';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../utils/format';

const RentedItems = () => {
  const { token } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyRentals(token)
      .then(setRentals)
      .catch((error) => console.error('Failed to load rentals:', error))
      .finally(() => setLoading(false));
  }, [token]);

  const totals = useMemo(() => ({
    quantity: rentals.reduce((sum, rental) => sum + Number(rental.quantity || 0), 0),
    value: rentals.reduce((sum, rental) => sum + Number(rental.quantity || 0) * Number(rental.itemId?.price || 0), 0),
  }), [rentals]);

  if (loading) return <LoadingSpinner label="Loading rentals" />;
  const active = rentals[0];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.6fr] lg:items-end">
        <div>
          <p className="eyebrow">Active Engagements</p>
          <h1 className="display mt-3 text-4xl font-bold md:text-6xl">Inventory Logistics</h1>
          <p className="mt-4 text-lg muted">Track your premium furniture, decor, and rental equipment.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard title="Items Out" value={totals.quantity} icon={<Package size={21} />} />
          <SummaryCard title="Upcoming" value={rentals.length} icon={<CalendarCheck size={21} />} tone="blue" />
        </div>
      </section>

      {!rentals.length ? (
        <EmptyState title="No rental bookings" message="Browse the rental collection and reserve items for your event." actionLabel="Browse Rentals" actionTo="/rentals" />
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <article className="card overflow-hidden p-0 md:grid md:grid-cols-[330px_1fr]">
              <img src={active.itemId?.image} alt={active.itemId?.name} className="h-full min-h-[360px] w-full object-cover" />
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <span className="status-pill bg-accent-100 text-accent-800">{active.status}</span>
                  <span className="text-sm muted">ID: #{active._id?.slice(-6).toUpperCase()}</span>
                </div>
                <h2 className="display mt-8 text-4xl font-bold">{active.itemId?.name}</h2>
                <p className="mt-4 text-lg leading-8 muted">{active.itemId?.description}</p>
                <div className="mt-8 space-y-4 text-sm">
                  <p>{formatDate(active.startDate)} - {formatDate(active.endDate)}</p>
                  <p>Quantity: {active.quantity}</p>
                </div>
                <div className="mt-8 flex items-end justify-between border-t pt-6" style={{ borderColor: 'var(--line)' }}>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] muted">Total Cost</p>
                    <p className="display text-2xl font-bold">{formatCurrency(Number(active.quantity) * Number(active.itemId?.price || 0))}</p>
                  </div>
                  <Link to="/rentals" className="btn-primary">View Logistics</Link>
                </div>
              </div>
            </article>

            <article className="rounded-lg bg-brand-950 p-8 text-white shadow-lift">
              <p className="eyebrow">Next Return</p>
              <div className="mt-8 flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-lg bg-white/10"><Truck /></span>
                <div>
                  <h2 className="display text-2xl font-bold">Scheduled</h2>
                  <p className="text-sm text-slate-400">{active.itemId?.name}</p>
                </div>
              </div>
              <div className="mt-8 rounded-md border border-white/15 p-5 text-sm">
                <p className="flex justify-between"><span className="text-slate-400">Return:</span><strong>{formatDate(active.endDate)}</strong></p>
                <p className="mt-4 flex justify-between"><span className="text-slate-400">Driver:</span><strong>Marcus Sterling</strong></p>
                <p className="mt-4 flex justify-between"><span className="text-slate-400">Vehicle:</span><strong>Logistics Van #04</strong></p>
              </div>
              <button className="btn-outline mt-8 w-full border-white/20 text-white hover:bg-white hover:text-brand-950">Confirm Pickup</button>
            </article>
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="display text-4xl font-bold">Booking History</h2>
              <div className="flex gap-3">
                <button className="btn-outline h-10 w-10 px-0"><Filter size={16} /></button>
                <button className="btn-outline h-10 w-10 px-0"><Download size={16} /></button>
              </div>
            </div>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead style={{ background: 'var(--surface-soft)' }}>
                  <tr className="muted">
                    <th className="px-6 py-4 font-semibold">Rental Item</th>
                    <th className="px-6 py-4 font-semibold">Period</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Quantity</th>
                    <th className="px-6 py-4 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((rental) => (
                    <tr key={rental._id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                      <td className="px-6 py-5 font-semibold">{rental.itemId?.name}</td>
                      <td className="px-6 py-5">{formatDate(rental.startDate)} - {formatDate(rental.endDate)}</td>
                      <td className="px-6 py-5"><span className="status-pill bg-brand-100 text-brand-800">{rental.status}</span></td>
                      <td className="px-6 py-5">{rental.quantity}</td>
                      <td className="px-6 py-5 text-right font-semibold">{formatCurrency(Number(rental.quantity) * Number(rental.itemId?.price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            <SummaryCard title="Open Balances" value={formatCurrency(totals.value)} icon={<Package size={21} />} />
            <SummaryCard title="Total Invested (YTD)" value={formatCurrency(totals.value * 4)} icon={<Truck size={21} />} tone="blue" />
            <article className="rounded-lg border border-accent-200 bg-accent-50 p-6 text-accent-950 dark:bg-accent-400/10 dark:text-accent-100">
              <h3 className="display text-2xl font-bold">Theo Loyalty Rewards</h3>
              <p className="mt-3 text-sm leading-6">You have points available for your next rental.</p>
              <Link to="/rentals" className="mt-5 inline-flex text-sm font-bold">Redeem Now</Link>
            </article>
          </section>
        </>
      )}
    </div>
  );
};

export default RentedItems;
