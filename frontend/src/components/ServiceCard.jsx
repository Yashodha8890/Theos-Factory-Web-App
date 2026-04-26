import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service, index = 0 }) => (
  <article className="group border-l p-5 md:p-7" style={{ borderColor: 'var(--line)' }}>
    <p className="text-xs font-semibold uppercase tracking-[0.24em] muted">{String(index + 1).padStart(2, '0')}.</p>
    <h3 className="mt-4 display text-2xl font-bold">{service.title}</h3>
    <div className="mt-5 overflow-hidden rounded-md bg-brand-950">
      <img src={service.image} alt={service.title} className="h-48 w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
    </div>
    <p className="mt-5 text-sm leading-6 muted">{service.shortDescription}</p>
    <Link to={service.slug === 'rental-items' ? '/rentals' : `/services/${service.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-600">
      Explore <ArrowUpRight size={15} />
    </Link>
  </article>
);

export default ServiceCard;
