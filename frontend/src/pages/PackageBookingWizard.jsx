import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FaIcon from '../components/FaIcon';
import { doctors, packageBookings, treatmentPackages } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  CONSULTATION_OPTIONS,
  formatPackagePrice,
  perSessionPrice,
} from '../utils/packageHelpers';
import { openPackageRazorpayCheckout, handlePackagePaymentError } from '../utils/packageCheckout';

const STEPS = ['Package', 'Physiotherapist', 'Program', 'Pay'];

const FALLBACK_PACKAGES = {
  '10-day-recovery': { id: 1, slug: '10-day-recovery', name: '10-Day Recovery Package', duration_days: 10, total_sessions: 10, price: 4999 },
  '15-day-rehab': { id: 2, slug: '15-day-rehab', name: '15-Day Rehab Package', duration_days: 15, total_sessions: 15, price: 7499 },
  '30-day-complete-care': { id: 3, slug: '30-day-complete-care', name: '30-Day Complete Care', duration_days: 30, total_sessions: 30, price: 12999 },
};

export default function PackageBookingWizard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [pkg, setPkg] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [form, setForm] = useState({
    doctor_id: '',
    start_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    consultation_type: 'any',
    pain_type: '',
    notes: '',
  });

  const patch = (updates) => setForm((f) => ({ ...f, ...updates }));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      treatmentPackages.get(slug).then((res) => res.data ?? res).catch(() => FALLBACK_PACKAGES[slug] || null),
      doctors.list().then((res) => res.data ?? res ?? []).catch(() => []),
    ])
      .then(([p, docs]) => {
        if (!p) {
          toast.error('Package not found');
          navigate('/packages', { replace: true });
          return;
        }
        setPkg(p);
        setDoctorList(Array.isArray(docs) ? docs : []);
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const selectedDoctor = useMemo(
    () => doctorList.find((d) => String(d.id) === String(form.doctor_id)),
    [doctorList, form.doctor_id]
  );

  const canNext = useCallback(() => {
    if (step === 1) return !!form.doctor_id;
    if (step === 2) return !!form.start_date;
    return true;
  }, [step, form]);

  const next = () => {
    if (step === 1 && !form.doctor_id) {
      toast.error('Please select a physiotherapist');
      return;
    }
    if (step === 2 && !form.start_date) {
      toast.error('Please choose a start date');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const pay = async () => {
    if (!pkg || !form.doctor_id) return;
    setPaying(true);
    try {
      const orderRes = await packageBookings.createOrder({
        package_id: pkg.id,
        doctor_id: parseInt(form.doctor_id, 10),
        start_date: form.start_date,
        consultation_type: form.consultation_type,
        pain_type: form.pain_type,
        notes: form.notes,
      });
      await openPackageRazorpayCheckout(orderRes);
      toast.success('Package booked! Track progress in My Packages.');
      navigate('/patient/packages', { replace: true });
    } catch (err) {
      handlePackagePaymentError(err);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 text-sm mt-4">Loading package…</p>
        </div>
      </div>
    );
  }

  if (!pkg) return null;

  const perSession = perSessionPrice(pkg.price, pkg.total_sessions);

  return (
    <div className="page-enter min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-slate-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <Link to="/packages" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-orange-700 mb-6">
          <FaIcon icon="fa-arrow-left" /> Back to packages
        </Link>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-2 mb-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    i <= step ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {i < step ? <FaIcon icon="fa-check" /> : i + 1}
                </div>
                <span className={`text-[10px] sm:text-xs font-medium truncate ${i <= step ? 'text-orange-700' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="glass-strong rounded-2xl md:rounded-3xl p-5 sm:p-8">
          {/* Step 0: Package */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">{pkg.duration_days}-Day Program</span>
                <h1 className="text-2xl font-bold text-slate-800 mt-1">{pkg.name}</h1>
                <p className="text-sm text-slate-600 mt-2">{pkg.short_description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">{pkg.total_sessions}</p>
                  <p className="text-[10px] uppercase text-slate-500 font-semibold">Sessions</p>
                </div>
                <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">{pkg.duration_days}</p>
                  <p className="text-[10px] uppercase text-slate-500 font-semibold">Days</p>
                </div>
                <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 text-center">
                  <p className="text-lg font-bold text-orange-700">{formatPackagePrice(perSession)}</p>
                  <p className="text-[10px] uppercase text-slate-500 font-semibold">Per session</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-2xl font-bold text-slate-800">{formatPackagePrice(pkg.price)}</p>
                <p className="text-xs text-slate-500 mt-1">One-time package fee · secure Razorpay checkout</p>
              </div>
            </div>
          )}

          {/* Step 1: Doctor */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Choose your physiotherapist</h2>
              <p className="text-sm text-slate-600">Your assigned doctor will guide all {pkg.total_sessions} sessions.</p>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {doctorList.length === 0 ? (
                  <p className="text-slate-500 text-sm">No doctors available right now.</p>
                ) : (
                  doctorList.map((d) => {
                    const selected = String(form.doctor_id) === String(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => patch({ doctor_id: String(d.id) })}
                        className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3 ${
                          selected ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-slate-200 hover:border-orange-200'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {d.first_name?.[0]}{d.last_name?.[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800">Dr. {d.first_name} {d.last_name}</p>
                          <p className="text-xs text-slate-500 truncate">{d.specialization || 'Physiotherapist'}</p>
                          {d.rating_avg > 0 && (
                            <p className="text-xs text-amber-600 mt-0.5">
                              <FaIcon icon="fa-star" className="mr-0.5" />
                              {Number(d.rating_avg).toFixed(1)} ({d.rating_count || 0})
                            </p>
                          )}
                        </div>
                        {selected && <FaIcon icon="fa-circle-check" className="text-orange-600 text-lg shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Step 2: Program details */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800">Program details</h2>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Start date *</label>
                <input
                  type="date"
                  className="input-field w-full"
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.start_date}
                  onChange={(e) => patch({ start_date: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Program ends {pkg.duration_days} days from start ({pkg.total_sessions} sessions scheduled)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Preferred session type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CONSULTATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => patch({ consultation_type: opt.id })}
                      className={`p-3 rounded-xl border text-left transition ${
                        form.consultation_type === opt.id
                          ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-200'
                          : 'border-slate-200 hover:border-orange-200'
                      }`}
                    >
                      <FaIcon icon={opt.icon} className={`mb-1 ${form.consultation_type === opt.id ? 'text-orange-600' : 'text-slate-400'}`} />
                      <p className="font-semibold text-sm text-slate-800">{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Primary concern (optional)</label>
                <select className="input-field w-full" value={form.pain_type} onChange={(e) => patch({ pain_type: e.target.value })}>
                  <option value="">Select if applicable</option>
                  {['Back Pain', 'Neck Pain', 'Knee Pain', 'Shoulder Pain', 'Sports Injury', 'Post-Surgery', 'Other'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Notes for your physiotherapist</label>
                <textarea
                  className="input-field w-full min-h-[80px]"
                  placeholder="Share injury history, goals, or preferences…"
                  value={form.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Pay */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-800">Review & pay</h2>

              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                <div className="p-4 flex justify-between gap-3">
                  <span className="text-sm text-slate-500">Package</span>
                  <span className="text-sm font-semibold text-slate-800 text-right">{pkg.name}</span>
                </div>
                <div className="p-4 flex justify-between gap-3">
                  <span className="text-sm text-slate-500">Physiotherapist</span>
                  <span className="text-sm font-semibold text-slate-800 text-right">
                    {selectedDoctor ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}` : '—'}
                  </span>
                </div>
                <div className="p-4 flex justify-between gap-3">
                  <span className="text-sm text-slate-500">Start date</span>
                  <span className="text-sm font-semibold text-slate-800">{form.start_date}</span>
                </div>
                <div className="p-4 flex justify-between gap-3">
                  <span className="text-sm text-slate-500">Session type</span>
                  <span className="text-sm font-semibold text-slate-800 capitalize">{form.consultation_type.replace('_', ' ')}</span>
                </div>
                {form.pain_type && (
                  <div className="p-4 flex justify-between gap-3">
                    <span className="text-sm text-slate-500">Concern</span>
                    <span className="text-sm font-semibold text-slate-800">{form.pain_type}</span>
                  </div>
                )}
                <div className="p-4 flex justify-between gap-3 bg-orange-50/80">
                  <span className="text-sm font-semibold text-slate-700">Total</span>
                  <span className="text-lg font-bold text-orange-700">{formatPackagePrice(pkg.price)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 flex items-start gap-2">
                <FaIcon icon="fa-lock" className="text-emerald-600 mt-0.5 shrink-0" />
                Secure payment via Razorpay. After payment, your package appears in{' '}
                <strong>My Packages</strong> with session tracking for {user?.first_name || 'you'}.
              </p>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100">
            {step > 0 ? (
              <button type="button" onClick={back} disabled={paying} className="btn-outline w-full sm:w-auto sm:min-w-[120px]">
                Back
              </button>
            ) : (
              <div className="hidden sm:block sm:flex-1" />
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} disabled={!canNext()} className="btn-primary w-full sm:w-auto sm:min-w-[140px] sm:ml-auto">
                Continue
              </button>
            ) : (
              <button type="button" onClick={pay} disabled={paying} className="btn-primary w-full sm:w-auto sm:min-w-[180px] sm:ml-auto inline-flex items-center justify-center gap-2">
                {paying ? 'Processing…' : (
                  <>
                    Pay {formatPackagePrice(pkg.price)}
                    <FaIcon icon="fa-credit-card" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
