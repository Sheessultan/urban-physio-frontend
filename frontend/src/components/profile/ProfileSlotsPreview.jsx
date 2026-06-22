import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FaIcon from '../FaIcon';
import { booking } from '../../services/api';
import { bookDoctorUrl } from '../../utils/bookUrl';

export default function ProfileSlotsPreview({ doctorId, clinicId = null }) {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    const params = { doctor_id: doctorId };
    if (clinicId) params.clinic_id = clinicId;
    booking
      .availableDates(params)
      .then((res) => setDates((res?.data ?? res ?? []).slice(0, 5)))
      .catch(() => setDates([]))
      .finally(() => setLoading(false));
  }, [doctorId, clinicId]);

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        <FaIcon icon="fa-spinner" className="fa-spin mr-2" />
        Loading available slots…
      </p>
    );
  }

  if (!dates.length) {
    return (
      <p className="text-sm text-slate-600">
        No open slots in the next few days.{' '}
        <Link to={bookDoctorUrl(doctorId)} className="text-primary-600 font-semibold hover:underline">
          Request appointment
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {dates.map((d) => (
        <Link
          key={d}
          to={`${bookDoctorUrl(doctorId)}?date=${encodeURIComponent(d)}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-800 hover:bg-primary-100 transition"
        >
          <FaIcon icon="fa-calendar-day" className="text-primary-600" />
          {new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </Link>
      ))}
    </div>
  );
}
