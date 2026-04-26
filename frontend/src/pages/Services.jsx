import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, Gem, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getServices } from '../api/services';
import ServiceCard from '../components/ServiceCard';
import SectionHeader from '../components/SectionHeader';
import { images, serviceFallback } from '../data/siteData';

const Services = () => {
  const [services, setServices] = useState(serviceFallback);

  useEffect(() => {
    getServices()
      .then((data) => data?.length && setServices(data))
      .catch((error) => console.warn('Using local services fallback:', error.message));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-950 py-28 text-white">
        <img src={images.chandeliers} alt="Grand chandelier event room" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-black/55" />
        <SectionHeader
          className="relative"
          eyebrow="Luxury Hospitality"
          title="Our comprehensive services"
          copy="From initial concept to final execution, we provide a seamless spectrum of event excellence designed for discerning clients."
        />
      </section>

      <section className="container-page grid gap-12 py-20 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow">Aesthetic Mastery</p>
          <h2 className="display mt-4 text-4xl font-bold">Exquisite decoration</h2>
          <p className="mt-5 text-sm leading-7 muted">
            We transform venues into immersive environments through precise floral design, architectural lighting, custom props, stage details, and atmospheric texture.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            {['Couture floral design', 'Atmospheric lighting', 'Drapery, tablescapes, and focal installations'].map((item) => (
              <p key={item} className="flex items-center gap-3"><CheckCircle2 size={17} className="text-accent-600" /> {item}</p>
            ))}
          </div>
          <Link to="/services/decoration" className="btn-outline mt-8">Learn More <ArrowRight size={16} /></Link>
        </div>
        <div className="card overflow-hidden p-0">
          <img src={images.table} alt="Formal decorated dining table" className="aspect-[4/3] w-full object-cover" />
          <p className="p-6 display text-lg italic">"Every petal and beam of light is placed with intentionality."</p>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--surface-soft)' }}>
        <div className="container-page">
          <SectionHeader eyebrow="Logistical Precision" title="Expert planning & coordination" copy="Vendor orchestration, timeline creation, and onsite leadership so you can remain present for your guests." />
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <article className="card p-8">
              <h3 className="display text-2xl font-bold">Strategic logistics</h3>
              <div className="mt-6 grid gap-4 text-sm muted md:grid-cols-2">
                <p className="flex gap-3"><CheckCircle2 size={17} className="text-accent-600" /> Vendor contract negotiation</p>
                <p className="flex gap-3"><CheckCircle2 size={17} className="text-accent-600" /> Minute-by-minute run of show</p>
                <p className="flex gap-3"><CheckCircle2 size={17} className="text-accent-600" /> RSVP and guest list management</p>
                <p className="flex gap-3"><CheckCircle2 size={17} className="text-accent-600" /> Onsite production notes</p>
              </div>
              <Link to="/services/planning" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-600">Explore planning services <ArrowRight size={15} /></Link>
            </article>
            <article className="rounded-lg bg-brand-950 p-8 text-center text-white shadow-lift">
              <Clock3 className="mx-auto text-accent-400" size={34} />
              <h3 className="display mt-10 text-2xl font-bold">On-site mastery</h3>
              <p className="mt-4 text-sm leading-6 text-slate-400">Continuous presence from first load-in to final strike.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-20 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="grid grid-cols-2 gap-4">
          {[images.lounge, images.wedding, images.lights, images.chandeliers].map((image, index) => (
            <img key={image} src={image} alt="" className={`rounded-lg object-cover shadow-soft ${index === 0 ? 'aspect-square' : 'aspect-[4/3]'}`} />
          ))}
        </div>
        <div>
          <p className="eyebrow">The Curated Collection</p>
          <h2 className="display mt-4 text-4xl font-bold">Premium rental items</h2>
          <p className="mt-5 text-sm leading-7 muted">Access our exclusive inventory of furniture, artisan tableware, textiles, lighting, and event structures. Every item supports a high-end event composition.</p>
          <div className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
            {['Furniture', 'Tableware', 'Textiles', 'Structures'].map((item) => (
              <div key={item} className="flex gap-3"><Gem size={17} className="text-accent-600" /><span>{item}</span></div>
            ))}
          </div>
          <Link to="/rentals" className="btn-accent mt-8">View Inventory Catalog <Sparkles size={16} /></Link>
        </div>
      </section>

      <section className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="container-page grid gap-0 py-16 md:grid-cols-3">
          {services.map((service, index) => <ServiceCard key={service._id || service.slug} service={service} index={index} />)}
        </div>
      </section>
    </div>
  );
};

export default Services;
