import { Link } from 'react-router-dom';
import FaIcon from './FaIcon';
import { bookClinicUrl } from '../utils/bookUrl';

/**
 * @param {{ clinic: object, compact?: boolean }} props
 */
export default function ClinicCard({ clinic, compact = false }) {
  const bookTo = bookClinicUrl(clinic.id);

  if (compact) {
    return (
      <div className="glass-card p-4 animate-fade-in">
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/30 to-teal-600/40 rounded-xl flex items-center justify-center text-emerald-800 shrink-0">
            <FaIcon icon="fa-hospital" className="text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm truncate">{clinic.name}</h3>
            <p className="text-slate-600 text-xs truncate">{clinic.city_name || 'India'}</p>
            {clinic.distance_km != null && (
              <p className="text-primary-600 text-xs mt-0.5">{Number(clinic.distance_km).toFixed(1)} km away</p>
            )}
          </div>
          <Link to={bookTo} className="btn-primary text-xs py-2 px-3 shrink-0">
            Book
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="glass-card p-5 md:p-6 flex flex-col h-full animate-fade-in group hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
          <FaIcon icon="fa-hospital" className="text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-primary-700 transition-colors">
            {clinic.name}
          </h3>
          <p className="text-slate-600 text-sm mt-1 line-clamp-2 flex items-start gap-1">
            <FaIcon icon="fa-location-dot" className="text-slate-400 shrink-0 mt-0.5" />
            <span>
              {clinic.address ? `${clinic.address}, ` : ''}
              {clinic.city_name || 'India'}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100">
          <FaIcon icon="fa-circle-check" className="text-emerald-600" />
          Partner clinic
        </span>
        {clinic.distance_km != null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-medium border border-sky-100">
            <FaIcon icon="fa-route" />
            {Number(clinic.distance_km).toFixed(1)} km
          </span>
        )}
      </div>

      {clinic.phone && (
        <p className="text-slate-600 text-sm mt-3 inline-flex items-center gap-1.5">
          <FaIcon icon="fa-phone" className="text-slate-400" />
          {clinic.phone}
        </p>
      )}

      <div className="mt-auto pt-4">
        <Link to={bookTo} className="btn-primary w-full text-center text-sm py-2.5 inline-flex items-center justify-center gap-2">
          Book clinic visit
          <FaIcon icon="fa-arrow-right" className="text-xs" />
        </Link>
      </div>
    </article>
  );
}
