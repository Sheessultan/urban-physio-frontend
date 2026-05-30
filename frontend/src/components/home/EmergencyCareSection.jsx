import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FaIcon from '../FaIcon';

const CTAS = [
  {
    type: 'online',
    label: 'Emergency Consultation',
    icon: 'fa-video',
    desc: 'Instant online physio — join in minutes',
    className: 'bg-white text-red-700 hover:bg-red-50',
  },
  {
    type: 'home_visit',
    label: 'Urgent Home Visit',
    icon: 'fa-house-medical',
    desc: 'Physiotherapist dispatched to you',
    className: 'bg-red-900/40 text-white border border-white/30 hover:bg-red-900/60',
  },
  {
    type: 'clinic',
    label: 'Find Open Clinic',
    icon: 'fa-hospital',
    desc: 'Nearest clinic with available doctors',
    className: 'bg-red-900/40 text-white border border-white/30 hover:bg-red-900/60',
  },
];

export default function EmergencyCareSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8" aria-labelledby="emergency-care-heading">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl md:rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-orange-700" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
        <span
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-pulse-soft"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl"
          aria-hidden
        />

        <div className="relative z-[1] grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-10 md:p-10 lg:p-12">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-100">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-200" />
              </span>
              24/7 Emergency Care
            </span>
            <h2 id="emergency-care-heading" className="mt-4 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Need Immediate Physiotherapy Care?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-red-100/95 sm:text-base">
              Connect with an available physiotherapist in minutes for online consultations, urgent home visits,
              or immediate clinic appointments.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-red-50/90">
              <li className="flex items-center gap-2">
                <FaIcon icon="fa-bolt" className="text-amber-300" /> Average response under 15 minutes
              </li>
              <li className="flex items-center gap-2">
                <FaIcon icon="fa-shield-heart" className="text-amber-300" /> Verified emergency-ready physios
              </li>
              <li className="flex items-center gap-2">
                <FaIcon icon="fa-lock" className="text-amber-300" /> Secure Razorpay payment
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            {CTAS.map((cta) => (
              <Link
                key={cta.type}
                to={`/emergency/book?type=${cta.type}`}
                className={`group flex items-center gap-4 rounded-xl px-4 py-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${cta.className}`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/10 text-lg">
                  <FaIcon icon={cta.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-sm sm:text-base">{cta.label}</span>
                  <span className="block text-xs opacity-80 mt-0.5">{cta.desc}</span>
                </span>
                <FaIcon icon="fa-arrow-right" className="shrink-0 opacity-60 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
