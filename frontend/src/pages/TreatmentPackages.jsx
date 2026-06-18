import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FaIcon from '../components/FaIcon';
import PackageDetailModal from '../components/packages/PackageDetailModal';
import { treatmentPackages } from '../services/api';
import { bookPackageUrl } from '../utils/bookUrl';
import {
  formatPackagePrice,
  PACKAGE_HIGHLIGHTS,
  parsePackageIncludes,
  perSessionPrice,
} from '../utils/packageHelpers';

const FALLBACK = [
  {
    id: 1,
    name: '10-Day Recovery Package',
    slug: '10-day-recovery',
    duration_days: 10,
    total_sessions: 10,
    short_description: 'Intensive 10-day physiotherapy recovery program',
    description: 'Structured daily physiotherapy over 10 days — ideal for acute pain relief and early rehabilitation.',
    price: 4999,
  },
  {
    id: 2,
    name: '15-Day Rehab Package',
    slug: '15-day-rehab',
    duration_days: 15,
    total_sessions: 15,
    short_description: 'Complete 15-day rehabilitation program',
    description: 'Mid-term rehab package with progressive exercises and guided sessions over 15 days.',
    price: 7499,
    featured: true,
  },
  {
    id: 3,
    name: '30-Day Complete Care',
    slug: '30-day-complete-care',
    duration_days: 30,
    total_sessions: 30,
    short_description: 'Full 30-day comprehensive physiotherapy care',
    description: 'Long-term recovery and strength-building program with 30 guided sessions over 30 days.',
    price: 12999,
  },
];

