import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getServiceBySlug } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';
import { serviceFallback } from '../data/siteData';

const detailBullets = {
  decoration: ['Floral direction', 'Lighting concepts', 'Tablescapes and drapery', 'Install and strike coordination'],
  planning: ['Timeline management', 'Vendor coordination', 'Guest flow planning', 'Onsite run of show'],
  'rental-items': ['Furniture sourcing', 'Tableware and linens', 'Lighting and decor pieces', 'Delivery and return scheduling'],
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallbackService = useMemo(() => serviceFallback.find((item) => item.slug === slug), [slug]);

  useEffect(() => {
    const loadService = async () => {
      setLoading(true);
      try {
        const data = await getServiceBySlug(slug);
        setService(data);
      } catch (error) {
        setService(fallbackService || null);
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [slug, fallbackService]);

  if (loading) return <LoadingSpinner label="Loading service" />;
  if (!service) {
    return (
      <section className="container-page py-24">
        <div className="card p-10 text-center">
          <h1 className="display text-3xl font-bold">Service not found</h1>
          <Link to="/services" className="btn-accent mt-6">Back to Services</Link>
        </div>
      </section>
    );
  }

  return (
    <div>
      <section className="container-page grid gap-12 py-20 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow">Service</p>
          <h1 className="display mt-4 text-5xl font-bold leading-tight md:text-6xl">{service.title}</h1>
          <p className="mt-6 text-lg leading-8 muted">{service.shortDescription}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {(detailBullets[service.slug] || detailBullets.decoration).map((item) => (
              <p key={item} className="flex items-center gap-3 text-sm"><CheckCircle2 size={17} className="text-accent-600" /> {item}</p>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/request-quotation" className="btn-primary">Request Quotation <ArrowRight size={16} /></Link>
            {service.slug === 'rental-items' && <Link to="/rentals" className="btn-outline">Browse Rentals</Link>}
          </div>
        </div>
        <img src={service.image} alt={service.title} className="aspect-[4/5] w-full rounded-lg object-cover shadow-lift md:aspect-[5/4]" />
      </section>

      <section className="py-20" style={{ background: 'var(--surface-soft)' }}>
        <div className="container-page grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <p className="eyebrow">Approach</p>
          <div>
            <h2 className="display text-4xl font-bold">Built around your venue, date, and guest experience.</h2>
            <p className="mt-6 max-w-3xl text-sm leading-7 muted">{service.fullDescription}</p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {['Discovery', 'Proposal', 'Execution'].map((step, index) => (
                <article key={step} className="card p-6">
                  <p className="text-sm font-bold text-accent-600">0{index + 1}</p>
                  <h3 className="display mt-4 text-xl font-bold">{step}</h3>
                  <p className="mt-3 text-sm leading-6 muted">A focused phase that keeps scope, budget, and timing clear.</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
