import { useEffect, useMemo, useState } from 'react';
import { Download, Filter, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyQuotations } from '../../api/quotations';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { images } from '../../data/siteData';
import { useAuth } from '../../contexts/AuthContext';
import { formatBudgetRange, formatDate } from '../../utils/format';

const quoteImages = [images.table, images.ballroom, images.lounge, images.lights];

const QuotationsRequested = () => {
  const { token } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyQuotations(token)
      .then(setQuotations)
      .catch((error) => console.error('Failed to load quotations:', error))
      .finally(() => setLoading(false));
  }, [token]);

  const stats = useMemo(() => ({
    pending: quotations.filter((quote) => quote.status?.toLowerCase().includes('pending')).length,
    approved: quotations.filter((quote) => quote.status === 'Approved').length,
  }), [quotations]);

  if (loading) return <LoadingSpinner label="Loading quotations" />;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Proposals & Estimates</p>
          <h1 className="display mt-3 text-4xl font-bold md:text-6xl">Quotations Requested</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 muted">Review and manage your event quotation requests. Our team typically responds within 24-48 business hours.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline"><Filter size={16} /> Filter</button>
          <button className="btn-outline"><Download size={16} /> Export</button>
        </div>
      </section>

      {!quotations.length ? (
        <EmptyState title="No quotations requested" message="Submit a quotation request to start a proposal." actionLabel="Request Quotation" actionTo="/request-quotation" />
      ) : (
        <section className="grid gap-8 lg:grid-cols-[0.55fr_1.45fr]">
          <aside className="space-y-6">
            <article className="card p-7">
              <h2 className="display text-2xl font-bold">Quick Stats</h2>
              <div className="mt-6 divide-y" style={{ borderColor: 'var(--line)' }}>
                <p className="flex justify-between py-4"><span className="muted">Total Requests</span><strong>{quotations.length}</strong></p>
                <p className="flex justify-between py-4"><span className="muted">Pending</span><strong className="text-accent-600">{stats.pending}</strong></p>
                <p className="flex justify-between py-4"><span className="muted">Approved</span><strong>{stats.approved}</strong></p>
              </div>
            </article>
          </aside>

          <div className="space-y-6">
            {quotations.map((quote, index) => (
              <article key={quote._id} className="card overflow-hidden p-0 md:grid md:grid-cols-[300px_1fr]">
                <img src={quoteImages[index % quoteImages.length]} alt={quote.eventType} className="h-64 w-full object-cover md:h-full" />
                <div className="flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="status-pill bg-accent-100 text-accent-800">{quote.status}</span>
                      <span className="text-sm muted">REQ-{quote._id?.slice(-5).toUpperCase()}</span>
                    </div>
                    <h2 className="display mt-5 text-3xl font-bold">{quote.eventType}</h2>
                    <p className="mt-3 flex items-center gap-2 muted"><MapPin size={16} /> Event date: {formatDate(quote.eventDate)}</p>
                    <p className="mt-2 text-sm muted">{quote.guestCount} guests · {quote.serviceCategory}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="display text-3xl font-bold">{formatBudgetRange(quote.budgetRange)}</p>
                    <p className="mt-1 text-sm muted">Budget Range</p>
                    <Link to="/request-quotation" className="btn-primary mt-5">Edit Request</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default QuotationsRequested;
