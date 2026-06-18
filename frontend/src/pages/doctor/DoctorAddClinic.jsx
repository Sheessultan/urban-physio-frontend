import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LocationMapModal from '../../components/LocationMapModal';
import FaIcon from '../../components/FaIcon';
import SearchableLocationSelect from '../../components/SearchableLocationSelect';
import ClinicLogoUpload from '../../components/ClinicLogoUpload';
import { doctors, location } from '../../services/api';
import { DOCTOR_NAV } from '../../constants/doctorNav';
import toast from 'react-hot-toast';

const empty = () => ({
  name: '',
  address: '',
  city_id: '',
  pincode: '',
  phone: '',
  email: '',
  logo: '',
  latitude: null,
  longitude: null,
  image_urls: [],
});

export default function DoctorAddClinic() {
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [stateId, setStateId] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    location.states().then((res) => setStates(res.data || []));
  }, []);

  useEffect(() => {
    if (stateId) {
      location.cities(stateId).then((res) => setCities(res.data || []));
    } else {
      setCities([]);
    }
  }, [stateId]);

  useEffect(() => {
    if (!editId) return;
    doctors
      .clinics()
      .then((res) => {
        const found = (res.data || []).find((c) => String(c.id) === String(editId));
        if (!found) return;
        setForm((f) => ({
          ...f,
          name: found.name || '',
          address: found.address || '',
          city_id: found.city_id ? String(found.city_id) : '',
          phone: found.phone || '',
          email: found.email || '',
          logo: found.logo || '',
          latitude: found.latitude != null ? parseFloat(found.latitude) : null,
          longitude: found.longitude != null ? parseFloat(found.longitude) : null,
        }));
      })
      .catch(() => toast.error('Could not load clinic'));
  }, [editId]);

  const selectedCity = useMemo(
    () => cities.find((c) => String(c.id) === String(form.city_id)),
    [cities, form.city_id]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.city_id || !form.phone.trim()) {
      toast.error('Please fill clinic name, address, city and phone');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        city_id: parseInt(form.city_id, 10),
        latitude: form.latitude,
        longitude: form.longitude,
        pincode: form.pincode.trim() || undefined,
      };
      if (editId) {
        await doctors.updateClinic(editId, payload);
        toast.success('Clinic updated');
      } else {
        await doctors.createClinic(payload);
        toast.success('Clinic submitted for approval');
      }
      navigate('/doctor/clinics');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout links={DOCTOR_NAV} variant="doctor">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{editId ? 'Edit Clinic' : 'Add Clinic'}</h1>
        <p className="text-sm text-slate-600 mt-1">
          Clinics you submit are reviewed by admin. Only approved clinics are visible to patients.
        </p>
      </div>

      <form onSubmit={submit} className="card max-w-2xl space-y-4">
        <ClinicLogoUpload
          logo={form.logo}
          name={form.name}
          clinicId={editId || null}
          onUploaded={(url) => set('logo', url)}
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Clinic name</label>
          <input className="input-field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Urban Physio Clinic" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full address</label>
          <textarea className="input-field" rows={3} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Street, landmark, area..." />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <SearchableLocationSelect
            label="State"
            placeholder="Select state"
            options={states}
            value={stateId}
            onChange={(id) => {
              setStateId(id);
              set('city_id', '');
            }}
          />
          <SearchableLocationSelect
            label="City"
            placeholder={stateId ? 'Select city' : 'Select state first'}
            options={cities}
            value={form.city_id}
            onChange={(id) => set('city_id', id)}
            disabled={!stateId}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
            <input className="input-field" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} placeholder="400001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input className="input-field" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 ..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
          <input type="email" className="input-field" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="clinic@example.com" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-800 text-sm flex items-center gap-2">
            <FaIcon icon="fa-map-location-dot" className="text-primary-600" /> Map location
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Add a pin so patients can find the clinic location. You can update later.
          </p>
          <button type="button" className="btn-outline text-sm mt-3 w-full" onClick={() => setMapOpen(true)}>
            Pick on map
          </button>
          {form.latitude != null && (
            <p className="text-xs text-slate-600 mt-2">
              Pin: {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}
              {selectedCity?.name ? ` · ${selectedCity.name}` : ''}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" className="btn-outline flex-1" onClick={() => navigate('/doctor/clinics')}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : editId ? 'Save changes' : 'Submit for approval'}
          </button>
        </div>
      </form>

      <LocationMapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        initialLat={form.latitude}
        initialLng={form.longitude}
        onConfirm={({ lat, lng }) => {
          set('latitude', lat);
          set('longitude', lng);
        }}
      />
    </DashboardLayout>
  );
}

