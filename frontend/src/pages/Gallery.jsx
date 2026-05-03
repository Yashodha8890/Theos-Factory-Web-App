import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGalleryItems } from '../api/gallery';
import SectionHeader from '../components/SectionHeader';
import { publicGalleryFallback } from '../data/siteData';

const categories = ['All', 'Wedding', 'Corporate', 'Private', 'Decoration', 'Rentals'];
const galleryTypes = categories.slice(1);

const normalizeGalleryType = (value) => {
  if (galleryTypes.includes(value)) return value;
  if (value === 'Gala' || value === 'Exhibition') return 'Decoration';
  return 'Decoration';
};

const Gallery = () => {
  const [items, setItems] = useState(publicGalleryFallback);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    getGalleryItems()
      .then((data) => data?.length && setItems(data))
      .catch((error) => console.warn('Using gallery fallback:', error.message));
  }, []);

  const filtered = useMemo(() => (
    category === 'All' ? items : items.filter((item) => normalizeGalleryType(item.category) === category)
  ), [category, items]);

  return (
    <div>
      <section className="container-page py-20">
        <SectionHeader
          eyebrow="Curated Experiences"
          title="A legacy of excellence"
          copy="Explore a portfolio of planned, styled, and carefully executed events where logistics meet luxury."
        />

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full px-6 py-2 text-xs font-semibold transition ${category === item ? 'bg-brand-950 text-white dark:bg-white dark:text-brand-950' : 'panel muted'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-12 columns-1 gap-7 sm:columns-2 lg:columns-3">
          {filtered.map((item, index) => (
            <article key={item._id || item.title} className="mb-7 break-inside-avoid overflow-hidden rounded-lg bg-brand-950 shadow-soft">
              <img src={item.image} alt={item.title} className={`w-full object-cover ${index % 3 === 0 ? 'h-[520px]' : 'h-[360px]'}`} />
              <div className="p-5 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-300">{normalizeGalleryType(item.category)}</p>
                <h3 className="display mt-2 text-2xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="rounded-lg bg-brand-950 px-6 py-16 text-center text-white shadow-lift">
          <h2 className="display text-4xl font-bold">Ready to curate your next masterpiece?</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400">Let us handle the details while you focus on the vision.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-accent">Contact Us</Link>
            <Link to="/services" className="btn-outline border-white/20 text-white hover:bg-white hover:text-brand-950">View Services</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
