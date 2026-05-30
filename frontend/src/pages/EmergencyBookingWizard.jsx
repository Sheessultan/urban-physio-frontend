import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FaIcon from '../components/FaIcon';
import DoctorAvatar from '../components/DoctorAvatar';
import LocationSelector from '../components/LocationSelector';
import { emergency, payments } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import toast from 'react-hot-toast';
import { openRazorpayCheckout, handlePaymentError } from '../utils/razorpayCheckout';

const STEPS = ['Emergency Type', 'Your Details', 'Severity', 'Choose Doctor', 'Pricing', 'Payment'];

const EMERGENCY_TYPES = [
  { id: 'online', label: 'Instant Online Consultation', icon: 'fa-video', desc: 'Video call with a physio in minutes' },
  { id: 'home_visit', label: 'Urgent Home Visit', icon: 'fa-house-medical', desc: 'Physiotherapist dispatched to your location' },
  { id: 'clinic', label: 'Nearest Open Clinic', icon: 'fa-hospital', desc: 'Walk-in or instant slot at partner clinic' },
];

const SEVERITY = [
  { id: 'mild', label: 'Mild', desc: 'Uncomfortable but manageable', color: 'border-emerald-400 bg-emerald-50 text-emerald-800', ring: 'ring-emerald-400' },
  { id: 'moderate', label: 'Moderate', desc: 'Limits daily activities', color: 'border-amber-400 bg-amber-50 text-amber-900', ring: 'ring-amber-400' },
  { id: 'severe', label: 'Severe', desc: 'Urgent — needs immediate attention', color: 'border-red-500 bg-red-50 text-red-800', ring: 'ring-red-500' },
];

const BUCKET_LABEL = { now: 'Available now', '15min': '~15 min', '30min': '~30 min' };

const initialForm = () => ({
  emergency_type: '',
  full_name: '',
  mobile: '',
  email: '',
  pain_area: '',
  pain_description: '',
  emergency_level: '',
  doctor_id: '',
  clinic_id: '',
  latitude: null,
  longitude: null,
  full_address: '',
});

