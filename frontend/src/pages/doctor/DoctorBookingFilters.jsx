import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import FaIcon from '../../components/FaIcon';
import { doctors } from '../../services/api';
import { DOCTOR_NAV } from '../../constants/doctorNav';
import toast from 'react-hot-toast';

export default function DoctorBookingFilters() {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    doctors
      .bookingFilters()
      .then((res) => setFilters(res.data || []))
      .catch((e) => toast.error(e.message || 'Could not load filters'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = (id) => {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const filter_ids = filters.filter((f) => f.selected).map((f) => f.id);
      const res = await doctors.updateBookingFilters(filter_ids);
      setFilters(res.data || []);
      toast.success('Booking filters updated — you will appear in selected categories');
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout links={DOCTOR_NAV} variant="doctor">
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Booking filters</h1>
        <p className="text-sm text-slate-600 mt-1 mb-6">
          Select specialization categories where patients can find you in the appointment booking wizard.
          Keywords from admin filters also auto-match your profile specialization text.
        </p>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-200 rounded-xl" />
            ))}
          </div>
        ) : filters.length === 0 ? (
          <div className="glass-card text-center py-10">
            <p className="text-slate-600">No specialization filters configured yet.</p>
            <p className="text-xs text-slate-500 mt-2">Ask admin to add filters in Booking settings.</p>
          </div>
        ) : (
          <div className="glass-card space-y-2 !p-4">
            {filters.map((f) => (
              <label
                key={f.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  f.selected ? 'border-primary-400 bg-primary-50/80' : 'border-slate-200 bg-white/70 hover:border-primary-200'
                }`}
              >
                <input type="checkbox" checked={!!f.selected} onChange={() => toggle(f.id)} className="rounded border-slate-300" />
                <span className="font-semibold text-slate-800">{f.label}</span>
                <span className="text-xs text-slate-400 ml-auto">{f.slug}</span>
              </label>
            ))}
            <button type="button" className="btn-primary w-full mt-4" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save filter categories'}
            </button>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-6">
          Also keep your{' '}
          <Link to="/doctor/profile" className="text-primary-600 font-semibold hover:underline">
            profile specialization
          </Link>{' '}
          accurate for automatic keyword matching.
        </p>
      </div>
    </DashboardLayout>
  );
}
