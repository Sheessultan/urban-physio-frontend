import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import FaIcon from '../../components/FaIcon';
import GlassModal, { GlassModalHeader } from '../../components/GlassModal';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card !p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent || 'text-slate-800'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminLocations() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedStateId, setExpandedStateId] = useState(null);
  const [citiesCache, setCitiesCache] = useState({});
  const [citiesLoading, setCitiesLoading] = useState(null);

  const [stateModal, setStateModal] = useState({ open: false, edit: null });
  const [cityModal, setCityModal] = useState({ open: false, edit: null, stateId: '' });
  const [stateForm, setStateForm] = useState({ name: '', code: '' });
  const [cityForm, setCityForm] = useState({ name: '', state_id: '', latitude: '', longitude: '' });
  const [saving, setSaving] = useState(false);
  const [cityUsersModal, setCityUsersModal] = useState({ open: false, loading: false, data: null });

  const load = useCallback(() => {
    setLoading(true);
    admin
      .locationsOverview()
      .then((res) => setOverview(res.data))
      .catch((e) => toast.error(e.message || 'Could not load locations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const states = overview?.states || [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return states;
    return states.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.code || '').toLowerCase().includes(q)
    );
  }, [states, search]);

  const toggleState = async (state) => {
    if (expandedStateId === state.id) {
      setExpandedStateId(null);
      return;
    }
    setExpandedStateId(state.id);
    if (!citiesCache[state.id]) {
      setCitiesLoading(state.id);
      try {
        const res = await admin.locationsCities(state.id);
        setCitiesCache((c) => ({ ...c, [state.id]: res.data }));
      } catch (e) {
        toast.error(e.message || 'Could not load cities');
      } finally {
        setCitiesLoading(null);
      }
    }
  };

  const openAddState = () => {
    setStateForm({ name: '', code: '' });
    setStateModal({ open: true, edit: null });
  };

  const openEditState = (s) => {
    setStateForm({ name: s.name, code: s.code });
    setStateModal({ open: true, edit: s });
  };

  const openAddCity = (stateId = '') => {
    setCityForm({ name: '', state_id: stateId ? String(stateId) : '', latitude: '', longitude: '' });
    setCityModal({ open: true, edit: null, stateId });
  };

  const openEditCity = (city, stateId) => {
    setCityForm({
      name: city.name,
      state_id: String(stateId),
      latitude: city.latitude ?? '',
      longitude: city.longitude ?? '',
    });
    setCityModal({ open: true, edit: city, stateId });
  };

  const saveState = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (stateModal.edit) {
        await admin.updateState(stateModal.edit.id, stateForm);
        toast.success('State updated');
      } else {
        await admin.createState(stateForm);
        toast.success('State added');
      }
      setStateModal({ open: false, edit: null });
      setCitiesCache({});
      setExpandedStateId(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveCity = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: cityForm.name.trim(),
        state_id: parseInt(cityForm.state_id, 10),
        latitude: cityForm.latitude === '' ? null : parseFloat(cityForm.latitude),
        longitude: cityForm.longitude === '' ? null : parseFloat(cityForm.longitude),
      };
      if (cityModal.edit) {
        await admin.updateCity(cityModal.edit.id, payload);
        toast.success('City updated');
      } else {
        await admin.createCity(payload);
        toast.success('City added');
      }
      setCityModal({ open: false, edit: null, stateId: '' });
      setCitiesCache({});
      if (expandedStateId) {
        const res = await admin.locationsCities(expandedStateId);
        setCitiesCache((c) => ({ ...c, [expandedStateId]: res.data }));
      }
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteState = async (s) => {
    if (!window.confirm(`Delete state "${s.name}"? Only allowed when it has no cities.`)) return;
    try {
      await admin.deleteState(s.id);
      toast.success('State deleted');
      setCitiesCache({});
      setExpandedStateId(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const openCityUsers = async (city, stateName) => {
    setCityUsersModal({ open: true, loading: true, data: { city: { ...city, state_name: stateName } } });
    try {
      const res = await admin.locationCityUsers(city.id);
      setCityUsersModal({ open: true, loading: false, data: res.data });
    } catch (err) {
      toast.error(err.message || 'Could not load users');
      setCityUsersModal({ open: false, loading: false, data: null });
    }
  };

  const deleteCity = async (city, stateId) => {
    if (!window.confirm(`Delete city "${city.name}"?`)) return;
    try {
      await admin.deleteCity(city.id);
      toast.success('City deleted');
      const res = await admin.locationsCities(stateId);
      setCitiesCache((c) => ({ ...c, [stateId]: res.data }));
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const totals = overview?.totals || {};
  const unassigned = overview?.unassigned || {};

  return (
    <AdminDashboardLayout>
      <div className="mb-6">
        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">The Urban Physio Admin</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">States & Cities</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          View doctor and patient counts by region. Add missing states or cities so practitioners across India can register and book.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="States" value={totals.states ?? '—'} />
        <StatCard label="Cities" value={totals.cities ?? '—'} />
        <StatCard label="Doctors (total)" value={totals.doctors ?? '—'} accent="text-emerald-700" />
        <StatCard label="Patients (total)" value={totals.patients ?? '—'} accent="text-blue-700" />
      </div>

      {(Number(unassigned.doctors_no_city) > 0 || Number(unassigned.patients_no_city) > 0) && (
        <div className="card !p-4 mb-6 border-amber-200 bg-amber-50/80">
          <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
            <FaIcon icon="fa-triangle-exclamation" /> Users without city
          </p>
          <p className="text-sm text-amber-800 mt-1">
            {unassigned.doctors_no_city || 0} doctors and {unassigned.patients_no_city || 0} patients have no city set.{' '}
            <Link to="/admin/users" className="font-medium text-primary-700 hover:underline">
              Manage users →
            </Link>
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FaIcon icon="fa-magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            className="input-field pl-10"
            placeholder="Search state name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className="btn-outline text-sm shrink-0" onClick={openAddState}>
          <FaIcon icon="fa-plus" className="mr-1" /> Add state
        </button>
        <button type="button" className="btn-primary text-sm shrink-0" onClick={() => openAddCity()}>
          <FaIcon icon="fa-plus" className="mr-1" /> Add city
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <FaIcon icon="fa-map" className="text-4xl text-slate-300 mb-3" />
          <p className="font-semibold text-slate-700">No states found</p>
          <button type="button" className="btn-primary text-sm mt-4" onClick={openAddState}>
            Add first state
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const expanded = expandedStateId === s.id;
            const cityData = citiesCache[s.id];
            return (
              <div key={s.id} className="card !p-0 overflow-hidden">
                <button
                  type="button"
                  className="w-full flex flex-col sm:flex-row sm:items-center gap-3 p-4 text-left hover:bg-white/70 transition"
                  onClick={() => toggleState(s)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FaIcon
                      icon={expanded ? 'fa-chevron-down' : 'fa-chevron-right'}
                      className="text-slate-400 text-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {s.name}{' '}
                        <span className="text-slate-400 font-normal text-sm">({s.code})</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.city_count} cities in this state</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm shrink-0 pl-7 sm:pl-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                      <FaIcon icon="fa-user-doctor" className="text-xs" />
                      <strong>{s.doctor_count}</strong> doctors
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                      <FaIcon icon="fa-user" className="text-xs" />
                      <strong>{s.patient_count}</strong> patients
                    </span>
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-4 pb-4">
                    <div className="flex flex-wrap gap-2 py-3">
                      <button type="button" className="btn-outline text-xs" onClick={() => openAddCity(s.id)}>
                        Add city to {s.name}
                      </button>
                      <button type="button" className="btn-outline text-xs" onClick={() => openEditState(s)}>
                        Edit state
                      </button>
                      <button
                        type="button"
                        className="btn-outline text-xs border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => deleteState(s)}
                      >
                        Delete state
                      </button>
                    </div>

                    {citiesLoading === s.id ? (
                      <div className="h-20 animate-pulse bg-slate-200 rounded-lg" />
                    ) : !cityData?.cities?.length ? (
                      <p className="text-sm text-slate-600 py-2">No cities yet. Add one for this state.</p>
                    ) : (
                      <div className="admin-table-scroll rounded-xl border border-slate-200 overflow-hidden bg-white">
                        <table className="w-full text-sm min-w-[520px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 text-left">
                              <th className="px-4 py-2 font-medium">City</th>
                              <th className="px-4 py-2 font-medium">Doctors</th>
                              <th className="px-4 py-2 font-medium">Patients</th>
                              <th className="px-4 py-2 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cityData.cities.map((c) => (
                              <tr key={c.id} className="border-t border-slate-100 hover:bg-primary-50/30">
                                <td className="px-4 py-2.5">
                                  <button
                                    type="button"
                                    className="font-medium text-primary-700 hover:underline text-left"
                                    onClick={() => openCityUsers(c, s.name)}
                                  >
                                    {c.name}
                                  </button>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Click to view users</p>
                                </td>
                                <td className="px-4 py-2.5">
                                  <button
                                    type="button"
                                    className="text-emerald-700 font-semibold hover:underline"
                                    onClick={() => openCityUsers(c, s.name)}
                                    disabled={!Number(c.doctor_count)}
                                  >
                                    {c.doctor_count}
                                  </button>
                                </td>
                                <td className="px-4 py-2.5">
                                  <button
                                    type="button"
                                    className="text-blue-700 font-semibold hover:underline"
                                    onClick={() => openCityUsers(c, s.name)}
                                    disabled={!Number(c.patient_count)}
                                  >
                                    {c.patient_count}
                                  </button>
                                </td>
                                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    className="text-primary-600 hover:underline text-xs mr-3"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditCity(c, s.id);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="text-red-600 hover:underline text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteCity(c, s.id);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <GlassModal
        open={cityUsersModal.open}
        onClose={() => setCityUsersModal({ open: false, loading: false, data: null })}
        size="lg"
        titleId="city-users-modal"
      >
        <GlassModalHeader
          titleId="city-users-modal"
          title={
            cityUsersModal.data?.city
              ? `${cityUsersModal.data.city.name}${cityUsersModal.data.city.state_name ? `, ${cityUsersModal.data.city.state_name}` : ''}`
              : 'City users'
          }
          subtitle="Doctors and patients registered in this city"
          icon="fa-users"
          onClose={() => setCityUsersModal({ open: false, loading: false, data: null })}
        />
        <div className="p-5 md:p-6 max-h-[min(70vh,32rem)] overflow-y-auto space-y-6">
          {cityUsersModal.loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-12 bg-slate-200 rounded-lg" />
              <div className="h-24 bg-slate-200 rounded-lg" />
            </div>
          ) : (
            <>
              <section>
                <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3">
                  <FaIcon icon="fa-user-doctor" />
                  Doctors ({cityUsersModal.data?.doctors?.length || 0})
                </h3>
                {!cityUsersModal.data?.doctors?.length ? (
                  <p className="text-sm text-slate-500 rounded-xl bg-slate-50 p-4 border border-slate-100">No doctors in this city yet.</p>
                ) : (
                  <div className="rounded-xl border border-emerald-100 overflow-hidden divide-y divide-emerald-50">
                    {cityUsersModal.data.doctors.map((d) => (
                      <div key={d.doctor_id} className="p-3 bg-white/80 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            Dr. {d.first_name} {d.last_name}
                            {Number(d.is_verified) === 1 ? (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Verified</span>
                            ) : (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Pending</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{d.specialization || '—'} · {d.email}</p>
                          {d.phone && <p className="text-xs text-slate-500">{d.phone}</p>}
                        </div>
                        <Link
                          to={`/admin/users?role=doctor&search=${encodeURIComponent(d.email)}`}
                          className="text-xs font-semibold text-primary-600 hover:underline shrink-0"
                        >
                          Open profile →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section>
                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-3">
                  <FaIcon icon="fa-user" />
                  Patients ({cityUsersModal.data?.patients?.length || 0})
                </h3>
                {!cityUsersModal.data?.patients?.length ? (
                  <p className="text-sm text-slate-500 rounded-xl bg-slate-50 p-4 border border-slate-100">No patients in this city yet.</p>
                ) : (
                  <div className="rounded-xl border border-blue-100 overflow-hidden divide-y divide-blue-50">
                    {cityUsersModal.data.patients.map((p) => (
                      <div key={p.patient_id} className="p-3 bg-white/80 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            {p.first_name} {p.last_name}
                            {!p.is_active && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">Inactive</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{p.email}</p>
                          {p.phone && <p className="text-xs text-slate-500">{p.phone}</p>}
                        </div>
                        <Link
                          to={`/admin/users?role=patient&search=${encodeURIComponent(p.email)}`}
                          className="text-xs font-semibold text-primary-600 hover:underline shrink-0"
                        >
                          Open profile →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </GlassModal>

      <GlassModal open={stateModal.open} onClose={() => setStateModal({ open: false, edit: null })} size="md" titleId="state-modal">
        <GlassModalHeader
          titleId="state-modal"
          title={stateModal.edit ? 'Edit state' : 'Add state'}
          subtitle="Use a short unique code (e.g. MH, DL, RJ)."
          icon="fa-map"
          onClose={() => setStateModal({ open: false, edit: null })}
        />
        <form onSubmit={saveState} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State name</label>
            <input
              className="input-field"
              required
              value={stateForm.name}
              onChange={(e) => setStateForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Rajasthan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State code</label>
            <input
              className="input-field uppercase"
              required
              maxLength={10}
              value={stateForm.code}
              onChange={(e) => setStateForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. RJ"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" className="btn-outline text-sm" onClick={() => setStateModal({ open: false, edit: null })}>
              Cancel
            </button>
            <button type="submit" className="btn-primary text-sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save state'}
            </button>
          </div>
        </form>
      </GlassModal>

      <GlassModal open={cityModal.open} onClose={() => setCityModal({ open: false, edit: null, stateId: '' })} size="md" titleId="city-modal">
        <GlassModalHeader
          titleId="city-modal"
          title={cityModal.edit ? 'Edit city' : 'Add city'}
          subtitle="Cities appear in doctor profiles and clinic addresses."
          icon="fa-building"
          onClose={() => setCityModal({ open: false, edit: null, stateId: '' })}
        />
        <form onSubmit={saveCity} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
            <select
              className="input-field"
              required
              value={cityForm.state_id}
              onChange={(e) => setCityForm((f) => ({ ...f, state_id: e.target.value }))}
            >
              <option value="">Select state</option>
              {states.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City name</label>
            <input
              className="input-field"
              required
              value={cityForm.name}
              onChange={(e) => setCityForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Jaipur"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Latitude (optional)</label>
              <input
                type="number"
                step="any"
                className="input-field"
                value={cityForm.latitude}
                onChange={(e) => setCityForm((f) => ({ ...f, latitude: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Longitude (optional)</label>
              <input
                type="number"
                step="any"
                className="input-field"
                value={cityForm.longitude}
                onChange={(e) => setCityForm((f) => ({ ...f, longitude: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" className="btn-outline text-sm" onClick={() => setCityModal({ open: false, edit: null, stateId: '' })}>
              Cancel
            </button>
            <button type="submit" className="btn-primary text-sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save city'}
            </button>
          </div>
        </form>
      </GlassModal>
    </AdminDashboardLayout>
  );
}