export default function EmergencyBookingWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coords, city, locationSource, requestGeolocation, setShowSelector } = useLocation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [settings, setSettings] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState(null);
  const [trackStatus, setTrackStatus] = useState(null);

  useEffect(() => {
    if (!confirmedAppt?.id || step !== 5) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const res = await emergency.status(confirmedAppt.id);
        if (active) setTrackStatus(res.data?.appointment || null);
      } catch {
        /* ignore poll errors */
      }
    };
    poll();
    const t = setInterval(poll, 15000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [confirmedAppt?.id, step]);

  const patch = (fields) => setForm((f) => ({ ...f, ...fields }));

  const resolvedLocation = useMemo(() => {
    if (locationSource === 'city' && city?.id) {
      return {
        lat: null,
        lng: null,
        hasLocation: true,
        label: city.name,
        cityId: city.id,
        mode: 'city',
      };
    }
    if (locationSource === 'gps' && (coords?.lat || form.latitude)) {
      const lat = form.latitude ?? coords?.lat;
      const lng = form.longitude ?? coords?.lng;
      return {
        lat,
        lng,
        hasLocation: Boolean(lat && lng),
        label: city?.name ? `Near ${city.name} (GPS)` : 'Your current location',
        cityId: city?.id,
        mode: 'gps',
      };
    }
    if (city?.id) {
      return {
        lat: null,
        lng: null,
        hasLocation: true,
        label: city.name,
        cityId: city.id,
        mode: 'city',
      };
    }
    return { lat: null, lng: null, hasLocation: false, label: null, cityId: null, mode: 'auto' };
  }, [form.latitude, form.longitude, coords, city, locationSource]);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type && ['online', 'home_visit', 'clinic'].includes(type)) {
      patch({ emergency_type: type });
    }
    emergency.settings().then((res) => setSettings(res.data)).catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      patch({
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        mobile: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (locationSource === 'gps' && coords?.lat) {
      patch({ latitude: coords.lat, longitude: coords.lng });
    } else if (locationSource === 'city') {
      patch({ latitude: null, longitude: null });
    }
  }, [coords, city, locationSource]);

  const loadDoctors = useCallback(async () => {
    if (!form.emergency_type) return;
    if (!resolvedLocation.hasLocation) {
      setDoctors([]);
      setClinics([]);
      return;
    }
    setLoadingDoctors(true);
    try {
      const params = {
        emergency_type: form.emergency_type,
        lat: resolvedLocation.lat,
        lng: resolvedLocation.lng,
        city_id: resolvedLocation.cityId,
        location_mode: resolvedLocation.mode,
      };
      if (form.emergency_type === 'clinic') {
        const cRes = await emergency.openClinics(params);
        setClinics(cRes.data || []);
      }
      const res = await emergency.matchDoctors(params);
      setDoctors(res.data?.doctors || []);
    } catch (e) {
      toast.error(e.message || 'Could not find available doctors');
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  }, [form.emergency_type, resolvedLocation]);

  useEffect(() => {
    if (step === 3) loadDoctors();
  }, [step, loadDoctors]);

  const fees = useMemo(() => {
    if (selectedDoctor?.fees) return selectedDoctor.fees;
    return null;
  }, [selectedDoctor]);

  const canNext = () => {
    if (step === 0) return !!form.emergency_type;
    if (step === 1) {
      const base = form.full_name.trim() && form.mobile.trim() && form.email.trim() && form.pain_area && form.pain_description.trim().length >= 10;
      if (form.emergency_type === 'home_visit') return base && form.full_address.trim().length >= 5;
      return base;
    }
    if (step === 2) return !!form.emergency_level;
    if (step === 3) return !!form.doctor_id;
    return true;
  };

  const handleBookAndPay = async () => {
    if (!user) {
      toast.error('Please log in to book emergency care');
      navigate('/login?redirect=/emergency/book');
      return;
    }
    setSubmitting(true);
    try {
      const res = await emergency.book({
        ...form,
        doctor_id: Number(form.doctor_id),
        clinic_id: form.clinic_id ? Number(form.clinic_id) : null,
        eta_minutes: selectedDoctor?.estimated_response_minutes ?? 15,
      });
      const appt = res.data;
      const orderRes = await payments.createOrder(appt.id);
      const verified = await openRazorpayCheckout(orderRes);
      setConfirmedAppt(verified.data?.appointment || appt);
      toast.success('Emergency booking confirmed!');
      setStep(5);
    } catch (e) {
      handlePaymentError(e);
    } finally {
      setSubmitting(false);
    }
  };

  const painAreas = settings?.pain_areas || ['Neck', 'Shoulder', 'Upper Back', 'Lower Back', 'Hip', 'Knee', 'Ankle'];

  return (
    <div className="min-h-screen flex flex-col page-enter">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:py-10">
        <div className="mb-6">
          <Link to="/" className="text-sm text-slate-500 hover:text-orange-600 inline-flex items-center gap-1">
            <FaIcon icon="fa-arrow-left" /> Back to home
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <FaIcon icon="fa-truck-medical" />
            </span>
            Emergency Booking
          </h1>
          <p className="text-slate-600 text-sm mt-1">Fast-track urgent physiotherapy care</p>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`shrink-0 flex-1 min-w-[4.5rem] text-center text-[10px] sm:text-xs font-medium py-2 px-1 rounded-lg transition ${
                i === step ? 'bg-red-600 text-white' : i < step ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {i + 1}. {label.split(' ')[0]}
            </div>
          ))}
        </div>

        <div className="glass-card !p-5 sm:!p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              {step === 0 && (
                <div className="space-y-3">
                  <h2 className="font-bold text-lg text-slate-900">Select emergency type</h2>
                  {EMERGENCY_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => patch({ emergency_type: t.id })}
                      className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition ${
                        form.emergency_type === t.id ? 'border-red-500 bg-red-50/80 ring-2 ring-red-200' : 'border-slate-200 hover:border-red-200'
                      }`}
                    >
                      <FaIcon icon={t.icon} className="text-xl text-red-600 w-8" />
                      <span>
                        <span className="block font-semibold text-slate-900">{t.label}</span>
                        <span className="text-xs text-slate-600">{t.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-bold text-lg text-slate-900">Quick assessment</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input className="input-field" placeholder="Full name *" value={form.full_name} onChange={(e) => patch({ full_name: e.target.value })} />
                    <input className="input-field" placeholder="Mobile *" value={form.mobile} onChange={(e) => patch({ mobile: e.target.value })} />
                    <input className="input-field sm:col-span-2" type="email" placeholder="Email *" value={form.email} onChange={(e) => patch({ email: e.target.value })} />
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <button type="button" onClick={requestGeolocation} className="btn-outline text-xs !py-2 !px-3">
                      <FaIcon icon="fa-location-crosshairs" /> Detect location
                    </button>
                    <button type="button" onClick={() => setShowSelector(true)} className="btn-outline text-xs !py-2 !px-3">
                      <FaIcon icon="fa-map-location-dot" /> {city?.name || 'Select city'}
                    </button>
                    {resolvedLocation.label && (
                      <span className="text-xs text-emerald-700">
                        <FaIcon icon="fa-circle-check" /> {resolvedLocation.label}
                        {locationSource === 'city' && ' · GPS off'}
                      </span>
                    )}
                  </div>
                  {form.emergency_type === 'home_visit' && (
                    <input className="input-field" placeholder="Full address *" value={form.full_address} onChange={(e) => patch({ full_address: e.target.value })} />
                  )}
                  <select className="input-field" value={form.pain_area} onChange={(e) => patch({ pain_area: e.target.value })}>
                    <option value="">Pain area *</option>
                    {painAreas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <textarea className="input-field min-h-[90px]" placeholder="Describe your pain & urgency (min 10 chars) *" value={form.pain_description} onChange={(e) => patch({ pain_description: e.target.value })} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <h2 className="font-bold text-lg text-slate-900">Pain severity</h2>
                  {SEVERITY.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => patch({ emergency_level: s.id })}
                      className={`w-full rounded-xl border-2 p-4 text-left transition ${s.color} ${
                        form.emergency_level === s.id ? `ring-2 ${s.ring}` : ''
                      }`}
                    >
                      <span className="font-bold">{s.label}</span>
                      <span className="block text-xs mt-1 opacity-80">{s.desc}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-bold text-lg text-slate-900">Nearest available physiotherapists</h2>
                      {resolvedLocation.label ? (
                        <p className="text-xs text-slate-500 mt-1">
                          Sorted by distance from {resolvedLocation.label}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-700 mt-1">Set your location to see nearby doctors</p>
                      )}
                    </div>
                    <button type="button" onClick={() => setShowSelector(true)} className="text-xs text-orange-600 font-semibold shrink-0">
                      Change location
                    </button>
                  </div>
                  {!resolvedLocation.hasLocation ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-3">
                      <p>Please detect your location or select your city to find the nearest emergency physios.</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={requestGeolocation} className="btn-outline text-xs !py-2">
                          Detect location
                        </button>
                        <button type="button" onClick={() => setShowSelector(true)} className="btn-primary text-xs !py-2">
                          Select city
                        </button>
                      </div>
                    </div>
                  ) : loadingDoctors ? (
                    <div className="h-32 animate-pulse bg-slate-100 rounded-xl" />
                  ) : doctors.length === 0 ? (
                    <p className="text-slate-600 text-sm">No emergency doctors near your location right now. Try changing location or check back shortly.</p>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {doctors.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            patch({ doctor_id: String(d.id) });
                            setSelectedDoctor(d);
                          }}
                          className={`w-full flex gap-3 rounded-xl border p-3 text-left transition ${
                            String(form.doctor_id) === String(d.id) ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-slate-200 hover:border-red-200'
                          }`}
                        >
                          <DoctorAvatar doctor={d} className="h-14 w-14 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900">Dr. {d.first_name} {d.last_name}</p>
                            <p className="text-xs text-slate-600">{d.specialization} · {d.experience_years}y exp</p>
                            <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                              {d.distance_km != null && (
                                <span className="font-bold text-orange-600">
                                  <FaIcon icon="fa-location-dot" /> {d.distance_km} km away
                                </span>
                              )}
                              <span className="text-amber-600"><FaIcon icon="fa-star" /> {d.rating_avg || '—'}</span>
                              <span className="text-red-600 font-semibold">{BUCKET_LABEL[d.availability_bucket] || 'Soon'}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {form.emergency_type === 'clinic' && clinics.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-bold uppercase text-slate-500 mb-2">Open clinics nearby</p>
                      {clinics.slice(0, 3).map((c) => (
                        <div key={c.id} className="text-sm text-slate-700 py-1">
                          {c.name} · {c.available_doctors} doctors · {c.distance_km ?? '—'} km
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 4 && fees && (
                <div className="space-y-4">
                  <h2 className="font-bold text-lg text-slate-900">Emergency pricing</h2>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 divide-y text-sm">
                    <div className="flex justify-between px-4 py-3">
                      <span>Consultation fee</span>
                      <span>₹{fees.consultation_fee}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span>Emergency fee</span>
                      <span>₹{fees.emergency_fee}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span>Platform fee</span>
                      <span>₹{fees.platform_fee}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3 font-bold text-red-700 text-base">
                      <span>Total</span>
                      <span>₹{fees.total}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Payment via Razorpay. Appointment confirmed only after successful payment.</p>
                </div>
              )}

              {step === 5 && confirmedAppt && (
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl">
                    <FaIcon icon="fa-circle-check" />
                  </div>
                  <h2 className="font-bold text-xl text-slate-900">Emergency confirmed!</h2>
                  <p className="text-sm text-slate-600">Booking ID: <strong>{confirmedAppt.booking_id}</strong></p>
                  {(trackStatus || confirmedAppt).google_meet_link && (
                    <a href={(trackStatus || confirmedAppt).google_meet_link} target="_blank" rel="noreferrer" className="btn-primary inline-flex gap-2">
                      <FaIcon icon="fa-video" /> Join Meeting
                    </a>
                  )}
                  {form.emergency_type === 'home_visit' && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-left text-sm space-y-2">
                      <p className="font-semibold text-slate-900">Home visit tracking</p>
                      <p className="text-slate-600 capitalize">
                        Status: {(trackStatus || confirmedAppt).emergency_status?.replace(/_/g, ' ') || 'Doctor assigned'}
                      </p>
                      {(trackStatus || confirmedAppt).eta_minutes && (
                        <p className="text-slate-600">Estimated arrival: ~{(trackStatus || confirmedAppt).eta_minutes} minutes</p>
                      )}
                    </div>
                  )}
                  <Link to="/patient/appointments" className="block text-orange-600 text-sm font-semibold">View my appointments</Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step < 5 && (
            <div className="mt-8 flex gap-3">
              {step > 0 && (
                <button type="button" className="btn-outline flex-1" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
                  Back
                </button>
              )}
              {step < 4 && (
                <button type="button" className="btn-primary flex-1 bg-red-600 hover:bg-red-700 shadow-red-600/30" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
                  Continue
                </button>
              )}
              {step === 4 && (
                <button type="button" className="btn-primary flex-1 bg-red-600 hover:bg-red-700" disabled={submitting || !fees} onClick={handleBookAndPay}>
                  {submitting ? 'Processing…' : `Pay ₹${fees?.total ?? '—'} & Confirm`}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <LocationSelector />
    </div>
  );
}
