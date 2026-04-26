const GalleryGrid = ({ items }) => (
  <div className="grid auto-rows-[220px] gap-6 md:grid-cols-3 md:auto-rows-[260px]">
    {items.map((item, index) => (
      <article
        key={item._id || item.title}
        className={`group relative overflow-hidden rounded-lg bg-brand-950 shadow-soft ${index === 0 ? 'md:row-span-2' : ''} ${index === 3 ? 'md:col-span-2' : ''}`}
      >
        <img src={item.image} alt={item.title} className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 p-5 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-300">{item.category}</p>
          <h3 className="display mt-2 text-xl font-bold">{item.title}</h3>
        </div>
      </article>
    ))}
  </div>
);

export default GalleryGrid;
