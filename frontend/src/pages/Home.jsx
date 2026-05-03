import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getServices } from '../api/services';
import { getGalleryItems } from '../api/gallery';
import GalleryGrid from '../components/GalleryGrid';
import HomeHeroCarousel from '../components/HomeHeroCarousel';
import ServiceCard from '../components/ServiceCard';
import { publicGalleryFallback, serviceFallback, serviceHighlights } from '../data/siteData';

const Home = () => {
  const [services, setServices] = useState(serviceFallback);
  const [gallery, setGallery] = useState(publicGalleryFallback);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [serviceData, galleryData] = await Promise.all([getServices(), getGalleryItems()]);
        if (serviceData?.length) setServices(serviceData);
        if (galleryData?.length) setGallery(galleryData);
      } catch (error) {
        console.warn('Using local public content fallback:', error.message);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <HomeHeroCarousel />

     {/*  <section className="bg-brand-950 py-20 text-white">
        <div className="container-page grid gap-12 md:grid-cols-[0.6fr_1.4fr]">
          <p className="eyebrow">Our Manifesto</p>
          <div>
            <h2 className="display max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              A <span className="italic text-accent-400">surgical</span> approach to celebration.
            </h2>
            <div className="mt-10 grid gap-8 text-sm leading-7 text-slate-400 md:grid-cols-2">
              <p>We design high-touch event experiences where every visual decision supports flow, comfort, and guest memory.</p>
              <p>Our team balances creative direction with operational discipline: decor, rental logistics, vendors, dates, and details.</p>
            </div>
          </div>
        </div>
      </section> */}

      <section className="border-y bg-brand-950 text-white" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        <div className="container-page py-16">
          <div className="mb-10 flex items-end justify-between gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Services</p>
            {/* <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-400">Curated Capabilities</p> */}
          </div>
          <div className="grid gap-0 md:grid-cols-3">
            {(services.length ? services : serviceHighlights).map((service, index) => (
              <ServiceCard key={service._id || service.slug || service.title} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <div className="mb-10 grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <p className="eyebrow">The Archive</p>
            <p className="max-w-md text-sm leading-6 muted md:justify-self-end">
              A visual library of ceremonies, corporate occasions, private dinners, and rental-led event environments.
            </p>
          </div>
          <GalleryGrid items={gallery.slice(0, 5)} />
        </div>
      </section>

      <section className="bg-brand-950 py-24 text-white">
        <div className="container-page">
          <h2 className="display max-w-4xl text-5xl font-bold uppercase leading-tight md:text-7xl">
            Ready to <span className="italic text-accent-400">construct</span><br />the unforgettable?
          </h2>
          <Link to="/book-appointment" className="btn-outline mt-10 border-white/20 text-white hover:bg-white hover:text-brand-950">
            Start the Inquiry <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
