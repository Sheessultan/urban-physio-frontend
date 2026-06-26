import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import FaIcon from '../components/FaIcon';
import DoctorAvatar from '../components/DoctorAvatar';
import ClinicLogo from '../components/ClinicLogo';
import { search } from '../services/api';
import { useLocation } from '../contexts/LocationContext';
import { localSearchMatches, mergeSearchResults } from '../utils/searchCatalog';
import { doctorProfileUrl, clinicProfileUrl } from '../utils/profileUrls';

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { city, coords } = useLocation();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const local = localSearchMatches(q);
    const apiParams = { q, search: q, limit: 20 };
    if (city?.id) apiParams.city_id = city.id;
    if (coords?.lat != null && coords?.lng != null) {
      apiParams.lat = coords.lat;
      apiParams.lng = coords.lng;
    }
    search.universal(apiParams)
      .then((res) => setResults(mergeSearchResults(res?.data ?? res, local)))
      .catch((err) => {
        const merged = mergeSearchResults({}, local);
        setResults(merged);
        const hasLocal =
          merged.treatments.length + merged.symptoms.length > 0;
        if (!hasLocal) {
          toast.error(err?.status === 429 ? 'Too many searches — wait a moment' : 'Search is temporarily unavailable');
        }
      })
      .finally(() => setLoading(false));
  }, [q, city?.id, coords?.lat, coords?.lng]);

  const Section = ({ title, icon, items, renderItem }) => {
    if (!items?.length) return null;
    return (
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <FaIcon icon={icon} className="text-primary-600" />
          {title}
          <span className="text-sm font-normal text-slate-500">({items.length})</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(renderItem)}</div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : 'Search'}
        </h1>
        {loading ? (
          <p className="text-slate-500"><FaIcon icon="fa-spinner" className="fa-spin mr-2" />Searching…</p>
        ) : !q || q.length < 2 ? (
          <p className="text-slate-600">Enter at least 2 characters to search.</p>
        ) : (
          <>
            <Section
              title="Doctors"
              icon="fa-user-doctor"
              items={results?.doctors}
              renderItem={(d) => (
                <Link key={d.id} to={doctorProfileUrl(d)} className="glass-card p-4 hover:shadow-md transition block group">
                  <div className="flex items-center gap-3">
                    <DoctorAvatar doctor={d} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                        Dr. {d.first_name} {d.last_name}
                      </p>
                      <p className="text-sm font-medium text-primary-600 truncate mt-0.5">
                        {d.specialization || 'Physiotherapist'}
                      </p>
                      {d.city_name && <p className="text-xs text-slate-500 truncate mt-0.5">{d.city_name}</p>}
                    </div>
                    <FaIcon icon="fa-chevron-right" className="text-xs text-slate-300 shrink-0" />
                  </div>
                </Link>
              )}
            />
            <Section
              title="Clinics"
              icon="fa-hospital"
              items={results?.clinics}
              renderItem={(c) => (
                <Link key={c.id} to={clinicProfileUrl(c)} className="glass-card p-4 hover:shadow-md transition block group">
                  <div className="flex items-center gap-3">
                    <ClinicLogo clinic={c} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        {c.name}
                      </p>
                      <p className="text-sm font-medium text-emerald-700 truncate mt-0.5">
                        {c.city_name || 'Clinic'}
                      </p>
                      {c.address && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{c.address}</p>}
                    </div>
                    <FaIcon icon="fa-chevron-right" className="text-xs text-slate-300 shrink-0" />
                  </div>
                </Link>
              )}
            />
            <Section
              title="Treatments"
              icon="fa-hand-holding-medical"
              items={results?.treatments}
              renderItem={(t, i) => (
                <Link
                  key={`${t.id ?? t.slug}-${i}`}
                  to={t.slug ? `/treatments/${t.slug}` : '/treatments'}
                  className="glass-card p-4 hover:shadow-md transition block"
                >
                  <p className="font-semibold text-slate-900">{t.title}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{t.short_description}</p>
                </Link>
              )}
            />
            <Section
              title="Locations"
              icon="fa-location-dot"
              items={results?.locations}
              renderItem={(loc) => (
                <Link
                  key={loc.id}
                  to={`/doctors?city_id=${loc.id}`}
                  className="glass-card p-4 hover:shadow-md transition block"
                >
                  <p className="font-semibold text-slate-900">{loc.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{loc.state_name}</p>
                </Link>
              )}
            />
            <Section
              title="Conditions"
              icon="fa-notes-medical"
              items={results?.conditions}
              renderItem={(c) => (
                <Link key={c.id} to={`/conditions/${c.slug}`} className="glass-card p-4 hover:shadow-md transition block">
                  <p className="font-semibold text-slate-900">{c.title}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{c.short_description}</p>
                </Link>
              )}
            />
            <Section
              title="Symptoms"
              icon="fa-heart-pulse"
              items={results?.symptoms}
              renderItem={(s, i) => (
                <Link
                  key={`${s.id}-${i}`}
                  to={`/conditions?search=${encodeURIComponent(s.title || s.chip_label || '')}`}
                  className="glass-card p-4 hover:shadow-md transition block"
                >
                  <p className="font-semibold text-slate-900">{s.title || s.chip_label}</p>
                  <p className="text-xs text-slate-500 capitalize mt-1">{s.source?.replace('_', ' ') || 'Symptom'}</p>
                </Link>
              )}
            />
            <Section
              title="Packages"
              icon="fa-box-open"
              items={results?.packages}
              renderItem={(p) => (
                <Link
                  key={p.id}
                  to={p.slug ? `/packages/book/${encodeURIComponent(p.slug)}` : '/packages'}
                  className="glass-card p-4 hover:shadow-md transition block"
                >
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{p.short_description}</p>
                </Link>
              )}
            />
            <Section
              title="Articles &amp; Podcasts"
              icon="fa-newspaper"
              items={results?.articles}
              renderItem={(a) => (
                <Link
                  key={a.id}
                  to={a.slug ? `/physiofeed/${a.slug}` : '/physiofeed'}
                  className="glass-card p-4 hover:shadow-md transition block"
                >
                  <p className="font-semibold text-slate-900">{a.title}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{a.excerpt}</p>
                </Link>
              )}
            />
            <Section
              title="Exercises"
              icon="fa-dumbbell"
              items={results?.exercises}
              renderItem={(e) => (
                <Link
                  key={e.id}
                  to={e.slug ? `/exercises/${e.slug}` : '/exercises'}
                  className="glass-card p-4 hover:shadow-md transition block"
                >
                  <p className="font-semibold text-slate-900">{e.name}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{e.instructions}</p>
                </Link>
              )}
            />
            {!results?.doctors?.length &&
              !results?.clinics?.length &&
              !results?.treatments?.length &&
              !results?.conditions?.length &&
              !results?.symptoms?.length &&
              !results?.locations?.length &&
              !results?.packages?.length &&
              !results?.articles?.length &&
              !results?.exercises?.length && (
                <p className="text-slate-600">No results found. Try different keywords.</p>
              )}
          </>
        )}
      </div>
    </div>
  );
}
