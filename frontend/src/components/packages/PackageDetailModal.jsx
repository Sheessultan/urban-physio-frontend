import { Link } from 'react-router-dom';
import FaIcon from '../FaIcon';
import GlassModal, { GlassModalFooter, GlassModalHeader } from '../GlassModal';
import { bookPackageUrl } from '../../utils/bookUrl';
import { formatPackagePrice, parsePackageIncludes, perSessionPrice } from '../../utils/packageHelpers';

export default function PackageDetailModal({ pkg, onClose }) {
  if (!pkg) return null;

  const includes = parsePackageIncludes(pkg);
  const perSession = perSessionPrice(pkg.price, pkg.total_sessions);

  return (
    <GlassModal
      open={!!pkg}
      onClose={onClose}
      size="lg"
      titleId="package-detail-title"
      panelClassName="flex flex-col max-h-[min(720px,calc(100vh-2rem))]"
    >
      <GlassModalHeader
        titleId="package-detail-title"
        title={pkg.name}
        subtitle={`${pkg.duration_days}-day program · ${pkg.total_sessions} sessions`}
        icon="fa-box-open"
        accent="primary"
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 sm:py-6 space-y-5">
        <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-50 to-white border border-orange-100 p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-bold text-orange-700">{formatPackagePrice(pkg.price)}</p>
              <p className="text-sm text-slate-600 mt-1">
                ≈ {formatPackagePrice(perSession)} per session
              </p>
            </div>
            <div className="flex gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-white/80 border border-orange-100">
                <p className="text-lg font-bold text-slate-800">{pkg.total_sessions}</p>
                <p className="text-[10px] uppercase font-semibold text-slate-500">Sessions</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-white/80 border border-orange-100">
                <p className="text-lg font-bold text-slate-800">{pkg.duration_days}</p>
                <p className="text-[10px] uppercase font-semibold text-slate-500">Days</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-2">About this program</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{pkg.description || pkg.short_description}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3">What&apos;s included</h3>
          <ul className="space-y-2.5">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <FaIcon icon="fa-circle-check" className="text-emerald-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <GlassModalFooter>
        <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:justify-end">
          <button type="button" onClick={onClose} className="btn-outline w-full sm:w-auto sm:min-w-[120px]">
            Close
          </button>
          <Link
            to={bookPackageUrl(pkg.slug)}
            onClick={onClose}
            className="btn-primary w-full sm:w-auto sm:min-w-[160px] text-center inline-flex items-center justify-center gap-2"
          >
            Book this package
            <FaIcon icon="fa-arrow-right" />
          </Link>
        </div>
      </GlassModalFooter>
    </GlassModal>
  );
}
