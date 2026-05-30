import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import FaIcon from '../../components/FaIcon';
import { doctors } from '../../services/api';
import { DOCTOR_NAV } from '../../constants/doctorNav';
import toast from 'react-hot-toast';

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export default function DoctorEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctors
      .earnings()
      .then((res) => setData(res.data || {}))
      .catch((e) => toast.error(e.message || 'Could not load earnings'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Lifetime earnings',
      value: money(data?.total_earnings),
      sub: 'Completed sessions only',
      icon: 'fa-sack-dollar',
      gradient: 'from-emerald-500/15 to-teal-500/10',
      iconTone: 'text-emerald-600 bg-emerald-100',
    },
    {
      label: 'This month',
      value: money(data?.monthly_earnings),
      sub: 'Paid in current month',
      icon: 'fa-calendar-check',
      gradient: 'from-primary-500/15 to-orange-500/10',
      iconTone: 'text-primary-600 bg-primary-100',
    },
    {
      label: 'Completed sessions',
      value: data?.total_appointments ?? 0,
      sub: 'All-time count',
      icon: 'fa-circle-check',
      gradient: 'from-sky-500/15 to-blue-500/10',
      iconTone: 'text-sky-600 bg-sky-100',
    },
  ];

  return (
    <DashboardLayout links={DOCTOR_NAV} variant="doctor">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Earnings</h1>
          <p className="text-slate-600 text-sm mt-1">Revenue from completed and paid sessions.</p>
        </div>
        <Link to="/doctor/appointments" className="btn-outline text-sm inline-flex items-center gap-2 shrink-0">
          <FaIcon icon="fa-calendar-check" />
          View appointments
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {cards.map((c) => (
              <div
                key={c.label}
                className={`glass-card !p-5 bg-gradient-to-br ${c.gradient} border border-white/80`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.iconTone}`}>
                    <FaIcon icon={c.icon} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-0.5">{c.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card !p-5 md:!p-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              <FaIcon icon="fa-circle-info" className="text-primary-600" />
              How earnings are calculated
            </h2>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li>Lifetime total includes completed appointments with recorded payments.</li>
              <li>Monthly figure reflects paid sessions in the current calendar month.</li>
              <li>Pending or unpaid bookings are not included until payment is confirmed.</li>
            </ul>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <Link to="/doctor/appointments?status=completed" className="btn-primary text-sm inline-flex items-center justify-center gap-2">
                <FaIcon icon="fa-list-check" />
                Completed appointments
              </Link>
              <Link to="/doctor/profile" className="btn-outline text-sm inline-flex items-center justify-center gap-2">
                <FaIcon icon="fa-indian-rupee-sign" />
                Update fee settings
              </Link>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
