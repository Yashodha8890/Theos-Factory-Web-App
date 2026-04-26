const SectionHeader = ({ eyebrow, title, copy, align = 'center', className = '' }) => (
  <div className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h1 className="display mt-4 text-4xl font-bold leading-tight md:text-6xl">{title}</h1>
    {copy && <p className="mt-5 text-base leading-7 muted md:text-lg">{copy}</p>}
  </div>
);

export default SectionHeader;
