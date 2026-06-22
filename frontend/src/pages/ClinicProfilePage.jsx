import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FaIcon from '../components/FaIcon';
import ClinicLogo from '../components/ClinicLogo';
import DoctorAvatar from '../components/DoctorAvatar';
import BadgeList from '../components/platform/BadgeList';
import ReviewStars from '../components/platform/ReviewStars';
import PageMeta, { clinicSchema } from '../components/seo/PageMeta';
import ShareProfileButton from '../components/profile/ShareProfileButton';
import { clinics } from '../services/api';
import { googleMapsUrl } from '../utils/locationHelpers';
import { clinicBookUrl, clinicProfileUrl, doctorProfileUrl, formatOpeningHours } from '../utils/profileUrls';

function Section({ title, icon, children }) {
  return (
    <section className="glass-card p-5 md:p-7">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
        <FaIcon icon={icon} className="text-primary-600" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ClinicProfilePage() {
  const { slug } = useParams();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    clinics
      .get(slug)
      .then((res) => setClinic(res?.data ?? res))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const canonical = clinic?.canonical_path || (slug ? `/clinic/${slug}` : '');
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${canonical}` : canonical;
  const jsonLd = useMemo(() => (clinic ? clinicSchema(clinic, canonicalUrl) : null), [clinic, canonicalUrl]);

  const hoursText = formatOpeningHours(clinic?.opening_hours_parsed || clinic?.opening_hours);
  const services = clinic?.services_list?.length ? clinic.services_list : [];
  const facilities = clinic?.facilities_list?.length ? clinic.facilities_list : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !clinic) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <p className="text-slate-600">Clinic profile not found.</p>
          <Link to="/clinics" className="btn-primary mt-4 inline-block">
            Find care near you
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const mapUrl =
    clinic.latitude && clinic.longitude
      ? googleMapsUrl(clinic.latitude, clinic.longitude)
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address || clinic.name)}`;

  return (
    <>
      <PageMeta
        title={clinic.seo?.title || clinic.name}
        description={clinic.seo?.description}
        canonical={canonical}
        image={clinic.cover_image || clinic.logo}
        jsonLd={jsonLd}
      />
      <Navbar />

      <div className="relative pt-14">
        <div
          className="h-48 md:h-64 bg-gradient-to-r from-emerald-700 to-teal-800 bg-cover bg-center"
          style={clinic.cover_image ? { backgroundImage: `url(${clinic.cover_image})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-[1] pb-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <ClinicLogo clinic={clinic} size="xl" className="!w-28 !h-28 md:!w-32 md:!h-32 ring-4 ring-white shadow-xl rounded-2xl" />
            <div className="flex-1 min-w-0 text-white md:text-slate-900 md:pt-4">
              {clinic.is_featured === 1 || clinic.is_featured === '1' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase bg-amber-400/90 text-amber-950 px-3 py-1 rounded-full mb-2">
                  Featured clinic
                </span>
              ) : null}
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{clinic.name}</h1>
              <p className="text-slate-600 mt-2 flex items-start gap-2">
                <FaIcon icon="fa-location-dot" className="text-primary-600 mt-1 shrink-0" />
                <span>
                  {clinic.address}
                  {clinic.city_name ? `, ${clinic.city_name}` : ''}
                  {clinic.state_name ? `, ${clinic.state_name}` : ''}
                </span>
              </p>
              <div className="mt-3">
                <ReviewStars rating={clinic.rating_avg} count={clinic.rating_count} size="lg" />
              </div>
              <BadgeList badges={clinic.badges} />
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={clinicBookUrl(clinic)} className="btn-primary">
                  <FaIcon icon="fa-calendar-check" className="mr-2" />
                  Book clinic visit
                </Link>
                <ShareProfileButton title={clinic.name} />
                {clinic.phone && (
                  <a href={`tel:${clinic.phone}`} className="btn-outline inline-flex items-center gap-2">
                    <FaIcon icon="fa-phone" />
                    Call
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {clinic.description && (
                <Section title="About this clinic" icon="fa-circle-info">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{clinic.description}</p>
                </Section>
              )}

              {clinic.gallery?.length > 0 && (
                <Section title="Clinic gallery" icon="fa-images">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {clinic.gallery.map((img) => (
                      <img
                        key={img.id}
                        src={img.image_url}
                        alt={`${clinic.name} photo`}
                        loading="lazy"
                        className="w-full h-32 md:h-40 object-cover rounded-xl border border-slate-100"
                      />
                    ))}
                  </div>
                </Section>
              )}

              {clinic.doctors?.length > 0 && (
                <Section title="Our physiotherapists" icon="fa-user-doctor">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {clinic.doctors.map((d) => (
                      <Link
                        key={d.id}
                        to={doctorProfileUrl(d)}
                        className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary-200 transition"
                      >
                        <DoctorAvatar doctor={d} size="md" />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            Dr. {d.first_name} {d.last_name}
                          </p>
                          <p className="text-xs text-primary-600">{d.specialization}</p>
                          <p className="text-xs text-slate-500 mt-1">Clinic fee: ₹{d.consultation_fee}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Section>
              )}

              {services.length > 0 && (
                <Section title="Treatments offered" icon="fa-hand-holding-medical">
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-sm border border-emerald-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {facilities.length > 0 && (
                <Section title="Facilities & amenities" icon="fa-wheelchair">
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    {facilities.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <FaIcon icon="fa-check" className="text-emerald-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {clinic.reviews?.length > 0 && (
                <Section title="Patient reviews" icon="fa-star">
                  <div className="space-y-3">
                    {clinic.reviews.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <ReviewStars rating={r.rating} />
                        <p className="text-sm text-slate-600 mt-2">{r.comment || 'No comment'}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            <aside className="space-y-6">
              <Section title="Location & contact" icon="fa-map-location-dot">
                {hoursText && (
                  <p className="text-sm text-slate-600 mb-3">
                    <FaIcon icon="fa-clock" className="mr-2 text-primary-600" />
                    {hoursText}
                  </p>
                )}
                {clinic.phone && (
                  <p className="text-sm text-slate-700 mb-2">
                    <FaIcon icon="fa-phone" className="mr-2 text-primary-600" />
                    <a href={`tel:${clinic.phone}`} className="hover:underline">
                      {clinic.phone}
                    </a>
                  </p>
                )}
                {clinic.email && (
                  <p className="text-sm text-slate-700 mb-4">
                    <FaIcon icon="fa-envelope" className="mr-2 text-primary-600" />
                    <a href={`mailto:${clinic.email}`} className="hover:underline">
                      {clinic.email}
                    </a>
                  </p>
                )}
                {clinic.latitude && clinic.longitude && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video">
                    <iframe
                      title="Clinic map"
                      loading="lazy"
                      className="w-full h-full border-0"
                      src={`https://maps.google.com/maps?q=${clinic.latitude},${clinic.longitude}&z=15&output=embed`}
                    />
                  </div>
                )}
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full text-center mt-3 text-sm block"
                >
                  Open in Google Maps
                </a>
              </Section>
            </aside>
          </div>

          {clinic.related_clinics?.length > 0 && (
            <div className="mt-6">
              <Section title="Related clinics" icon="fa-hospital">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {clinic.related_clinics.map((c) => (
                    <Link key={c.id} to={clinicProfileUrl(c)} className="rounded-2xl border p-4 hover:shadow-md transition block">
                      <ClinicLogo clinic={c} size="md" className="mb-2" />
                      <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.city_name}</p>
                    </Link>
                  ))}
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
