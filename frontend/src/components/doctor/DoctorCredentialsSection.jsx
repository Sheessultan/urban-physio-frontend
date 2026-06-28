import FaIcon from '../FaIcon';

/**
 * Professional qualifications, certifications, and experience timeline for public doctor profiles.
 *
 * @param {{ doctor: object }} props
 */
export default function DoctorCredentialsSection({ doctor }) {
  const bpt = (doctor.degree_bpt || '').trim();
  const mpt = (doctor.degree_mpt || '').trim();
  const legacyQuals = (doctor.qualifications || '').trim();
  const certifications = doctor.certifications_list?.length
    ? doctor.certifications_list
    : [];
  const timeline = doctor.experience_timeline_list?.length
    ? doctor.experience_timeline_list
    : [];

  const hasDegrees = bpt || mpt;
  const hasContent = hasDegrees || certifications.length > 0 || timeline.length > 0 || legacyQuals;
  if (!hasContent) return null;

  return (
    <div className="space-y-6">
      {(hasDegrees || legacyQuals) && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <FaIcon icon="fa-graduation-cap" className="text-primary-600" />
            Qualifications
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {bpt && (
              <div className="rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50/80 to-white px-4 py-3.5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600">BPT</p>
                <p className="text-sm font-semibold text-slate-800 mt-1 leading-snug">{bpt}</p>
              </div>
            )}
            {mpt && (
              <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white px-4 py-3.5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">MPT</p>
                <p className="text-sm font-semibold text-slate-800 mt-1 leading-snug">{mpt}</p>
              </div>
            )}
            {!hasDegrees && legacyQuals && (
              <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5">
                <p className="text-sm text-slate-700 leading-relaxed">{legacyQuals}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <FaIcon icon="fa-certificate" className="text-amber-600" />
            Certifications
          </h3>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert) => (
              <span
                key={cert}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 text-sm font-medium border border-amber-100/80 shadow-sm"
              >
                <FaIcon icon="fa-award" className="text-amber-500 text-xs shrink-0" />
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {timeline.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <FaIcon icon="fa-briefcase-medical" className="text-emerald-600" />
            Experience
          </h3>
          <ol className="relative border-l-2 border-emerald-200/80 ml-3 space-y-0">
            {timeline.map((entry, idx) => (
              <li key={`${entry.organization}-${idx}`} className="relative pl-6 pb-6 last:pb-0">
                <span className="absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white shadow-sm" />
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {entry.duration || 'Experience'}
                  {entry.organization ? (
                    <span className="font-semibold text-slate-600"> — {entry.organization}</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
