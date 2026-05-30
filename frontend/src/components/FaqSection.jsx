import { useState } from 'react';
import { Link } from 'react-router-dom';
import FaIcon from './FaIcon';
import FaqIllustration from './FaqIllustration';

/**
 * @param {{ items: { q: string, a: string, icon?: string }[], title?: string, subtitle?: string, showContact?: boolean }} props
 */
export default function FaqSection({
  items,
  title = 'Frequently Asked Questions',
  subtitle = 'Quick answers about booking, sessions & payments',
  showContact = true,
}) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? -1 : i));

  return (
    <section className="max-w-7xl mx-auto px-4 section-pad">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-8 lg:gap-14 items-start">
        <div className="lg:sticky lg:top-24">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-full">
            <FaIcon icon="fa-circle-question" />
            FAQ
          </span>
          <h2 className="section-title mt-4">{title}</h2>
          <p className="text-slate-600 mt-3 text-sm md:text-base leading-relaxed max-w-md">
            {subtitle}
          </p>
          {showContact && (
            <div className="mt-6 glass-card p-4 md:p-5 hidden sm:block">
              <p className="font-semibold text-slate-800 text-sm">Still have questions?</p>
              <p className="text-slate-600 text-xs mt-1">Our team replies within 24 hours on business days.</p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 mt-3 text-primary-600 font-semibold text-sm hover:text-primary-700"
              >
                Contact support
                <FaIcon icon="fa-arrow-right" className="text-xs" />
              </Link>
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 mt-2 text-slate-600 font-medium text-sm hover:text-primary-600"
              >
                View all FAQs
                <FaIcon icon="fa-arrow-right" className="text-xs" />
              </Link>
            </div>
          )}

          <div className="hidden sm:block">
            <FaqIllustration />
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => {
            const open = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const btnId = `faq-btn-${i}`;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border transition-all duration-300 ease-micro ${
                  open
                    ? 'border-primary-200/80 bg-white shadow-lg shadow-primary-500/5 ring-1 ring-primary-100/50 scale-[1.01]'
                    : 'border-slate-200/80 bg-white/70 backdrop-blur-sm hover:border-primary-100 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <button
                  type="button"
                  id={btnId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                  className="w-full flex items-start gap-3 md:gap-4 text-left p-4 md:p-5 transition-colors duration-200 hover:bg-primary-50/30 rounded-2xl"
                >
                  <span
                    className={`shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-colors ${
                      open ? 'bg-primary-600 text-white' : 'bg-slate-100 text-primary-600'
                    }`}
                  >
                    <FaIcon icon={item.icon || 'fa-circle-question'} className="text-sm md:text-base" />
                  </span>
                  <span className="flex-1 min-w-0 pt-0.5">
                    <span className="font-semibold text-slate-800 text-sm md:text-base block pr-8">
                      {item.q}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      open ? 'bg-primary-100 text-primary-700 rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <FaIcon icon="fa-chevron-down" className="text-xs" />
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 md:px-5 pb-4 md:pb-5 pt-0 text-slate-600 text-sm md:text-[15px] leading-relaxed pl-[3.25rem] md:pl-[4.25rem] pr-5">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 sm:hidden max-w-sm mx-auto">
        <FaqIllustration />
      </div>

      {showContact && (
        <div className="mt-4 glass-card p-4 text-center sm:hidden">
          <p className="font-semibold text-slate-800 text-sm">Still have questions?</p>
          <Link to="/book" className="btn-primary inline-flex items-center gap-2 mt-3 text-sm py-2.5 px-5">
            Book a consultation
            <FaIcon icon="fa-calendar-check" className="text-xs" />
          </Link>
        </div>
      )}
    </section>
  );
}
