import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import FaIcon from '../../components/FaIcon';
import { doctors as doctorsApi } from '../../services/api';
import { DOCTOR_NAV } from '../../constants/doctorNav';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  pending: 'Awaiting acceptance',
  doctor_assigned: 'Doctor assigned',
  en_route: 'En route to patient',
  arrived: 'Arrived at location',
  in_consultation: 'In consultation',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_STEPS = ['doctor_assigned', 'en_route', 'arrived', 'in_consultation', 'completed'];

function patientName(appt) {
  return appt.patient_full_name || `${appt.patient_first_name || ''} ${appt.patient_last_name || ''}`.trim() || 'Patient';
}

function mapsUrl(appt) {
  const meta = typeof appt.booking_meta === 'object' ? appt.booking_meta : {};
  const lat = meta.patient_lat;
  const lng = meta.patient_lng;
  if (lat && lng) return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const addr = meta.full_address;
  if (addr) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
  return null;
}

export default function DoctorEmergency() {
  const [available, setAvailable] = useState(false);
  const [radius, setRadius] = useState(15);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [availRes, queueRes] = await Promise.all([
        doctorsApi.emergencyAvailability(),
        doctorsApi.emergencyQueue(),
      ]);
      setAvailable(!!availRes.data?.emergency_available);
      setRadius(availRes.data?.emergency_radius_km ?? 15);
      setQueue(queueRes.data || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load emergency data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const toggleAvailability = async () => {
    setSaving(true);
    try {
      const res = await doctorsApi.setEmergencyAvailability({
        emergency_available: !available,
        emergency_radius_km: radius,
      });
      setAvailable(!!res.data?.emergency_available);
      toast.success(res.message || 'Updated');
    } catch (e) {
      toast.error(e.message || 'Could not update availability');
    } finally {
      setSaving(false);
    }
  };

  const saveRadius = async () => {
    setSaving(true);
    try {
      await doctorsApi.setEmergencyAvailability({ emergency_available: available, emergency_radius_km: radius });
      toast.success('Service radius updated');
    } catch (e) {
      toast.error(e.message || 'Could not save radius');
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await doctorsApi.acceptEmergency(id);
      toast.success('Emergency accepted');
      load();
    } catch (e) {
      toast.error(e.message || 'Accept failed');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Decline this emergency request?')) return;
    try {
      await doctorsApi.rejectEmergency(id);
      toast.success('Request declined');
      load();
    } catch (e) {
      toast.error(e.message || 'Reject failed');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await doctorsApi.updateEmergencyStatus(id, status);
      toast.success('Status updated');
      load();
    } catch (e) {
      toast.error(e.message || 'Update failed');
    }
  };

  return (
    <DashboardLayout links={DOCTOR_NAV} variant="doctor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <FaIcon icon="fa-truck-medical" />
            </span>
            Emergency Care
          </h1>
          <p className="text-slate-600 text-sm mt-1">Manage instant emergency availability and respond to urgent requests</p>
        </div>

        <div className="glass-card !p-5 sm:!p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">Emergency availability</p>
              <p className="text-sm text-slate-600 mt-0.5">
                {available ? 'You are visible for urgent bookings' : 'You will not receive emergency requests'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAvailability}
              disabled={saving}
              className={`relative inline-flex h-10 w-[4.5rem] shrink-0 items-center rounded-full transition ${
                available ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              aria-pressed={available}
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white shadow transition ${
                  available ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="block font-medium text-slate-700 mb-1">Home visit radius (km)</span>
              <input
                type="number"
                min={5}
                max={50}
                className="input-field w-28"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </label>
            <button type="button" className="btn-outline text-sm !py-2" onClick={saveRadius} disabled={saving}>
              Save radius
            </button>
          </div>
        </div>

        <div className="glass-card !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Emergency queue</h2>
            <button type="button" className="text-sm text-orange-600 font-medium" onClick={load}>
              <FaIcon icon="fa-rotate-right" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
          ) : queue.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No active emergency requests</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {queue.map((appt) => {
                const navUrl = mapsUrl(appt);
                const es = appt.emergency_status || 'pending';
                const stepIdx = STATUS_STEPS.indexOf(es);
                return (
                  <div key={appt.id} className="p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">{patientName(appt)}</p>
                        <p className="text-xs text-slate-500 font-mono">{appt.booking_id}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {appt.emergency_type?.replace('_', ' ')} · {appt.pain_type} ·{' '}
                          <span className="capitalize">{appt.emergency_level}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{appt.pain_description}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-semibold capitalize">
                        {STATUS_LABELS[es] || es}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {es === 'pending' && appt.payment_status === 'paid' && (
                        <>
                          <button type="button" className="btn-primary !py-2 !px-3 text-xs bg-emerald-600" onClick={() => handleAccept(appt.id)}>
                            Accept
                          </button>
                          <button type="button" className="btn-outline !py-2 !px-3 text-xs text-red-600" onClick={() => handleReject(appt.id)}>
                            Decline
                          </button>
                        </>
                      )}
                      {appt.google_meet_link && (
                        <a href={appt.google_meet_link} target="_blank" rel="noreferrer" className="btn-primary !py-2 !px-3 text-xs inline-flex gap-1">
                          <FaIcon icon="fa-video" /> Join Meeting
                        </a>
                      )}
                      {navUrl && appt.emergency_type === 'home_visit' && (
                        <a href={navUrl} target="_blank" rel="noreferrer" className="btn-outline !py-2 !px-3 text-xs inline-flex gap-1">
                          <FaIcon icon="fa-location-arrow" /> Navigate
                        </a>
                      )}
                      {appt.emergency_type === 'home_visit' && stepIdx >= 0 && stepIdx < STATUS_STEPS.length - 1 && (
                        <button
                          type="button"
                          className="btn-outline !py-2 !px-3 text-xs"
                          onClick={() => handleStatus(appt.id, STATUS_STEPS[Math.max(stepIdx + 1, 1)])}
                        >
                          Mark {STATUS_LABELS[STATUS_STEPS[Math.max(stepIdx + 1, 1)]] || 'Next'}
                        </button>
                      )}
                      {es === 'in_consultation' && (
                        <button type="button" className="btn-outline !py-2 !px-3 text-xs" onClick={() => handleStatus(appt.id, 'completed')}>
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
