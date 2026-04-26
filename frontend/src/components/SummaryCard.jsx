const SummaryCard = ({ title, value, icon, tone = 'accent', caption }) => {
  const accentClass = tone === 'blue' ? 'text-brand-200 bg-brand-400/10' : 'text-accent-300 bg-accent-400/10';

  return (
    <article className="group relative overflow-hidden rounded-lg border border-white/10 bg-[#202020] p-6 text-white shadow-lift transition hover:-translate-y-0.5 hover:border-accent-400/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent opacity-70" />
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">{title}</p>
          <p className="display mt-6 text-5xl font-bold italic leading-none text-white">{value}</p>
          {caption && <p className="mt-4 text-sm leading-6 text-slate-400">{caption}</p>}
        </div>
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${accentClass}`}>
          {icon}
        </div>
      </div>
    </article>
  );
};

export default SummaryCard;
