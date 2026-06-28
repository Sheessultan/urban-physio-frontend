import { useState } from 'react';
import { Link } from 'react-router-dom';
import FaIcon from './FaIcon';
import ClinicLogo from './ClinicLogo';
import BadgeList from './platform/BadgeList';
import PartnerClinicBadge from './PartnerClinicBadge';
import ClinicPreviewModal from './preview/ClinicPreviewModal';
import { showPartnerClinicBadge } from '../utils/clinicBadges';
import { bookClinicUrl } from '../utils/bookUrl';
import { clinicProfileUrl } from '../utils/profileUrls';
import { clinicMapsUrl } from '../utils/locationHelpers';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { formatReviewCount } from '../utils/doctorProfileUtils';

function stopNav(e) {
  e.stopPropagation();
}

function clinicPhotoUrl(clinic) {
  return resolveMediaUrl(clinic.cover_image) || resolveMediaUrl(clinic.logo) || null;
}

function locationLine(clinic) {
  const parts = [];
  if (clinic.address) parts.push(clinic.address);
  const cityState = [clinic.city_name, clinic.state_name].filter(Boolean).join(', ');
  if (cityState) parts.push(cityState);
  return parts.join(' · ') || clinic.city_name || 'India';
}

function reviewCountLabel(count) {
  const n = Number(count) || 0;
  return n > 0 ? n.toLocaleString('en-IN') : '0';
}

/**
 * @param {{ clinic: object, compact?: boolean, variant?: 'default' | 'listing' }} props
 */
