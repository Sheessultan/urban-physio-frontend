import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FaIcon from '../components/FaIcon';
import DoctorAvatar from '../components/DoctorAvatar';
import BadgeList from '../components/platform/BadgeList';
import ReviewStars from '../components/platform/ReviewStars';
import ReviewForm from '../components/platform/ReviewForm';
import PageMeta, { doctorSchema } from '../components/seo/PageMeta';
import ShareProfileButton from '../components/profile/ShareProfileButton';
import ProfileSlotsPreview from '../components/profile/ProfileSlotsPreview';
import ClinicLogo from '../components/ClinicLogo';
import { doctors } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  clinicProfileUrl,
  doctorBookUrl,
  doctorProfileUrl,
  formatAvailabilitySummary,
} from '../utils/profileUrls';

const SERVICE_META = {
  clinic: { icon: 'fa-hospital', label: 'Clinic visit', feeKey: 'consultation_fee' },
  online: { icon: 'fa-video', label: 'Online consult', feeKey: 'online_fee' },
  home: { icon: 'fa-house-medical', label: 'Home visit', feeKey: 'home_visit_fee' },
};

function Section({ title, icon, children, id }) {
  return (
    <section id={id} className="glass-card p-5 md:p-7">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
        <FaIcon icon={icon} className="text-primary-600" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function DoctorProfilePage() {
  const { slug, id: legacyId } = useParams();
  const profileKey = slug || legacyId;
  const { hasRole } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = () => {
    doctors
      .get(profileKey)
      .then((res) => setDoctor(res?.data ?? res))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    load();
  }, [profileKey]);

  const canonical = doctor?.canonical_path || (doctor?.slug ? `/doctor/${doctor.slug}` : legacyId ? `/doctors/${legacyId}` : '');
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${canonical}` : canonical;

  const jsonLd = useMemo(() => (doctor ? doctorSchema(doctor, canonicalUrl) : null), [doctor, canonicalUrl]);

  if (!loading && doctor?.slug && profileKey !== doctor.slug) {
    return <Navigate to={doctorProfileUrl(doctor)} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !doctor) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <p className="text-slate-600">Doctor profile not found.</p>
          <Link to="/doctors" className="btn-primary mt-4 inline-block">
            Browse doctors
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const enabled = doctor.enabled_services || [];
  const expertise = doctor.expertise_list?.length
    ? doctor.expertise_list
    : [doctor.specialization].filter(Boolean);
  const languages = doctor.languages_list || ['English', 'Hindi'];

  return (
    <>
      <PageMeta
        title={doctor.seo?.title || `Dr. ${doctor.first_name} ${doctor.last_name}`}
        description={doctor.seo?.description}
        canonical={canonical}
        image={doctor.avatar}
        ogType="profile"
        jsonLd={jsonLd}
      />
      <Navbar />

      <div className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-12 md:pb-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0 mx-auto md:mx-0">
              <DoctorAvatar
                doctor={doctor}
                size="xl"
                className="!w-36 !h-36 md:!w-44 md:!h-44 !rounded-3xl ring-4 ring-white/20 shadow-2xl"
              />
            </div>
            <div className="flex-1 text-center md:text-left min-w-0">
              {doctor.is_featured === 1 || doctor.is_featured === '1' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide bg-amber-400/20 text-amber-200 px-3 py-1 rounded-full mb-3">
                  <FaIcon icon="fa-star" /> Featured physiotherapist
                </span>
              ) : null}
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Dr. {doctor.first_name} {doctor.last_name}
              </h1>
              <p className="text-primary-200 text-lg mt-1 font-medium">{doctor.specialization || 'Physiotherapist'}</p>
              <p className="text-slate-300 text-sm mt-2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1">
                <span>
                  <FaIcon icon="fa-location-dot" className="mr-1" />
                  {doctor.city_name}
                  {doctor.state_name ? `, ${doctor.state_name}` : ''}
                </span>
                {Number(doctor.experience_years) > 0 && (
                  <span>
                    <FaIcon icon="fa-briefcase" className="mr-1" />
                    {doctor.experience_years}+ years
                  </span>
                )}
              </p>
              <div className="mt-4 flex justify-center md:justify-start">
                <ReviewStars rating={doctor.rating_avg} count={doctor.rating_count} size="lg" />
              </div>
              <div className="mt-4">
                <BadgeList badges={doctor.badges} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link to={doctorBookUrl(doctor)} className="btn-primary !bg-white !text-primary-800 hover:!bg-primary-50">
                  <FaIcon icon="fa-calendar-check" className="mr-2" />
                  Book appointment
                </Link>
                <ShareProfileButton title={`Dr. ${doctor.first_name} ${doctor.last_name}`} className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6 -mt-6 relative z-[1]">
        <div className="grid md:grid-cols-3 gap-4">
          {['clinic', 'online', 'home'].map((type) => {
            const meta = SERVICE_META[type];
            const active = enabled.includes(type);
            const fee = doctor[meta.feeKey];
            return (
              <div
                key={type}
                className={`rounded-2xl border p-4 ${active ? 'bg-white border-primary-200 shadow-md' : 'bg-slate-50 border-slate-200 opacity-60'}`}
              >
                <FaIcon icon={meta.icon} className={`text-xl mb-2 ${active ? 'text-primary-600' : 'text-slate-400'}`} />
                <p className="font-semibold text-slate-900">{meta.label}</p>
                <p className="text-sm text-slate-600 mt-1">{active ? `₹${Number(fee || 0).toLocaleString('en-IN')}` : 'Not available'}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section title="About the doctor" icon="fa-user-doctor">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {doctor.bio || 'Experienced physiotherapist dedicated to helping patients recover faster with evidence-based care.'}
              </p>
              {doctor.qualifications && (
                <p className="mt-4 text-sm">
                  <span className="font-semibold text-slate-800">Qualifications: </span>
                  <span className="text-slate-600">{doctor.qualifications}</span>
                </p>
              )}
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Languages: </span>
                {languages.join(', ')}
              </p>
            </Section>

            <Section title="Expertise & treatment areas" icon="fa-hand-holding-medical">
              <div className="flex flex-wrap gap-2">
                {expertise.map((item) => (
                  <span key={item} className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-800 text-sm font-medium border border-primary-100">
                    {item}
                  </span>
                ))}
              </div>
            </Section>

            {doctor.clinics?.length > 0 && (
              <Section title="Available clinics" icon="fa-hospital">
                <div className="space-y-3">
                  {doctor.clinics.map((cl) => (
                    <Link
                      key={cl.id}
                      to={clinicProfileUrl(cl)}
                      className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition"
                    >
                      <ClinicLogo clinic={cl} size="md" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{cl.name}</p>
                        <p className="text-xs text-slate-500 truncate">{cl.address}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Available time slots" icon="fa-clock">
              <p className="text-sm text-slate-600 mb-3">{formatAvailabilitySummary(doctor.availability)}</p>
              <ProfileSlotsPreview doctorId={doctor.id} />
            </Section>

            {doctor.reviews?.length > 0 && (
              <Section title="Patient reviews" icon="fa-star">
                <div className="space-y-3">
                  {doctor.reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <ReviewStars rating={r.rating} />
                      <p className="text-sm text-slate-600 mt-2">{r.comment || 'No comment'}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {r.first_name} · {r.created_at?.slice(0, 10)}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="glass-card p-5 sticky top-20">
              <p className="font-bold text-slate-900 mb-3">Book with Dr. {doctor.last_name}</p>
              <p className="text-sm text-slate-600 mb-4">Online, home visit, or clinic — secure booking with Razorpay.</p>
              <Link to={doctorBookUrl(doctor)} className="btn-primary w-full text-center block mb-2">
                Book now
              </Link>
              <Link to="/doctors" className="text-sm text-primary-600 hover:underline block text-center">
                Compare other doctors
              </Link>
            </div>

            {hasRole('patient') && (
              <div className="glass-card p-5">
                <ReviewForm doctorId={+doctor.id} onSubmitted={load} />
              </div>
            )}
          </aside>
        </div>

        {doctor.related_doctors?.length > 0 && (
          <Section title="Related doctors" icon="fa-users">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {doctor.related_doctors.map((d) => (
                <Link key={d.id} to={doctorProfileUrl(d)} className="rounded-2xl border border-slate-100 p-4 hover:shadow-md transition block">
                  <DoctorAvatar doctor={d} size="md" className="mb-3" />
                  <p className="font-semibold text-slate-900 text-sm">
                    Dr. {d.first_name} {d.last_name}
                  </p>
                  <p className="text-xs text-primary-600">{d.specialization}</p>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </div>
      <Footer />
    </>
  );
}
