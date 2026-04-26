import { ShieldCheck, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import { images } from '../data/siteData';

const values = [
  { title: 'Precision', icon: Target, copy: 'Every date, vendor handoff, layout, and detail is coordinated before guests arrive.' },
  { title: 'Elegance', icon: Sparkles, copy: 'A refined visual standard guides florals, lighting, materials, and guest-facing moments.' },
  { title: 'Trust', icon: ShieldCheck, copy: 'Clear communication, careful planning, and discretion define the client experience.' },
];

const team = ['Julian Thorne', 'Elena Moretti', 'Marcus Chen', 'Sophia Valmont'];

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
        <div className="card absolute -bottom-8 left-6 hidden w-40 p-3 md:block">
          <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80" alt="Event director" className="aspect-square rounded-md object-cover" />
        </div>
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

    <section className="container-page py-20">
      <div className="mb-10 grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-end">
        <div>
          <p className="eyebrow">The Architects</p>
          <h2 className="display mt-4 max-w-xl text-4xl font-bold">Meet the visionaries behind the scenes.</h2>
        </div>
        <p className="text-sm leading-6 muted">Our leadership team combines decades of event production, decor direction, and client service.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((name, index) => (
          <article key={name}>
            <img src={`https://api.dicebear.com/8.x/adventurer-neutral/svg?seed=${encodeURIComponent(name)}`} alt={name} className="aspect-[4/5] w-full rounded-lg bg-brand-950 object-cover p-3" />
            <h3 className="mt-4 font-semibold">{name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] muted">{index === 0 ? 'Founder' : 'Creative Director'}</p>
          </article>
        ))}
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
