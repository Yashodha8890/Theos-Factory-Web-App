import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bell, Package } from 'lucide-react';
import { formatDate } from '../utils/format';

const AdminNotificationBell = ({ count = 0, bookings = [], onViewAll }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const handleViewAll = () => {
    setOpen(false);
    onViewAll?.();
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
        aria-label={`${count} rental booking notifications`}
        aria-expanded={open}
      >
        <Bell size={19} />
        {count > 0 && (
          <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lift">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-950">Rental notifications</p>
                <p className="mt-1 text-xs text-slate-500">{count ? `${count} new booking request${count === 1 ? '' : 's'}` : 'No new booking requests'}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${count ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {count ? 'New' : 'Clear'}
              </span>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {bookings.map((booking) => (
              <div key={booking._id} className="border-b border-slate-100 p-4 last:border-b-0">
                <div className="flex gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                    {booking.itemId?.image ? (
                      <img src={booking.itemId.image} alt={booking.itemId?.name || 'Rental item'} className="h-full w-full object-cover" />
                    ) : (
                      <Package size={18} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950">{booking.itemId?.name || 'Rental item'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {booking.userId?.name || 'Customer'} requested {booking.quantity} item{Number(booking.quantity) === 1 ? '' : 's'}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-slate-700">
                      {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
                    </p>
                    <span className="mt-3 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {!bookings.length && (
              <div className="p-6 text-center">
                <Package className="mx-auto text-slate-400" size={24} />
                <p className="mt-3 text-sm font-bold text-slate-950">No rental requests</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">Customer rental bookings will appear here as soon as they are submitted.</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleViewAll}
            className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-sm font-bold text-accent-700 hover:bg-accent-50"
          >
            View notification details <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;
