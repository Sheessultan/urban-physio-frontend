import FaIcon from './FaIcon';

function formatPrice(price) {
  const n = Number(price);
  if (!n || n <= 0) return 'On request';
  return `₹${n.toLocaleString('en-IN')}`;
}

/**
 * @param {{ services: object[], variant?: 'doctor' | 'clinic' }} props
 */
export default function ProfileServicesGrid({ services, variant = 'doctor' }) {
  const list = (services || []).filter((s) => s && s.is_active !== 0);
  if (!list.length) return null;

  const accent = variant === 'clinic'
    ? 'from-emerald-500/10 to-teal-500/5 border-emerald-100 hover:border-emerald-200'
    : 'from-primary-500/10 to-orange-500/5 border-primary-100 hover:border-primary-200';

  const priceTone = variant === 'clinic' ? 'text-emerald-700' : 'text-primary-700';

  return (
    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
      {list.map((service) => (
        <article
          key={service.id}
          className={`rounded-2xl border bg-gradient-to-br ${accent} p-4 sm:p-5 shadow-sm hover:shadow-md transition-all`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-900 text-base leading-snug">{service.name}</h3>
              {service.short_description && (
                <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-4">
                  {service.short_description}
                </p>
              )}
            </div>
            <div className={`shrink-0 text-right ${priceTone}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</p>
              <p className="text-lg font-bold whitespace-nowrap">{formatPrice(service.price)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/60 flex items-center gap-2 text-xs text-slate-500">
            <FaIcon icon="fa-hand-holding-medical" className="text-slate-400" />
            <span>Book a consultation to avail this service</span>
          </div>
        </article>
      ))}
    </div>
  );
}
