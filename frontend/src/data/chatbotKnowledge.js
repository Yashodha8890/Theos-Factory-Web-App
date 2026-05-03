import {
  company,
  publicGalleryFallback,
  rentalFallback,
  serviceFallback,
} from './siteData';
import { formatCurrency } from '../utils/format';

const serviceNames = serviceFallback.map((service) => service.title).join(', ');
const rentalCategories = [...new Set(rentalFallback.map((item) => item.category))];
const galleryCategories = [...new Set(publicGalleryFallback.map((item) => item.category))];

export const chatbotQuickPrompts = [
  'What services do you offer?',
  'How do I request a quote?',
  'Show rental options',
  'How can I contact you?',
];

const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const hasAny = (input, terms) => terms.some((term) => input.includes(term));

const makeReply = ({ text, bullets = [], actions = [] }) => ({
  text,
  bullets,
  actions,
});

const findRentalMatches = (input) => (
  rentalFallback.filter((item) => {
    const haystack = normalize(`${item.name} ${item.category} ${item.description}`);
    return input.split(' ').some((word) => word.length > 3 && haystack.includes(word));
  }).slice(0, 3)
);

const findServiceMatch = (input) => (
  serviceFallback.find((service) => {
    const haystack = normalize(`${service.title} ${service.slug} ${service.shortDescription} ${service.fullDescription}`);
    return input.split(' ').some((word) => word.length > 3 && haystack.includes(word));
  })
);

export const createLocalChatbotReply = (rawInput, user) => {
  const input = normalize(rawInput);

  if (!input || hasAny(input, ['hello', 'hi', 'hey', 'start'])) {
    return makeReply({
      text: `Hi${user?.name ? ` ${user.name.split(' ')[0]}` : ''}. I can help with ${company.name} services, quotations, bookings, rentals, gallery details, and contact information.`,
      bullets: [
        `Services: ${serviceNames}.`,
        `Rental categories: ${rentalCategories.join(', ')}.`,
        `Location: ${company.cityLine}.`,
      ],
      actions: [
        { label: 'View Services', to: '/services' },
        { label: 'Request Quote', to: '/request-quotation' },
      ],
    });
  }

  if (hasAny(input, ['service', 'offer', 'decoration', 'decor', 'planning', 'plan', 'floral', 'flowers'])) {
    const service = findServiceMatch(input);

    if (service) {
      return makeReply({
        text: `${service.title}: ${service.fullDescription}`,
        actions: [
          { label: 'Open Service', to: `/services/${service.slug}` },
          { label: 'Request Quote', to: '/request-quotation' },
        ],
      });
    }

    return makeReply({
      text: `${company.name} offers event decoration, event planning, and rental item services for weddings, corporate events, private dinners, gala setups, and themed productions.`,
      bullets: serviceFallback.map((service) => `${service.title}: ${service.shortDescription}`),
      actions: [
        { label: 'View Services', to: '/services' },
        { label: 'Book Appointment', to: '/book-appointment' },
      ],
    });
  }

  if (hasAny(input, ['quote', 'quotation', 'estimate', 'proposal', 'budget', 'cost', 'price'])) {
    return makeReply({
      text: 'For a quotation, submit the event type, event date, guest count, budget range, service category, and any notes. The admin team can then review and update your quotation status.',
      bullets: [
        'Use the quotation form for decoration, planning, rentals, or combined event requests.',
        'Include guest count and budget range so the team can scope the proposal properly.',
        'Signed-in users can track submitted quotations from the dashboard.',
      ],
      actions: [
        { label: 'Request Quote', to: '/request-quotation' },
        { label: 'My Quotations', to: '/dashboard/quotations' },
      ],
    });
  }

  if (hasAny(input, ['appointment', 'booking', 'consultation', 'schedule', 'meeting'])) {
    return makeReply({
      text: 'You can book an appointment for an event consultation. The booking form collects your preferred date, time, service type, and notes for the team.',
      bullets: [
        'Use appointments for planning conversations and service reviews.',
        'Use quotations when you need a proposal or estimated scope.',
      ],
      actions: [
        { label: 'Book Appointment', to: '/book-appointment' },
        { label: 'My Appointments', to: '/dashboard/appointments' },
      ],
    });
  }

  if (hasAny(input, ['rental', 'rent', 'chair', 'chairs', 'tableware', 'linen', 'lighting', 'furniture', 'candelabra', 'lounge'])) {
    const matches = findRentalMatches(input);

    return makeReply({
      text: matches.length
        ? 'These rental items from the local catalog look relevant.'
        : `The rental catalog includes ${rentalCategories.join(', ')} for event setups.`,
      bullets: (matches.length ? matches : rentalFallback.slice(0, 4)).map((item) => (
        `${item.name} (${item.category}) - ${item.description} Rate: ${formatCurrency(item.price)}.`
      )),
      actions: [
        { label: 'Browse Rentals', to: '/rentals' },
        { label: 'Request Quote', to: '/request-quotation' },
      ],
    });
  }

  if (hasAny(input, ['gallery', 'portfolio', 'photos', 'images', 'wedding', 'corporate', 'gala', 'private party'])) {
    return makeReply({
      text: `The gallery includes event examples across ${galleryCategories.join(', ')} categories.`,
      bullets: publicGalleryFallback.slice(0, 4).map((item) => `${item.title}: ${item.description}`),
      actions: [
        { label: 'Open Gallery', to: '/gallery' },
        { label: 'View Services', to: '/services' },
      ],
    });
  }

  if (hasAny(input, ['contact', 'email', 'phone', 'call', 'address', 'location', 'where'])) {
    return makeReply({
      text: `You can contact ${company.name} directly using the details stored in the site.`,
      bullets: [
        `Phone: ${company.phone}`,
        `Email: ${company.email}`,
        `Address: ${company.address}`,
      ],
      actions: [
        { label: 'Contact Page', to: '/contact' },
        { label: 'Call Now', href: `tel:${company.phoneHref}` },
      ],
    });
  }

  if (hasAny(input, ['account', 'profile', 'login', 'sign in', 'signin', 'signup', 'register', 'password'])) {
    return makeReply({
      text: user
        ? 'Your customer dashboard lets you manage profile details, appointments, quotations, rentals, and account settings.'
        : 'Create an account or sign in to track quotations, appointments, rental bookings, and profile details.',
      actions: user
        ? [
          { label: 'My Profile', to: '/dashboard/profile' },
          { label: 'Account', to: '/dashboard/account' },
        ]
        : [
          { label: 'Sign In', to: '/signin' },
          { label: 'Sign Up', to: '/signup' },
        ],
    });
  }

  if (hasAny(input, ['status', 'my quote', 'my quotation', 'my booking', 'my rental', 'dashboard'])) {
    return makeReply({
      text: 'For personal request status, use the dashboard pages. This local chat uses site knowledge and does not read private account records directly.',
      actions: [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Quotations', to: '/dashboard/quotations' },
        { label: 'Rentals', to: '/dashboard/rentals' },
      ],
    });
  }

  return makeReply({
    text: `I could not find an exact match in the local ${company.name} knowledge, but I can still point you to the best next step.`,
    bullets: [
      'For service scope, open Services.',
      'For pricing or a custom event plan, request a quotation.',
      'For direct help, use the Contact page.',
    ],
    actions: [
      { label: 'Services', to: '/services' },
      { label: 'Request Quote', to: '/request-quotation' },
      { label: 'Contact', to: '/contact' },
    ],
  });
};
