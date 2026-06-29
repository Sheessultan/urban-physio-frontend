import { motion } from 'framer-motion';
import FaIcon from '../FaIcon';
import HorizontalScrollRow from './HorizontalScrollRow';
import { normalizePackagePricing, packageMatchesCategory } from '../../utils/packageHelpers';
import { adminPackageKey, doctorPackageKey } from './BookingScheduleStep';

function CompactPackageCard({ pkg, selected, onSelect, index }) {
  const { displayPrice, displayMrp, hasDiscount, discountPercent } = normalizePackagePricing(pkg);
  const sessions = pkg.total_sessions || pkg.duration_days || 1;
  const isAdmin = pkg.package_source === 'admin';

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      onClick={onSelect}
      className={`shrink-0 snap-start w-[10.5rem] sm:w-[11.5rem] rounded-2xl border-2 p-3 text-left transition-all duration-200 active:scale-[0.98] ${
        selected
          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg shadow-orange-200/50 ring-2 ring-orange-200'
          : 'border-slate-200/90 bg-white hover:border-orange-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span
          className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
            isAdmin ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'
          }`}
        >
          {isAdmin ? 'Platform' : 'Doctor'}
        </span>
        {selected && <FaIcon icon="fa-circle-check" className="text-orange-600 text-xs" />}
      </div>
      <p className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{pkg.name}</p>
      <p className="text-[10px] text-slate-500 mt-1">
        {sessions} session{sessions !== 1 ? 's' : ''}
        {pkg.duration_days ? ` · ${pkg.duration_days}d` : ''}
      </p>
      <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
        <span className="text-base font-bold text-orange-700">₹{displayPrice.toLocaleString('en-IN')}</span>
        {hasDiscount && (
          <span className="text-[10px] text-slate-400 line-through">₹{displayMrp.toLocaleString('en-IN')}</span>
        )}
      </div>
      {hasDiscount && discountPercent > 0 && (
        <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
          {discountPercent}% off
        </span>
      )}
    </motion.button>
  );
}

/**
 * Admin packages first, then doctor packages — horizontal carousel.
 */
export default function PackageCarousel({
  adminPackages = [],
  doctorPackages = [],
  serviceType,
  selectedKey,
  onSelect,
}) {
  const adminFiltered = adminPackages
    .map((p) => ({ ...p, package_source: 'admin' }))
    .filter((p) => !serviceType || packageMatchesCategory(p, serviceType));

  const doctorFiltered = doctorPackages
    .map((p) => ({ ...p, package_source: 'doctor' }))
    .filter((p) => !serviceType || packageMatchesCategory(p, serviceType));

  if (!adminFiltered.length && !doctorFiltered.length) return null;

  let idx = 0;

  return (
    <section className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-orange-700 flex items-center gap-2">
        <FaIcon icon="fa-box-open" />
        Treatment packages
        <span className="text-slate-400 font-normal normal-case text-[11px]">swipe →</span>
      </p>
      <HorizontalScrollRow ariaLabel="Treatment packages">
        {adminFiltered.map((pkg) => {
          const key = adminPackageKey(pkg.id);
          const i = idx++;
          return (
            <CompactPackageCard
              key={key}
              pkg={pkg}
              index={i}
              selected={selectedKey === key}
              onSelect={() => onSelect(key, pkg)}
            />
          );
        })}
        {doctorFiltered.length > 0 && adminFiltered.length > 0 && (
          <div
            className="shrink-0 w-px self-stretch bg-slate-200 mx-0.5"
            aria-hidden
          />
        )}
        {doctorFiltered.map((pkg) => {
          const key = doctorPackageKey(pkg.id);
          const i = idx++;
          return (
            <CompactPackageCard
              key={key}
              pkg={pkg}
              index={i}
              selected={selectedKey === key}
              onSelect={() => onSelect(key, pkg)}
            />
          );
        })}
      </HorizontalScrollRow>
    </section>
  );
}
