import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import FaIcon from '../../components/FaIcon';
import { doctors, profileServices } from '../../services/api';
import { DOCTOR_NAV } from '../../constants/doctorNav';
import toast from 'react-hot-toast';

const emptyForm = () => ({
  name: '',
  price: '',
  short_description: '',
  is_active: 1,
});

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function ServiceForm({ form, set, onSubmit, onCancel, saving, submitLabel }) {
  const words = wordCount(form.short_description || '');
  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Service name</label>
        <input
          className="input-field"
          placeholder="e.g. Dry Needling, Cupping Therapy"
          value={form.name}
          onChange={(e) => set({ ...form, name: e.target.value })}
          required
          maxLength={120}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
        <input
          type="number"
          min={0}
          step={50}
          className="input-field"
          placeholder="0 for on request"
          value={form.price}
          onChange={(e) => set({ ...form, price: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Short description <span className="text-slate-400 font-normal">(max 50 words)</span>
        </label>
        <textarea
          className="input-field"
          rows={3}
          placeholder="Briefly describe what this service includes…"
          value={form.short_description}
          onChange={(e) => set({ ...form, short_description: e.target.value })}
        />
        <p className={`text-xs mt-1 ${words > 50 ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
          {words}/50 words
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={!!form.is_active}
          onChange={(e) => set({ ...form, is_active: e.target.checked ? 1 : 0 })}
        />
        Visible on public profile
      </label>
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="submit" disabled={saving || words > 50} className="btn-primary text-sm">
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline text-sm">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function DoctorTreatmentServices() {
  const [tab, setTab] = useState('doctor');
  const [doctorServices, setDoctorServices] = useState([]);
  const [clinicServices, setClinicServices] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [clinicId, setClinicId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadDoctorServices = useCallback(async () => {
    const res = await profileServices.listDoctor();
    setDoctorServices(res?.data || []);
  }, []);

  const loadClinics = useCallback(async () => {
    const res = await doctors.clinics();
    const rows = res?.data || [];
    setClinics(rows);
    if (!clinicId && rows[0]?.id) setClinicId(String(rows[0].id));
  }, [clinicId]);

  const loadClinicServices = useCallback(async () => {
    if (!clinicId) {
      setClinicServices([]);
      return;
    }
    const res = await profileServices.listClinic(clinicId);
    setClinicServices(res?.data || []);
  }, [clinicId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDoctorServices(), loadClinics()])
      .catch(() => toast.error('Could not load services'))
      .finally(() => setLoading(false));
  }, [loadDoctorServices, loadClinics]);

  useEffect(() => {
    if (tab === 'clinic' && clinicId) {
      loadClinicServices().catch(() => toast.error('Could not load clinic services'));
    }
  }, [tab, clinicId, loadClinicServices]);

  const activeList = tab === 'doctor' ? doctorServices : clinicServices;

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowAdd(false);
  };

  const startEdit = (service) => {
    setEditingId(service.id);
    setShowAdd(false);
    setForm({
      name: service.name || '',
      price: service.price ?? '',
      short_description: service.short_description || '',
      is_active: service.is_active ? 1 : 0,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (wordCount(form.short_description) > 50) {
      toast.error('Description must be 50 words or fewer');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: parseFloat(form.price) || 0,
        short_description: form.short_description.trim(),
        is_active: form.is_active ? 1 : 0,
      };
      if (tab === 'doctor') {
        if (editingId) {
          await profileServices.updateDoctor(editingId, payload);
        } else {
          await profileServices.createDoctor(payload);
        }
        await loadDoctorServices();
      } else {
        if (!clinicId) {
          toast.error('Select a clinic first');
          return;
        }
        if (editingId) {
          await profileServices.updateClinic(clinicId, editingId, payload);
        } else {
          await profileServices.createClinic(clinicId, payload);
        }
        await loadClinicServices();
      }
      toast.success(editingId ? 'Service updated' : 'Service added');
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this service from your profile?')) return;
    try {
      if (tab === 'doctor') {
        await profileServices.deleteDoctor(id);
        await loadDoctorServices();
      } else {
        await profileServices.deleteClinic(clinicId, id);
        await loadClinicServices();
      }
      toast.success('Service removed');
      if (editingId === id) resetForm();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const examples = useMemo(
    () => ['Cupping Therapy', 'Wet Cupping', 'Dry Needling', 'Chiropractic', 'Sports Massage', 'Manual Therapy', 'Shockwave Therapy'],
    []
  );

  return (
    <DashboardLayout title="Services & treatments" navItems={DOCTOR_NAV}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass-card p-5 md:p-6">
          <h1 className="text-xl font-bold text-slate-900">Services &amp; treatments</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Add unlimited treatment services with name, price, and a short description. These appear on your public doctor
            or clinic profile — separate from consultation mode toggles and treatment packages.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {examples.map((ex) => (
              <span key={ex} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {ex}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => { setTab('doctor'); resetForm(); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${tab === 'doctor' ? 'bg-white shadow text-primary-700' : 'text-slate-600'}`}
          >
            My services
          </button>
          <button
            type="button"
            onClick={() => { setTab('clinic'); resetForm(); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${tab === 'clinic' ? 'bg-white shadow text-emerald-700' : 'text-slate-600'}`}
          >
            Clinic services
          </button>
        </div>

        {tab === 'clinic' && (
          <div className="glass-card p-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select clinic</label>
            <select className="input-field" value={clinicId} onChange={(e) => { setClinicId(e.target.value); resetForm(); }}>
              {clinics.length === 0 ? <option value="">No clinics linked</option> : null}
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {!showAdd && !editingId && (
          <button type="button" onClick={() => { setShowAdd(true); setForm(emptyForm()); }} className="btn-primary text-sm inline-flex items-center gap-2">
            <FaIcon icon="fa-plus" />
            Add service
          </button>
        )}

        {(showAdd || editingId) && (
          <ServiceForm
            form={form}
            set={setForm}
            onSubmit={handleSave}
            onCancel={resetForm}
            saving={saving}
            submitLabel={editingId ? 'Update service' : 'Add service'}
          />
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : activeList.length === 0 ? (
          <div className="glass-card text-center py-12 px-6 text-slate-500 text-sm">
            No services yet. Add your first treatment service above.
          </div>
        ) : (
          <div className="space-y-3">
            {activeList.map((service) => (
              <div key={service.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                    {!service.is_active && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600">Hidden</span>
                    )}
                  </div>
                  {service.short_description && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{service.short_description}</p>
                  )}
                  <p className="text-sm font-bold text-primary-700 mt-2">
                    {Number(service.price) > 0 ? `₹${Number(service.price).toLocaleString('en-IN')}` : 'On request'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => startEdit(service)} className="btn-outline text-xs !py-2 !px-3">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(service.id)} className="btn-outline text-xs !py-2 !px-3 text-red-600 border-red-200">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
