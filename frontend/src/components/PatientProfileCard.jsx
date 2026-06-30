import FaIcon from './FaIcon';
import PatientAvatar from './PatientAvatar';

function Stat({ label, value, icon }) {
  if (value == null || value === '') return null;
  return (
    <div className="rounded-xl bg-white/60 border border-white/70 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1">
        {icon && <FaIcon icon={icon} className="text-primary-600" />}
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}

/**
 * @param {{ patient: object, defaultOpen?: boolean }} props
 */
export default function PatientProfileCard({ patient }) {
  const name = [patient.first_name, patient.last_name].filter(Boolean).join(' ') || 'Patient';

  return (
    <div className="glass-card space-y-4">
      <div className="flex flex-wrap items-start gap-4 border-b border-white/60 pb-4">
        <PatientAvatar patient={patient} size="lg" />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-800">{name}</h2>
          <p className="text-sm text-slate-600 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
            {patient.phone && (
              <span className="inline-flex items-center gap-1">
                <FaIcon icon="fa-phone" className="text-xs text-primary-600" />
                {patient.phone}
              </span>
            )}
            {patient.email && (
              <span className="inline-flex items-center gap-1 break-all">
                <FaIcon icon="fa-envelope" className="text-xs text-primary-600" />
                {patient.email}
              </span>
            )}
          </p>
          {patient.city_name && (
            <p className="text-sm text-slate-500 mt-1 inline-flex items-center gap-1">
              <FaIcon icon="fa-location-dot" className="text-primary-600" />
              {patient.city_name}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Stat label="Total visits" value={String(patient.visit_count ?? 0)} icon="fa-calendar-check" />
        <Stat label="First visit" value={patient.first_visit} icon="fa-calendar-plus" />
        <Stat label="Last visit" value={patient.last_visit} icon="fa-calendar-day" />
        <Stat
          label="Total paid"
          value={
            patient.total_paid != null
              ? `₹${Number(patient.total_paid).toLocaleString('en-IN')}`
              : null
          }
          icon="fa-indian-rupee-sign"
        />
        <Stat label="Gender" value={patient.gender} icon="fa-venus-mars" />
        <Stat label="Date of birth" value={patient.date_of_birth} icon="fa-cake-candles" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        {patient.user_address && (
          <div className="rounded-xl bg-white/50 border border-white/70 p-3">
            <p className="text-xs font-semibold text-slate-500 uppercase">Address</p>
            <p className="text-slate-800 mt-1">{patient.user_address}</p>
          </div>
        )}
        {patient.emergency_contact && (
          <div className="rounded-xl bg-white/50 border border-white/70 p-3">
            <p className="text-xs font-semibold text-slate-500 uppercase">Emergency contact</p>
            <p className="text-slate-800 mt-1">{patient.emergency_contact}</p>
          </div>
        )}
        {patient.medical_notes && (
          <div className="rounded-xl bg-white/50 border border-white/70 p-3 sm:col-span-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Medical notes (profile)</p>
            <p className="text-slate-800 mt-1 whitespace-pre-wrap">{patient.medical_notes}</p>
          </div>
        )}
        {patient.patient_since && (
          <p className="text-xs text-slate-500 sm:col-span-2">
            Patient since {patient.patient_since}
          </p>
        )}
      </div>
    </div>
  );
}
