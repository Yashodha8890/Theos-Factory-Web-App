const heroImage = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80';
const tableImage = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80';
const ballroomImage = 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&q=80';
const chandelierImage = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80';
const gardenImage = 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=80';
const loungeImage = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80';
const lightsImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80';

module.exports = {
  services: [
    {
      title: 'Event Decoration',
      slug: 'decoration',
      shortDescription: 'Floral environments, lighting design, stage details, and thematic styling for memorable celebrations.',
      fullDescription: 'Theo\'s Factory designs immersive event environments with floral composition, architectural lighting, drapery, table styling, and focal installations. Every detail is planned around the venue, guest flow, and emotional tone of the occasion.',
      image: tableImage,
    },
    {
      title: 'Event Planning',
      slug: 'planning',
      shortDescription: 'Timeline, vendor, venue, and guest-flow coordination delivered with calm operational precision.',
      fullDescription: 'Our planning team manages the moving parts behind the celebration: schedules, vendor coordination, production notes, floor plans, guest arrival flow, and day-of execution. The result is a polished event that feels effortless for the host.',
      image: ballroomImage,
    },
    {
      title: 'Rental Items',
      slug: 'rental-items',
      shortDescription: 'A curated rental collection of seating, linens, tableware, decor, lighting, and event structures.',
      fullDescription: 'Choose from premium rental pieces built for weddings, corporate events, private dinners, and themed productions. The collection includes lounge furniture, dining chairs, textiles, crystal tableware, lighting, plinths, and specialty decor.',
      image: loungeImage,
    },
  ],
  gallery: [
    {
      title: 'Monochrome Ceremony Arcade',
      category: 'Wedding',
      image: gardenImage,
      description: 'A clean aisle composition with white florals, soft drapery, and a precise guest arrival path.',
    },
    {
      title: 'Candlelit Corporate Dinner',
      category: 'Corporate',
      image: tableImage,
      description: 'Layered glassware, warm candlelight, and structured dining logistics for an executive dinner.',
    },
    {
      title: 'Grand Chandelier Reception',
      category: 'Decoration',
      image: chandelierImage,
      description: 'A dramatic ballroom setup with suspended lighting and refined table spacing.',
    },
    {
      title: 'Garden Lounge Soiree',
      category: 'Private',
      image: heroImage,
      description: 'Outdoor lounge styling with relaxed seating, ambient lighting, and floral accents.',
    },
    {
      title: 'Evening Lighting Install',
      category: 'Decoration',
      image: lightsImage,
      description: 'Warm bistro lighting used to define movement and atmosphere after sunset.',
    },
    {
      title: 'Hospitality Lounge Suite',
      category: 'Rentals',
      image: loungeImage,
      description: 'A neutral lounge set arranged for VIP hosting and event transitions.',
    },
  ],
  rentals: [
    {
      name: 'Versailles Gold Chairs',
      category: 'Furniture',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      description: 'Velvet-cushioned event chairs with ornate gold-finished frames.',
      price: 12,
      availability: true,
      quantity: 180,
    },
    {
      name: 'Royal Crystal Glassware Set',
      category: 'Tableware',
      image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
      description: 'Hand-cut crystal flutes, wine glasses, and water goblets for formal dining.',
      price: 8.5,
      availability: true,
      quantity: 320,
    },
    {
      name: 'Ambient Bistro Lights',
      category: 'Lighting',
      image: lightsImage,
      description: 'Warm Edison-style bulb strands with heavy-duty black cable for indoor or outdoor use.',
      price: 150,
      availability: true,
      quantity: 48,
    },
    {
      name: 'Premium Silk Linens',
      category: 'Decor',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
      description: 'Heavyweight dupioni silk table linens available in tailored neutral tones.',
      price: 45,
      availability: true,
      quantity: 90,
    },
    {
      name: 'Empire Candelabras',
      category: 'Decor',
      image: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=80',
      description: 'Tall polished centerpieces with five candle arms for gala tables.',
      price: 35,
      availability: true,
      quantity: 64,
    },
    {
      name: 'Cloud Lounge Suite',
      category: 'Furniture',
      image: loungeImage,
      description: 'Curved modern sofa, club chairs, and low tables for premium lounge zones.',
      price: 420,
      availability: true,
      quantity: 12,
    },
  ],
  user: {
    name: 'Avery Stone',
    email: 'avery@theosfactory.com',
    password: 'DemoPass123',
    phone: '041 5705471',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Avery',
  },
  adminUser: {
    name: 'Theo Admin',
    email: 'admin@theosfactory.com',
    password: 'AdminPass123',
    phone: '041 5705471',
    role: 'admin',
    status: 'Active',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=TF',
  },
  demoRecords: {
    appointments: [
      {
        serviceType: 'Decoration Consultation',
        preferredDate: '2026-05-15',
        preferredTime: '11:30',
        notes: 'Discuss floral palette, stage focal point, and lighting direction for an evening gala.',
        status: 'Confirmed',
      },
      {
        serviceType: 'Planning Review',
        preferredDate: '2026-06-02',
        preferredTime: '14:00',
        notes: 'Review floor plan, vendor arrival timings, and guest flow.',
        status: 'Pending',
      },
    ],
    quotations: [
      {
        eventType: 'Corporate Gala',
        eventDate: '2026-07-18',
        guestCount: '220',
        budgetRange: '€25k - €50k',
        serviceCategory: 'Decoration, Planning, Rentals',
        notes: 'A premium black, blue, and metallic gala environment with lounge areas and a photo focal point.',
        status: 'Approved',
      },
      {
        eventType: 'Private Dinner',
        eventDate: '2026-08-12',
        guestCount: '48',
        budgetRange: '€10k - €25k',
        serviceCategory: 'Decoration',
        notes: 'Intimate candlelit dinner with floral installations and refined table styling.',
        status: 'Pending Review',
      },
    ],
    rentalBooking: {
      startDate: '2026-05-14',
      endDate: '2026-05-16',
      quantity: 24,
      status: 'Reserved',
    },
  },
};
