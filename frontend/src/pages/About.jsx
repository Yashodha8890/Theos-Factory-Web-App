import { ShieldCheck, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import { images } from '../data/siteData';

const values = [
  { title: 'Precision', icon: Target, copy: 'Every date, vendor handoff, layout, and detail is coordinated before guests arrive.' },
  { title: 'Elegance', icon: Sparkles, copy: 'A refined visual standard guides florals, lighting, materials, and guest-facing moments.' },
  { title: 'Trust', icon: ShieldCheck, copy: 'Clear communication, careful planning, and discretion define the client experience.' },
];

const ownersImage = '/images/owners.jpg';
const founderImage = '/images/founder-2.jpg';
const team = [
  {
    name: "Theo's Founders",
    role: 'Founder',
    image: ownersImage,
  },
  {
    name: "Theo's Founder",
    role: 'Founder',
    image: founderImage,
  },
];

const handleOwnersImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = images.venue;
};

const About = () => (
  <div>
    <section className="container-page grid min-h-[620px] items-center gap-12 py-16 lg:grid-cols-2">
      <div>
        <p className="eyebrow">Est. 2012</p>
        <h1 className="display mt-5 max-w-xl text-4xl font-bold leading-tight md:text-6xl">
          Crafting moments of unrivaled distinction.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 muted">
          Since our inception, Theo's Factory has refined the art of hospitality, blending meticulous logistical precision with the warmth of curated human experiences.
        </p>
      </div>
      <div className="relative">
        <img src={images.table} alt="Luxury event table setting" className="aspect-[4/5] w-full rounded-lg object-cover shadow-lift lg:aspect-[5/4]" />
      </div>
    </section>

    <section className="py-20" style={{ background: 'var(--surface-soft)' }}>
      <SectionHeader
        eyebrow="Mission"
        title="Logistical excellence with a design eye."
        copy="We make the complex work feel calm: planning, styling, rentals, setup, guest flow, and the many small decisions that shape a premium event."
      />
    </section>

    <section className="container-page grid gap-6 py-20 md:grid-cols-3">
      {values.map(({ title, icon: Icon, copy }, index) => (
        <article key={title} className={`card p-8 ${index === 1 ? 'bg-brand-950 text-white dark:bg-white dark:text-brand-950' : ''}`}>
          <Icon size={22} className="text-accent-500" />
          <h2 className="display mt-8 text-2xl font-bold">{title}</h2>
          <p className={`mt-4 text-sm leading-7 ${index === 1 ? 'text-slate-300 dark:text-slate-600' : 'muted'}`}>{copy}</p>
        </article>
      ))}
    </section>

    <section className="py-20" style={{ background: 'var(--surface-soft)' }}>
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <p className="eyebrow">The Architects</p>
          <h2 className="display mt-4 max-w-xl text-4xl font-bold leading-tight md:text-5xl">
            Meet the visionaries behind the scenes.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 muted">
            Our leadership team combines decades of event production, decor direction, and client service.
          </p>
          <div className="mt-8 h-px w-20 bg-accent-500" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {['Event production', 'Decor direction', 'Client service', 'Hands-on setup'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-accent-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {team.map(({ name, role, image }, index) => (
            <article
              key={name}
              className={`group overflow-hidden rounded-lg border shadow-soft ${index === 1 ? 'sm:mt-10' : ''}`}
              style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
            >
              <div className="relative overflow-hidden bg-brand-950">
                <img
                  src={image}
                  onError={handleOwnersImageError}
                  alt={name}
                  className="aspect-[3/4] w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-300">{role}</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="display text-2xl font-bold">{name}</h3>
                <p className="mt-3 text-sm leading-6 muted">
                  Owner-led creative direction with a close eye on guest experience, styling, and event flow.
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="container-page pb-20">
      <div className="rounded-lg bg-brand-950 px-6 py-16 text-center text-white shadow-lift md:px-12">
        <h2 className="display text-4xl font-bold">Ready to begin your journey with us?</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400">Experience careful logistics and refined design from the first conversation.</p>
        <Link to="/book-appointment" className="btn-accent mt-8">Inquire Now</Link>
      </div>
    </section>
  </div>
);

export default About;
