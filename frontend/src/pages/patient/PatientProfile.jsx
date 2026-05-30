import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import PasswordSecuritySection from '../../components/PasswordSecuritySection';
import LocationMapModal from '../../components/LocationMapModal';
import FaIcon from '../../components/FaIcon';
import SearchableLocationSelect from '../../components/SearchableLocationSelect';
import { patients, location } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { PATIENT_NAV } from '../../constants/patientNav';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'personal', label: 'Personal', icon: 'fa-user' },
  { id: 'location', label: 'Address', icon: 'fa-map-location-dot' },
  { id: 'medical', label: 'Medical', icon: 'fa-notes-medical' },
  { id: 'security', label: 'Security', icon: 'fa-shield-halved' },
];

const emptyForm = () => ({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  state_id: '',
  city_id: '',
  city_name: '',
  state_name: '',
  address: '',
  latitude: null,
  longitude: null,
  date_of_birth: '',
  gender: '',
  emergency_contact: '',
  medical_notes: '',
  age: null,
});

function profileToForm(p) {
  if (!p) return emptyForm();
  return {
    first_name: p.first_name || '',
    last_name: p.last_name || '',
    email: p.email || '',
    phone: p.phone || '',
    state_id: p.state_id ? String(p.state_id) : '',
    city_id: p.city_id ? String(p.city_id) : '',
    city_name: p.city_name || '',
    state_name: p.state_name || '',
    address: p.address || '',
    latitude: p.latitude != null ? parseFloat(p.latitude) : null,
    longitude: p.longitude != null ? parseFloat(p.longitude) : null,
    date_of_birth: p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : '',
    gender: p.gender || '',
    emergency_contact: p.emergency_contact || '',
    medical_notes: p.medical_notes || '',
    age: p.age ?? null,
  };
}

export default function PatientProfile() {
  const { user, setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => searchParams.get('tab') || 'personal');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const load = useCallback(() => {
    setLoading(true);
    patients
      .getProfile()
      .then((res) => {
        const p = res?.data ?? res;
        setForm(profileToForm(p));
        setUser((u) => (u ? { ...u, first_name: p.first_name, last_name: p.last_name } : u));
      })
      .catch((err) => {
        toast.error(err.message || 'Could not load profile');
      })
      .finally(() => setLoading(false));
  }, [setUser]);

  useEffect(() => {
    load();
    location.states().then((res) => setStates(res.data || []));
  }, [load]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, [searchParams]);

  const onPasswordUpdated = (authUser) => {
    if (authUser && typeof authUser === 'object') {
      setUser((u) => {
        const merged = { ...u, ...authUser };
        localStorage.setItem('user', JSON.stringify(merged));
        return merged;
      });
    }
  };

  const switchTab = (id) => {
    setTab(id);
    navigate(id === 'personal' ? '/patient/profile' : `/patient/profile?tab=${id}`, { replace: true });
  };

  useEffect(() => {
    if (form.state_id) {
      location.cities(form.state_id).then((res) => setCities(res.data || []));
    } else {
      setCities([]);
    }
  }, [form.state_id]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await patients.updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city_id: form.city_id ? Number(form.city_id) : null,
        latitude: form.latitude,
        longitude: form.longitude,
        date_of_birth: form.date_of_birth || '',
        gender: form.gender || '',
        emergency_contact: form.emergency_contact.trim(),
        medical_notes: form.medical_notes.trim(),
      });
      const p = res?.data ?? res;
      setForm(profileToForm(p));
      setUser((u) => (u ? { ...u, first_name: p.first_name, last_name: p.last_name } : u));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Save failed');
      if (err.errors) Object.values(err.errors).forEach((m) => toast.error(m));
    } finally {
      setSaving(false);
    }
  };

  const handleMapConfirm = ({ lat, lng, address }) => {
    set('latitude', lat);
    set('longitude', lng);
    if (address) set('address', address);
    setMapOpen(false);
  };

  if (loading) {
    return (
      <DashboardLayout links={PATIENT_NAV} variant="patient">
        <div className="glass-card h-64 animate-pulse max-w-2xl" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout links={PATIENT_NAV} variant="patient">
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Profile settings</h1>
        <p className="text-slate-600 text-sm mt-1 mb-5 md:mb-6">
          Keep your name, contact, address, and medical info up to date for faster bookings.
        </p>

        <div className="flex gap-2 mb-5 md:mb-6 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              className={`shrink-0 px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 md:gap-2 ${
                tab === t.id
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                  : 'bg-white/70 text-slate-600 border border-slate-200 hover:border-primary-300'
              }`}
            >
              <FaIcon icon={t.icon} className="text-xs md:text-sm" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'security' ? (
          <div className="glass-card !p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Password & security</h2>
            <PasswordSecuritySection
              passwordCustomized={!!user?.password_customized}
              onUpdated={onPasswordUpdated}
            />
          </div>
        ) : (
        <form onSubmit={save} className="glass-card !p-6 space-y-4">
          {tab === 'personal' && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  className="input-field"
                  placeholder="First name *"
                  value={form.first_name}
                  onChange={(e) => set('first_name', e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Last name *"
                  value={form.last_name}
                  onChange={(e) => set('last_name', e.target.value)}
                  required
                />
              </div>
              <input className="input-field bg-slate-50" value={form.email} disabled title="Email cannot be changed here" />
              <input
                className="input-field"
                placeholder="Mobile"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  className="input-field"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => set('date_of_birth', e.target.value)}
                />
                <select
                  className="input-field"
                  value={form.gender}
                  onChange={(e) => set('gender', e.target.value)}
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {form.age != null && (
                <p className="text-xs text-slate-500">Age from date of birth: {form.age} years</p>
              )}
            </>
          )}

          {tab === 'location' && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <SearchableLocationSelect
                  id="patient-profile-state"
                  label="State"
                  placeholder="Select state"
                  options={states}
                  value={form.state_id}
                  onChange={(id) => {
                    set('state_id', id);
                    set('city_id', '');
                  }}
                  emptyMessage="No state found"
                />
                <SearchableLocationSelect
                  id="patient-profile-city"
                  label="City"
                  placeholder={form.state_id ? 'Select city' : 'Select state first'}
                  options={cities}
                  value={form.city_id}
                  onChange={(id) => set('city_id', id)}
                  disabled={!form.state_id}
                  emptyMessage="No city found"
                />
              </div>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Full address"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
              />
              <button
                type="button"
                className="btn-outline text-sm inline-flex items-center gap-2"
                onClick={() => setMapOpen(true)}
              >
                <FaIcon icon="fa-map-pin" />
                Pin on map
              </button>
              {form.latitude != null && (
                <p className="text-xs text-slate-500 font-mono">
                  {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
                </p>
              )}
            </>
          )}

          {tab === 'medical' && (
            <>
              <input
                className="input-field"
                placeholder="Emergency contact (name & phone)"
                value={form.emergency_contact}
                onChange={(e) => set('emergency_contact', e.target.value)}
              />
              <textarea
                className="input-field"
                rows={4}
                placeholder="Medical notes (allergies, conditions — optional)"
                value={form.medical_notes}
                onChange={(e) => set('medical_notes', e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Shared with your doctor when you book. Not a substitute for clinical records.
              </p>
            </>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto mt-2">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
        )}
      </div>

      <LocationMapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        initialLat={form.latitude}
        initialLng={form.longitude}
        onConfirm={handleMapConfirm}
      />
    </DashboardLayout>
  );
}
