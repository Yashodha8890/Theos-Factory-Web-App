import { useState } from 'react';
import { ArrowRight, Bot, MapPin, MessageCircle, Phone } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { company } from '../data/siteData';

const offices = [
  { city: 'Tampere', address: 'Iidesranta, Tampere, Finland, 33100', phone: '041 5705471', email: 'theosfactory@gmail.com' },
];

const mapUrl = 'https://www.google.com/maps?q=Iidesranta%2C%20Tampere%2C%20Finland%2C%2033100&output=embed';

const Contact = () => {
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div>
      <section className="container-page py-20">
        <SectionHeader
          eyebrow="Get In Touch"
          title="Let's orchestrate your next masterpiece"
          copy="From logistics to aesthetic curation, our team is ready to bring your vision to life."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <form onSubmit={submit} className="card grid gap-5 p-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] muted">Full Name</span>
              <input required placeholder="John Doe" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] muted">Email Address</span>
              <input type="email" required placeholder="john@example.com" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] muted">Subject</span>
              <select defaultValue="Corporate Gala">
                <option>Corporate Gala</option>
                <option>Wedding</option>
                <option>Private Celebration</option>
                <option>Rental Support</option>
              </select>
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] muted">Message</span>
              <textarea rows="7" required placeholder="Describe your event vision..." />
            </label>
            {sent && <p className="text-sm font-semibold text-emerald-600 md:col-span-2">Inquiry saved locally for this demo. Connect an email service when ready.</p>}
            <button className="btn-accent md:col-span-2" type="submit">Send Inquiry</button>
          </form>

          <div className="space-y-5">
            <article className="relative overflow-hidden rounded-lg bg-brand-950 p-7 text-white shadow-lift">
              <div className="relative z-10">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent-300"><MessageCircle size={15} /> Instant Assistance</p>
                <h2 className="display mt-5 text-3xl font-bold">Need immediate help?</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">Our concierge team is available to answer logistics and availability questions.</p>
                <a href={`tel:${company.phoneHref}`} className="btn-accent mt-6 rounded-full"><Phone size={16} /> Call Now <ArrowRight size={15} /></a>
              </div>
              <Bot className="absolute -bottom-8 right-6 text-white/10" size={130} />
            </article>

            {offices.map((office) => (
              <article key={office.city} className="panel p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent-600">{office.city}</p>
                <p className="mt-2 display text-lg">{office.address}</p>
                <p className="mt-2 text-sm muted">{office.phone}</p>
                <p className="mt-1 text-sm muted">{office.email}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[440px] overflow-hidden border-y" style={{ borderColor: 'var(--line)' }}>
        <iframe
          title="Theo's Factory location map"
          src={mapUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="absolute inset-0 bg-white/20 dark:bg-brand-950/20" />
        <div className="relative grid min-h-[440px] place-items-center px-5">
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-950 text-white shadow-lift">
              <MapPin />
            </div>
            <div className="card mt-4 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent-600">Headquarters</p>
              <p className="display mt-2 text-lg">Theo's Factory</p>
              <p className="text-xs muted">{company.address}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeader eyebrow="Common Questions" title="Logistical excellence" />
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
          {[
            ['What is your typical lead time?', 'For large-scale galas, we recommend 6-8 months. Luxury weddings usually require 12 months for optimal venue selection.'],
            ['Do you manage international logistics?', 'Yes. Our concierge team handles travel, customs, local permits, and vendor coordination for destination events.'],
            ['How do you handle event security?', 'We partner with private security firms for guest arrival, VIP movement, and site-specific protocols.'],
            ['Can we request specific caterers?', 'Yes. We can coordinate with your preferred culinary team or source partners from our network.'],
          ].map(([question, answer]) => (
            <article key={question} className="border-b pb-6" style={{ borderColor: 'var(--line)' }}>
              <h3 className="font-semibold">{question}</h3>
              <p className="mt-3 text-sm leading-6 muted">{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Contact;
