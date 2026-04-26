import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { company, homeCarouselSlides } from '../data/siteData';

const SLIDE_DURATION = 6200;

const HomeHeroCarousel = () => {
  const [active, setActive] = useState(0);
  const [sources, setSources] = useState(() => homeCarouselSlides.map((slide) => slide.image));
  const slide = homeCarouselSlides[active];
  const accentStart = slide.headline.toLowerCase().indexOf(slide.accent.toLowerCase());
  const headingBefore = accentStart >= 0 ? slide.headline.slice(0, accentStart) : slide.headline;
  const headingAccent = accentStart >= 0 ? slide.headline.slice(accentStart, accentStart + slide.accent.length) : '';
  const headingAfter = accentStart >= 0 ? slide.headline.slice(accentStart + slide.accent.length) : '';

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % homeCarouselSlides.length);
    }, SLIDE_DURATION);

    return () => window.clearInterval(timer);
  }, []);

  const move = (direction) => {
    setActive((current) => {
      const next = current + direction;
      if (next < 0) return homeCarouselSlides.length - 1;
      if (next >= homeCarouselSlides.length) return 0;
      return next;
    });
  };

  const handleImageError = (index) => {
    setSources((current) => {
      if (current[index] === homeCarouselSlides[index].fallback) return current;
      const next = [...current];
      next[index] = homeCarouselSlides[index].fallback;
      return next;
    });
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-brand-950 text-white">
      <div className="absolute inset-0">
        {homeCarouselSlides.map((item, index) => (
          <div
            key={item.title}
            className={`absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-out ${index === active ? 'scale-100 opacity-100' : 'scale-[1.02] opacity-0'}`}
            aria-hidden={index !== active}
          >
            <img
              src={sources[index]}
              alt={item.title}
              onError={() => handleImageError(index)}
              className={`h-full w-full object-cover ${index === active ? 'animate-hero-kenburns' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-brand-950" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/30" />
          </div>
        ))}
      </div>

      <div className="container-page relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-between py-8 md:py-12">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div key={slide.title} className="max-w-3xl animate-hero-text-in">
            <p className="eyebrow">{slide.label}</p>
            <h1 className="display mt-5 text-5xl font-bold leading-[0.95] md:text-7xl xl:text-8xl">
              {headingBefore}
              {headingAccent && <span className="italic text-accent-400">{headingAccent}</span>}
              {headingAfter}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
              {slide.copy}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to={slide.actionTo} className="btn-accent">
                {slide.actionLabel} <ArrowRight size={16} />
              </Link>
              <Link to="/gallery" className="btn-outline border-white/25 bg-white/5 text-white backdrop-blur hover:bg-white hover:text-brand-950">
                View Gallery
              </Link>
            </div>
          </div>

          <aside className="hidden justify-self-end lg:block">
            <div className="w-[360px] rounded-lg border border-white/15 bg-white/10 p-5 shadow-lift backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-300">{company.name}</p>
              <p className="display mt-4 text-2xl italic">"We build rooms people remember before the first speech begins."</p>
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-center">
                <div>
                  <p className="display text-2xl font-bold">3</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">Services</p>
                </div>
                <div>
                  <p className="display text-2xl font-bold">24h</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">Reply</p>
                </div>
                <div>
                  <p className="display text-2xl font-bold">FI</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">Tampere</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="h-px overflow-hidden rounded-full bg-white/20">
              <span key={active} className="block h-full bg-accent-400 animate-hero-progress" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {homeCarouselSlides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`group flex min-w-[145px] items-center gap-3 rounded-md border p-2 text-left transition ${
                    index === active ? 'border-accent-400 bg-white/15' : 'border-white/10 bg-black/20 hover:border-white/35 hover:bg-white/10'
                  }`}
                  aria-label={`Show ${item.label}`}
                >
                  <img
                    src={sources[index]}
                    alt=""
                    onError={() => handleImageError(index)}
                    className="h-12 w-14 rounded object-cover"
                  />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300">0{index + 1}</span>
                    <span className="line-clamp-1 text-xs text-white">{item.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => move(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur hover:bg-white hover:text-brand-950" aria-label="Previous hero image">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => move(1)} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur hover:bg-white hover:text-brand-950" aria-label="Next hero image">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroCarousel;
