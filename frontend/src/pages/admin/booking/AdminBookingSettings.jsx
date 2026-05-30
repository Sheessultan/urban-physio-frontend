import { useCallback, useEffect, useState } from 'react';
import AdminDashboardLayout from '../../../layouts/AdminDashboardLayout';
import FaIcon from '../../../components/FaIcon';
import { admin } from '../../../services/api';
import toast from 'react-hot-toast';
import EditableList from '../../../components/admin/booking/EditableList';
import SessionTypesManager from '../../../components/admin/booking/SessionTypesManager';

const emptySettings = () => ({
  slot_duration_minutes: 30,
  fallback_slot_times: '09:00,10:00,11:00,14:00,15:00,16:00,17:00',
});

export default function AdminBookingSettings() {
  const [tab, setTab] = useState('pain');
  const [settings, setSettings] = useState(emptySettings);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const loadSettings = useCallback(() => {
    setLoadingSettings(true);
    admin
      .bookingSettings()
      .then((res) => setSettings({ ...emptySettings(), ...(res?.data ?? res) }))
      .catch((e) => toast.error(e.message || 'Could not load booking settings'))
      .finally(() => setLoadingSettings(false));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await admin.updateBookingSettings({
        slot_duration_minutes: Number(settings.slot_duration_minutes) || 30,
        fallback_slot_times: settings.fallback_slot_times,
      });
      toast.success('Booking settings saved');
      loadSettings();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSavingSettings(false);
    }
  };

  const TABS = [
    { id: 'pain', label: 'Pain types', icon: 'fa-heart-pulse' },
    { id: 'conditions', label: 'Home conditions', icon: 'fa-bed' },
    { id: 'session', label: 'Session types', icon: 'fa-clock' },
    { id: 'slots', label: 'Slot settings', icon: 'fa-calendar-days' },
  ];

  return (
    <AdminDashboardLayout>
      <div className="max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Booking settings</h1>
        <p className="text-slate-600 text-sm mb-6">
          Control what patients can select in the Book Appointment form.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                tab === t.id
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white/50 text-slate-700 border-white/70 hover:bg-white/70'
              }`}
            >
              <FaIcon icon={t.icon} className={tab === t.id ? 'text-white' : 'text-primary-600'} />{' '}
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {tab === 'pain' && (
            <EditableList
              title="Pain types"
              subtitle="Step 2: Problem / Pain Type - dropdown options."
              icon="fa-heart-pulse"
              load={admin.bookingPainTypes}
              create={admin.createBookingPainType}
              update={admin.updateBookingPainType}
              remove={admin.deleteBookingPainType}
            />
          )}

          {tab === 'conditions' && (
            <EditableList
              title="Home visit patient conditions"
              subtitle="Home visit - Patient condition dropdown options."
              icon="fa-bed"
              load={admin.bookingHomeConditions}
              create={admin.createBookingHomeCondition}
              update={admin.updateBookingHomeCondition}
              remove={admin.deleteBookingHomeCondition}
            />
          )}

          {tab === 'session' && <SessionTypesManager />}

          {tab === 'slots' && (
            <div className="glass-card !p-6 md:!p-8 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FaIcon icon="fa-calendar-days" className="text-primary-600" />
                  Slot settings
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  This controls slot generation when availability is set.
                </p>
              </div>

              {loadingSettings ? (
                <div className="h-28 animate-pulse bg-white/40 rounded-2xl" />
              ) : (
                <form onSubmit={saveSettings} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Default slot duration (minutes)</label>
                      <input
                        type="number"
                        min={5}
                        max={180}
                        className="input-field mt-1"
                        value={settings.slot_duration_minutes}
                        onChange={(e) => setSettings((s) => ({ ...s, slot_duration_minutes: e.target.value }))}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Used when a doctor availability row has no slot duration.
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Fallback slot times (comma separated)</label>
                      <input
                        className="input-field mt-1"
                        value={settings.fallback_slot_times}
                        onChange={(e) => setSettings((s) => ({ ...s, fallback_slot_times: e.target.value }))}
                        placeholder="09:00,10:00,11:00,14:00"
                      />
                      <p className="text-xs text-slate-500 mt-1">Used only when no availability is configured.</p>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={savingSettings}>
                    {savingSettings ? 'Saving...' : 'Save slot settings'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