export default function ClinicCard({ clinic, compact = false, variant = 'default' }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const bookTo = bookClinicUrl(clinic.id);
  const mapUrl = clinicMapsUrl(clinic);
  const rating = Number(clinic.rating_avg) || 0;
  const ratingCount = Number(clinic.rating_count) || 0;
  const doctorCount = Number(clinic.doctor_count) || 0;
  const photo = clinicPhotoUrl(clinic);

  const openPreview = () => setPreviewOpen(true);

  if (compact) {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          onClick={openPreview}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPreview()}
          className="premium-preview-card premium-preview-card--clinic p-4 animate-fade-in cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400/30 to-teal-600/40 rounded-xl flex items-center justify-center text-emerald-800 shrink-0 overflow-hidden">
              {photo ? (
                <img src={photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <FaIcon icon="fa-hospital" className="text-lg" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm truncate">{clinic.name}</h3>
              <p className="text-slate-600 text-xs truncate">{clinic.city_name || 'India'}</p>
              {clinic.distance_km != null && (
                <p className="text-primary-600 text-xs mt-0.5">{Number(clinic.distance_km).toFixed(1)} km away</p>
              )}
            </div>
            <Link to={bookTo} onClick={stopNav} className="btn-primary text-xs py-2 px-3 shrink-0">
              Book
            </Link>
          </div>
        </div>
        <ClinicPreviewModal clinic={clinic} open={previewOpen} onClose={() => setPreviewOpen(false)} />
      </>
    );
  }

  if (variant === 'listing') {
    return (
      <>
        <article
          role="button"
          tabIndex={0}
          onClick={openPreview}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPreview()}
          className="premium-preview-card premium-preview-card--clinic interactive-card group relative flex flex-col h-full overflow-hidden cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <div className="relative h-36 sm:h-40 bg-gradient-to-br from-emerald-100 via-teal-50 to-slate-100 shrink-0">
            {photo ? (
              <img
                src={photo}
                alt={clinic.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-emerald-300/80">
                <FaIcon icon="fa-hospital" className="text-5xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-white leading-tight drop-shadow-sm line-clamp-2">
                  {clinic.name}
                </h3>
              </div>
              {clinic.distance_km != null && (
                <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 text-sky-800 text-xs font-semibold shadow-sm">
                  <FaIcon icon="fa-route" />
                  {Number(clinic.distance_km).toFixed(1)} km
                </span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {showPartnerClinicBadge(clinic) && <PartnerClinicBadge />}
              <BadgeList badges={clinic.badges} compact className="!mt-0" />
              {Number(clinic.is_featured) ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-900 text-[11px] font-semibold border border-violet-100">
                  <FaIcon icon="fa-star" className="text-violet-500 text-[10px]" />
                  Featured
                </span>
              ) : null}
            </div>

            <p className="text-sm text-slate-600 flex items-start gap-2 line-clamp-2 mb-4">
              <FaIcon icon="fa-location-dot" className="text-emerald-500 shrink-0 mt-0.5" />
              <span>{locationLine(clinic)}</span>
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-xl bg-amber-50/90 border border-amber-100 px-2 py-2.5 text-center">
                <p className="text-[10px] uppercase font-bold text-amber-700/80 tracking-wide">Rating</p>
                <p className="text-sm font-bold text-amber-900 mt-0.5 flex items-center justify-center gap-1">
                  <FaIcon icon="fa-star" className="text-amber-500 text-xs" />
                  {rating > 0 ? rating.toFixed(1) : 'New'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-2 py-2.5 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">Reviews</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{reviewCountLabel(ratingCount)}</p>
              </div>
              <div className="rounded-xl bg-emerald-50/90 border border-emerald-100 px-2 py-2.5 text-center">
                <p className="text-[10px] uppercase font-bold text-emerald-700/80 tracking-wide">Doctors</p>
                <p className="text-sm font-bold text-emerald-900 mt-0.5">{doctorCount}</p>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap gap-2">
              <Link
                to={clinicProfileUrl(clinic)}
                onClick={stopNav}
                className="btn-outline flex-1 min-w-[6rem] text-center text-sm !py-2.5 inline-flex items-center justify-center gap-1.5"
              >
                <FaIcon icon="fa-hospital" className="text-xs" />
                Profile
              </Link>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={stopNav}
                  className="btn-outline text-sm !py-2.5 !px-3 inline-flex items-center justify-center"
                  aria-label="Directions"
                >
                  <FaIcon icon="fa-diamond-turn-right" />
                </a>
              )}
              <Link
                to={bookTo}
                onClick={stopNav}
                className="btn-primary flex-[1.4] min-w-[8rem] text-center text-sm !py-2.5 inline-flex items-center justify-center gap-2 !bg-emerald-600 hover:!bg-emerald-700"
              >
                <FaIcon icon="fa-calendar-check" className="text-xs" />
                Book Appointment
              </Link>
            </div>
          </div>
        </article>
        <ClinicPreviewModal clinic={clinic} open={previewOpen} onClose={() => setPreviewOpen(false)} />
      </>
    );
  }

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={openPreview}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPreview()}
        className="premium-preview-card premium-preview-card--clinic flex flex-col h-full animate-fade-in group cursor-pointer overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
      >
        <div className="relative h-32 bg-gradient-to-br from-emerald-100 to-teal-50 shrink-0">
          {photo ? (
            <img src={photo} alt={clinic.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-emerald-300">
              <FaIcon icon="fa-hospital" className="text-4xl" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
        </div>

        <div className="p-5 md:p-6 flex-1 flex flex-col">
          <div className="flex gap-3 -mt-10 relative z-10 mb-3">
            <ClinicLogo clinic={clinic} size="lg" className="ring-4 ring-white shadow-md" />
            <div className="min-w-0 flex-1 pt-8">
              <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-primary-700 transition-colors line-clamp-2">
                {clinic.name}
              </h3>
            </div>
          </div>

          <p className="text-slate-600 text-sm line-clamp-2 flex items-start gap-1.5 mb-3">
            <FaIcon icon="fa-location-dot" className="text-slate-400 shrink-0 mt-0.5" />
            <span>{locationLine(clinic)}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {showPartnerClinicBadge(clinic) && <PartnerClinicBadge className="text-xs font-medium" />}
            <BadgeList badges={clinic.badges} compact className="!mt-0" />
            {rating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-100">
                <FaIcon icon="fa-star" className="text-amber-500" />
                {rating.toFixed(1)}
                {ratingCount > 0 && <span className="font-normal">({formatReviewCount(ratingCount)})</span>}
              </span>
            )}
            {doctorCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100">
                <FaIcon icon="fa-user-doctor" />
                {doctorCount} doctor{doctorCount !== 1 ? 's' : ''}
              </span>
            )}
            {clinic.distance_km != null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-medium border border-sky-100">
                <FaIcon icon="fa-route" />
                {Number(clinic.distance_km).toFixed(1)} km
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-wrap gap-2">
            <Link to={clinicProfileUrl(clinic)} onClick={stopNav} className="btn-outline flex-1 min-w-[7rem] text-center text-sm py-2.5">
              View clinic
            </Link>
            <Link to={bookTo} onClick={stopNav} className="btn-primary flex-1 min-w-[7rem] text-center text-sm py-2.5 inline-flex items-center justify-center gap-2">
              Book Appointment
              <FaIcon icon="fa-arrow-right" className="text-xs" />
            </Link>
          </div>
        </div>
      </article>
      <ClinicPreviewModal clinic={clinic} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </>
  );
}
