export const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  no_show: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const TYPE_ICONS = {
  online: 'fa-video',
  clinic: 'fa-hospital',
  home_visit: 'fa-house-medical',
};

export function formatTime(t) {
  if (!t) return '—';
  return String(t).slice(0, 5);
}

export function formatType(type) {
  if (!type) return '—';
  return type.replace(/_/g, ' ');
}

export function patientLabel(appt) {
  return (
    appt.patient_full_name ||
    [appt.patient_first_name, appt.patient_last_name].filter(Boolean).join(' ') ||
    'Patient'
  );
}

export function appointmentSearchBlob(appt, includeDoctor = true) {
  return [
    appt.booking_id,
    appt.id,
    appt.patient_full_name,
    appt.patient_first_name,
    appt.patient_last_name,
    appt.patient_mobile,
    appt.patient_email,
    includeDoctor ? appt.doctor_first_name : null,
    includeDoctor ? appt.doctor_last_name : null,
    appt.pain_type,
    appt.clinic_name,
    appt.invoice_number,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function computeStats(list) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: list.length,
    pending: list.filter((a) => a.status === 'pending').length,
    today: list.filter((a) => a.appointment_date === today).length,
    paidTotal: list
      .filter((a) => a.payment_status === 'paid')
      .reduce((s, a) => s + Number(a.amount || 0), 0),
  };
}

export function filterAppointments(list, { search, typeFilter, payFilter, statusFilter, includeDoctorInSearch = true }) {
  let out = [...list];

  if (statusFilter) {
    out = out.filter((a) => a.status === statusFilter);
  }
  if (typeFilter) {
    out = out.filter((a) => a.consultation_type === typeFilter);
  }
  if (payFilter) {
    out = out.filter((a) => (a.payment_status || 'pending') === payFilter);
  }

  const q = search.trim().toLowerCase();
  if (q) {
    out = out.filter((a) => appointmentSearchBlob(a, includeDoctorInSearch).includes(q));
  }

  return out;
}

export function sortAppointments(list, sortBy) {
  const arr = [...list];
  const pendingFirst = (a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (b.status === 'pending' && a.status !== 'pending') return 1;
    return 0;
  };

  switch (sortBy) {
    case 'oldest':
      arr.sort((a, b) => `${a.appointment_date}${a.start_time}`.localeCompare(`${b.appointment_date}${b.start_time}`));
      break;
    case 'amount':
      arr.sort((a, b) => Number(b.amount) - Number(a.amount));
      break;
    case 'patient':
      arr.sort((a, b) => patientLabel(a).localeCompare(patientLabel(b)));
      break;
    case 'pending_first':
      arr.sort((a, b) => {
        const p = pendingFirst(a, b);
        if (p !== 0) return p;
        return `${b.appointment_date}${b.start_time}`.localeCompare(`${a.appointment_date}${a.start_time}`);
      });
      return arr;
    case 'newest':
    default:
      arr.sort((a, b) => `${b.appointment_date}${b.start_time}`.localeCompare(`${a.appointment_date}${a.start_time}`));
  }
  return arr;
}

export function groupByPending(filtered) {
  const pending = filtered.filter((a) => a.status === 'pending');
  const rest = filtered.filter((a) => a.status !== 'pending');
  return { pending, rest, hasPending: pending.length > 0 };
}
