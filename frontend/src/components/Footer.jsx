import { Facebook, Instagram, Mail, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { company } from '../data/siteData';

const Footer = () => (
  <footer className="bg-brand-950 text-slate-300">
    <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <p className="display text-xl font-bold tracking-[0.16em] text-white">{company.name}</p>
        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
          Event decoration, planning, and rental logistics shaped for premium celebrations and precise execution.
        </p>
        <div className="mt-5 space-y-2 text-sm text-slate-400">
          <p>{company.address}</p>
          <p>{company.cityLine} · {company.phone}</p>
          <p>{company.email}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <a href={company.facebook} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Facebook">
            <Facebook size={16} />
          </a>
          <a href={`mailto:${company.email}`} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Email">
            <Mail size={16} />
          </a>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white">
            <Share2 size={16} />
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white">
            <Instagram size={16} />
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent-400">Navigate</p>
        <div className="mt-5 flex flex-col gap-3 text-sm">
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent-400">Services</p>
        <div className="mt-5 flex flex-col gap-3 text-sm">
          <Link to="/services/decoration">Decoration</Link>
          <Link to="/services/planning">Planning</Link>
          <Link to="/rentals">Rental Items</Link>
          <Link to="/request-quotation">Request Quotation</Link>
        </div>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="container-page flex flex-col gap-3 py-6 text-xs uppercase tracking-[0.16em] text-slate-500 md:flex-row md:items-center md:justify-between">
        <span>© 2026 {company.name}. All rights reserved.</span>
        <span>Privacy Policy · Terms of Service · Contact Support</span>
      </div>
    </div>
  </footer>
);

export default Footer;
