import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import FaIcon from '../../components/FaIcon';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function fillLast14Days(rows) {
  const map = Object.fromEntries((rows || []).map((r) => [String(r.day).slice(0, 10), Number(r.count || 0)]));
  const labels = [];
  const data = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    labels.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    data.push(map[iso] ?? 0);
  }
  return { labels, data };
}

const TYPE_LABELS = { online: 'Online', home_visit: 'Home visit', clinic: 'Clinic' };
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-900',
  doctor_assigned: 'bg-blue-100 text-blue-900',
  en_route: 'bg-indigo-100 text-indigo-900',
  arrived: 'bg-purple-100 text-purple-900',
  in_consultation: 'bg-orange-100 text-orange-900',
  completed: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function AdminEmergency() {
  const [dash, setDash] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emergencyFee, setEmergencyFee] = useState('');
  const [platformFee, setPlatformFee] = useState('');
  const [assignDoctorId, setAssignDoctorId] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, rRes] = await Promise.all([admin.emergencyDashboard(), admin.emergencyRequests()]);
      setDash(dRes.data);
      setRequests(rRes.data || []);
      setEmergencyFee(String(dRes.data?.settings?.emergency_fee ?? ''));
      setPlatformFee(String(dRes.data?.settings?.platform_fee ?? ''));
    } catch (e) {
      toast.error(e.message || 'Failed to load emergency data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dailyChart = useMemo(() => {
    const { labels, data } = fillLast14Days(dash?.daily_chart);
    return {
      labels,
      datasets: [{ label: 'Requests', data, borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.15)', fill: true, tension: 0.35 }],
    };
  }, [dash]);

  const typeChart = useMemo(() => {
    const rows = dash?.by_type || [];
    return {
      labels: rows.map((r) => TYPE_LABELS[r.emergency_type] || r.emergency_type),
      datasets: [{ data: rows.map((r) => r.count), backgroundColor: ['#f97316', '#dc2626', '#059669'] }],
    };
  }, [dash]);

  const saveSettings = async () => {
    try {
      await admin.updateEmergencySettings({
        emergency_fee: Number(emergencyFee),
        platform_fee: Number(platformFee),
      });
      toast.success('Emergency fees updated');
      load();
    } catch (e) {
      toast.error(e.message || 'Could not save settings');
    }
  };

  const handleAssign = async (id) => {
    const doctorId = Number(assignDoctorId[id]);
    if (!doctorId) {
      toast.error('Enter a doctor ID');
      return;
    }
    try {
      await admin.emergencyAssign(id, doctorId);
      toast.success('Doctor assigned');
      load();
    } catch (e) {
      toast.error(e.message || 'Assign failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this emergency request?')) return;
    try {
      await admin.emergencyCancel(id);
      toast.success('Emergency cancelled');
      load();
    } catch (e) {
      toast.error(e.message || 'Cancel failed');
    }
  };

  if (loading && !dash) {
    return (
      <AdminDashboardLayout>
        <div className="h-64 animate-pulse bg-slate-100 rounded-2xl" />
      </AdminDashboardLayout>
    );
  }

  const stats = [
    { label: 'Total requests', value: dash?.total_requests ?? 0, icon: 'fa-bolt', color: 'text-red-600 bg-red-50' },
    { label: 'Active emergencies', value: dash?.active_emergencies ?? 0, icon: 'fa-heart-pulse', color: 'text-orange-600 bg-orange-50' },
    { label: 'Completed', value: dash?.completed_emergencies ?? 0, icon: 'fa-circle-check', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Emergency revenue', value: money(dash?.emergency_revenue), icon: 'fa-indian-rupee-sign', color: 'text-amber-600 bg-amber-50' },
    { label: 'Avg response', value: `${dash?.avg_response_minutes ?? '—'} min`, icon: 'fa-clock', color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Emergency Management</h1>
          <p className="text-slate-600 text-sm mt-1">Monitor urgent bookings, revenue, and response times</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="glass-card !p-4">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                <FaIcon icon={s.icon} />
              </div>
              <p className="text-lg font-bold text-slate-900 mt-2">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass-card !p-4">
            <h3 className="font-bold text-slate-900 mb-3">Daily emergency requests</h3>
            <Line data={dailyChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
          </div>
          <div className="glass-card !p-4">
            <h3 className="font-bold text-slate-900 mb-3">By service type</h3>
            {(dash?.by_type || []).length ? (
              <Doughnut data={typeChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            ) : (
              <p className="text-sm text-slate-500 py-8 text-center">No data yet</p>
            )}
          </div>
        </div>

        <div className="glass-card !p-5">
          <h3 className="font-bold text-slate-900 mb-4">Fee settings</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Emergency fee (₹)</span>
              <input className="input-field w-32" type="number" min={0} value={emergencyFee} onChange={(e) => setEmergencyFee(e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Platform fee (₹)</span>
              <input className="input-field w-32" type="number" min={0} value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} />
            </label>
            <button type="button" className="btn-primary !py-2" onClick={saveSettings}>Save fees</button>
          </div>
        </div>

        <div className="glass-card !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">All emergency requests</h3>
            <button type="button" className="text-sm text-orange-600 font-medium" onClick={load}>
              <FaIcon icon="fa-rotate-right" /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No emergency requests</td></tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-xs">{r.booking_id}</td>
                      <td className="px-4 py-3">{r.patient_full_name || `${r.patient_first_name} ${r.patient_last_name}`}</td>
                      <td className="px-4 py-3">Dr. {r.doctor_first_name} {r.doctor_last_name}</td>
                      <td className="px-4 py-3 capitalize">{TYPE_LABELS[r.emergency_type] || r.emergency_type}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.emergency_status] || STATUS_COLORS.pending}`}>
                          {r.emergency_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{money(r.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 min-w-[140px]">
                          <div className="flex gap-1">
                            <input
                              className="input-field !py-1 !text-xs w-20"
                              placeholder="Dr ID"
                              value={assignDoctorId[r.id] || ''}
                              onChange={(e) => setAssignDoctorId((m) => ({ ...m, [r.id]: e.target.value }))}
                            />
                            <button type="button" className="text-xs text-blue-600 font-medium" onClick={() => handleAssign(r.id)}>Assign</button>
                          </div>
                          {r.emergency_status !== 'cancelled' && r.emergency_status !== 'completed' && (
                            <button type="button" className="text-xs text-red-600 font-medium text-left" onClick={() => handleCancel(r.id)}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