function PackageCard({ pkg, idx, onDetails, isFeatured }) {
  const perSession = perSessionPrice(pkg.price, pkg.total_sessions);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
      className={`relative flex flex-col rounded-2xl md:rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        isFeatured
          ? 'bg-gradient-to-b from-orange-600 via-orange-700 to-orange-800 text-white border-orange-500 shadow-xl shadow-orange-600/25 md:scale-[1.02] z-[1]'
          : 'glass-card border-white/80 bg-white/90'
      }`}
    >
      {isFeatured && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-300 via-white to-amber-300" />
      )}
      {isFeatured && (
        <span className="absolute top-4 right-4 bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1">
          <FaIcon icon="fa-fire" /> Most Popular
        </span>
      )}

      <div className={`p-6 md:p-8 flex flex-col flex-1 ${isFeatured ? '' : 'pt-8'}`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${isFeatured ? 'bg-white/15' : 'bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600'}`}>
          <FaIcon icon="fa-calendar-days" className="text-2xl" />
        </div>

        <p className={`text-xs font-bold uppercase tracking-wider ${isFeatured ? 'text-orange-100' : 'text-orange-600'}`}>
          {pkg.duration_days}-Day · {pkg.total_sessions} Sessions
        </p>
        <h2 className={`text-xl md:text-2xl font-bold mt-2 leading-tight ${isFeatured ? 'text-white' : 'text-slate-800'}`}>
          {pkg.name}
        </h2>
        <p className={`text-sm mt-3 flex-1 leading-relaxed ${isFeatured ? 'text-orange-50/90' : 'text-slate-600'}`}>
          {pkg.short_description}
        </p>

        <ul className={`mt-5 space-y-2 text-sm ${isFeatured ? 'text-orange-50' : 'text-slate-600'}`}>
          {parsePackageIncludes(pkg).slice(0, 3).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <FaIcon icon="fa-check" className={`mt-0.5 shrink-0 ${isFeatured ? 'text-amber-200' : 'text-emerald-500'}`} />
              <span className="line-clamp-1">{item}</span>
            </li>
          ))}
        </ul>

        <div className={`mt-6 pt-5 border-t ${isFeatured ? 'border-white/20' : 'border-slate-100'}`}>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className={`text-3xl font-bold ${isFeatured ? 'text-white' : 'text-slate-800'}`}>
                {formatPackagePrice(pkg.price)}
              </p>
              <p className={`text-xs mt-0.5 ${isFeatured ? 'text-orange-100' : 'text-slate-500'}`}>
                {formatPackagePrice(perSession)}/session
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          <Link
            to={bookPackageUrl(pkg.slug)}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-center block transition shadow-sm ${
              isFeatured
                ? 'bg-white text-orange-700 hover:bg-orange-50'
                : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:opacity-95'
            }`}
          >
            Book package
          </Link>
          <button
            type="button"
            onClick={() => onDetails(pkg.slug)}
            className={`w-full py-3 rounded-xl font-semibold text-sm border transition ${
              isFeatured
                ? 'border-white/35 text-white hover:bg-white/10'
                : 'border-slate-200 text-slate-700 hover:border-orange-300 hover:text-orange-700'
            }`}
          >
            View details
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function TreatmentPackages() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    treatmentPackages
      .list()
      .then((res) => {
        const data = res.data?.length ? res.data : FALLBACK;
        setList(data.map((p, i) => ({ ...p, featured: p.duration_days === 15 || i === 1 })));
      })
      .catch(() => setList(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (slug) => {
    try {
      const res = await treatmentPackages.get(slug);
      setSelected(res.data ?? res);
    } catch {
      setSelected(list.find((p) => p.slug === slug) || null);
    }
  };

  return (
    <div className="page-enter min-h-screen bg-gradient-to-b from-orange-50/60 via-white to-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-14 md:pt-28 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-700 to-slate-900" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-[1]">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white"
            >
              <FaIcon icon="fa-box-open" />
              Structured Recovery Programs
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 tracking-tight text-white"
            >
              Treatment Packages
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-4 text-sm sm:text-lg text-orange-100/95 leading-relaxed max-w-2xl"
            >
              Professional 10, 15 & 30-day physiotherapy programs — choose your package, pick your physiotherapist, pay securely, and track every session in your dashboard.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="flex flex-wrap gap-4 mt-6"
            >
              {['Secure checkout', 'Session tracking', 'Expert physiotherapists'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-white/10 px-3 py-1.5 rounded-full">
                  <FaIcon icon="fa-check-circle" className="text-amber-200" />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-[2] pb-20">
        {/* How it works */}
        <section className="glass-strong rounded-2xl p-5 sm:p-6 mb-8 md:mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-orange-600 mb-4">How booking works</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Choose package', desc: 'Pick 10, 15 or 30-day program', icon: 'fa-box-open' },
              { step: '2', title: 'Select doctor', desc: 'Your dedicated physiotherapist', icon: 'fa-user-doctor' },
              { step: '3', title: 'Set start date', desc: 'Sessions auto-scheduled', icon: 'fa-calendar-check' },
              { step: '4', title: 'Pay & track', desc: 'Razorpay + My Packages dashboard', icon: 'fa-chart-line' },
            ].map((s) => (
              <div key={s.step} className="flex gap-3 sm:flex-col sm:text-center sm:items-center">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold shrink-0 sm:mx-auto">
                  <FaIcon icon={s.icon} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-[420px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5 md:gap-6 items-stretch">
            {list.map((pkg, idx) => (
              <PackageCard
                key={pkg.id || pkg.slug}
                pkg={pkg}
                idx={idx}
                isFeatured={pkg.featured || pkg.duration_days === 15}
                onDetails={openDetail}
              />
            ))}
          </div>
        )}

        {/* Comparison */}
        {!loading && list.length > 1 && (
          <section className="mt-14 md:mt-20 overflow-x-auto">
            <h2 className="section-title text-center mb-6">Compare programs</h2>
            <table className="w-full min-w-[540px] text-sm glass-card overflow-hidden">
              <thead>
                <tr className="bg-orange-50/80 text-left">
                  <th className="p-4 font-semibold text-slate-700">Feature</th>
                  {list.map((p) => (
                    <th key={p.slug} className="p-4 font-semibold text-slate-800">{p.duration_days}-Day</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Total sessions', key: 'total_sessions' },
                  { label: 'Duration', key: 'duration_days', suffix: ' days' },
                  { label: 'Price', key: 'price', format: formatPackagePrice },
                ].map((row) => (
                  <tr key={row.label} className="border-t border-slate-100">
                    <td className="p-4 text-slate-600">{row.label}</td>
                    {list.map((p) => (
                      <td key={p.slug} className="p-4 font-medium text-slate-800">
                        {row.format ? row.format(p[row.key]) : `${p[row.key]}${row.suffix || ''}`}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-slate-100 bg-slate-50/50">
                  <td className="p-4 text-slate-600">Book</td>
                  {list.map((p) => (
                    <td key={p.slug} className="p-4">
                      <Link to={bookPackageUrl(p.slug)} className="text-orange-600 font-semibold hover:underline text-sm">
                        Book now →
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* Benefits */}
        <section className="mt-14 md:mt-20">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="section-title">What&apos;s included</h2>
            <p className="section-subtitle mx-auto mt-2">Everything for a complete recovery journey</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {PACKAGE_HIGHLIGHTS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-4 md:p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <FaIcon icon={b.icon} className="text-xl" />
                </div>
                <h3 className="font-bold text-slate-800 mt-3 text-sm md:text-base">{b.title}</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 md:mt-16 rounded-2xl md:rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600" />
          <div className="relative p-8 md:p-12 text-center text-white">
            <h2 className="text-xl md:text-3xl font-bold">Ready to start your recovery?</h2>
            <p className="mt-2 text-orange-100 max-w-lg mx-auto text-sm md:text-base">
              Book a structured package today — sessions appear in My Packages with full progress tracking.
            </p>
            {list[1] && (
              <Link
                to={bookPackageUrl(list[1].slug)}
                className="inline-flex items-center gap-2 mt-6 bg-white text-orange-700 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition"
              >
                Book {list[1].duration_days}-Day Package
                <FaIcon icon="fa-arrow-right" />
              </Link>
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selected && <PackageDetailModal pkg={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
