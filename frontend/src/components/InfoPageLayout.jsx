import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FaIcon from './FaIcon';

/**
 * Shared layout for FAQ, Contact, Cancellation Help pages.
 */
export default function InfoPageLayout({
  title,
  subtitle,
  icon,
  accent = 'from-orange-600 to-primary-600',
  breadcrumb = 'Support',
  children,
  heroExtra,
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-primary-50/30">
      <Navbar />

      <section className={`relative overflow-hidden bg-gradient-to-br ${accent} text-white`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M0 0h60v60H0z\'/%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 relative">
          <nav className="flex items-center gap-2 text-sm text-white/80 mb-6 flex-wrap">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>
            <FaIcon icon="fa-chevron-right" className="text-xs opacity-60" />
            <span className="text-white/90">{breadcrumb}</span>
            <FaIcon icon="fa-chevron-right" className="text-xs opacity-60" />
            <span className="text-white font-medium">{title}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-4">
                <FaIcon icon={icon} />
                <span>{breadcrumb}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
              <p className="text-white/90 mt-3 text-base md:text-lg leading-relaxed">{subtitle}</p>
            </div>
            {heroExtra}
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 md:py-12 w-full">{children}</main>

      <Footer />
    </div>
  );
}
