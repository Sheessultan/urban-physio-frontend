import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FaIcon from '../components/FaIcon';
import DoctorAvatar from '../components/DoctorAvatar';
import ClinicLogo from '../components/ClinicLogo';
import { search } from '../services/api';
import { useLocation } from '../contexts/LocationContext';
import { localSearchMatches, mergeSearchResults, QUICK_SEARCH_TAGS } from '../utils/searchCatalog';
import { doctorProfileUrl, clinicProfileUrl } from '../utils/profileUrls';
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  SEARCH_SUGGESTIONS,
  TRENDING_SEARCHES,
} from '../utils/searchHistory';

function ResultSection({ title, icon, items, renderItem }) {
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
}

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [input, setInput] = useState(q);
  const { city, coords } = useLocation();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => getRecentSearches());

  useEffect(() => {
    setInput(q);
  }, [q]);

  const runSearch = useCallback(
    (term) => {
      const trimmed = String(term || '').trim();
      if (trimmed.length < 2) return;
      addRecentSearch(trimmed);
      setRecent(getRecentSearches());
      setParams({ q: trimmed });
    },
    [setParams]
  );

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
    search
      .universal(apiParams)
      .then((res) => setResults(mergeSearchResults(res?.data ?? res, local)))
      .catch((err) => {
        const merged = mergeSearchResults({}, local);
        setResults(merged);
        const hasLocal = merged.treatments.length + merged.symptoms.length > 0;
        if (!hasLocal) {
          toast.error(err?.status === 429 ? 'Too many searches — wait a moment' : 'Search is temporarily unavailable');
        }
      })
      .finally(() => setLoading(false));
  }, [q, city?.id, coords?.lat, coords?.lng]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(input);
  };

  const chipClass =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 transition';

  const showLanding = !q || q.length < 2;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-10 w-full">
        <div className="glass-card p-4 sm:p-6 mb-8 border border-white/80 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Search</h1>
          <p className="text-sm text-slate-600 mb-4">
            Find doctors, clinics, treatments &amp; cities across India
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <FaIcon
                icon="fa-magnifying-glass"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
              />
              <input
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Try knee pain, Noida, sports injury…"
                className="input-field w-full !pl-10 !py-3"
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary shrink-0 !px-5">
              Search
            </button>
          </form>
        </div>

        {showLanding ? (
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">Suggestions</h2>
              <div className="flex flex-wrap gap-2">
                {SEARCH_SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className={chipClass} onClick={() => runSearch(s)}>
                    <FaIcon icon="fa-lightbulb" className="text-amber-500 text-xs" />
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">Trending</h2>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((s) => (
                  <button key={s} type="button" className={chipClass} onClick={() => runSearch(s)}>
                    <FaIcon icon="fa-fire" className="text-orange-500 text-xs" />
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">Popular tags</h2>
              <div className="flex flex-wrap gap-2">
                {QUICK_SEARCH_TAGS.map((s) => (
                  <button key={s} type="button" className={chipClass} onClick={() => runSearch(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {recent.length > 0 && (
              <section>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Recent searches</h2>
                  <button
                    type="button"
                    onClick={() => {
                      clearRecentSearches();
                      setRecent([]);
                    }}
                    className="text-xs text-slate-500 hover:text-red-600 font-medium"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((s) => (
                    <button key={s} type="button" className={chipClass} onClick={() => runSearch(s)}>
                      <FaIcon icon="fa-clock-rotate-left" className="text-slate-400 text-xs" />
                      {s}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { to: '/doctors', label: 'Browse doctors', icon: 'fa-user-doctor', tone: 'text-primary-600 bg-primary-50' },
                { to: '/clinics', label: 'Browse clinics', icon: 'fa-hospital', tone: 'text-emerald-600 bg-emerald-50' },
                { to: '/treatments', label: 'Treatments', icon: 'fa-hand-holding-medical', tone: 'text-sky-600 bg-sky-50' },
                {
                  to: city?.id ? `/doctors?city_id=${city.id}` : '/doctors',
                  label: city?.name ? `Doctors in ${city.name}` : 'By city',
                  icon: 'fa-location-dot',
                  tone: 'text-violet-600 bg-violet-50',
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="glass-card p-4 flex items-center gap-3 hover:shadow-md transition"
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${item.tone}`}>
                    <FaIcon icon={item.icon} />
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">{item.label}</span>
                </Link>
              ))}
            </section>
          </div>
        ) : loading ? (
          <p className="text-slate-500">
            <FaIcon icon="fa-spinner" className="fa-spin mr-2" />
            Searching for &ldquo;{q}&rdquo;…
          </p>
        ) : (
          <>
            <p className="text-slate-600 mb-6">
              Results for <strong className="text-slate-900">&ldquo;{q}&rdquo;</strong>
              {city?.name ? ` near ${city.name}` : ''}
            </p>
            <ResultSection
              title="Doctors"
              icon="fa-user-doctor"
              items={results?.doctors}
              renderItem={(d) => (
                <Link key={d.id} to={doctorProfileUrl(d)} className="glass-card p-4 hover:shadow-md transition block group">
                  <div className="flex items-center gap-3">
                    <DoctorAvatar doctor={d} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-primary-700">
                        Dr. {d.first_name} {d.last_name}
                      </p>
                      <p className="text-sm text-primary-600 truncate">{d.specialization || 'Physiotherapist'}</p>
                      {d.city_name && <p className="text-xs text-slate-500 truncate">{d.city_name}</p>}
                    </div>
                  </div>
                </Link>
              )}
            />
            <ResultSection
              title="Clinics"
              icon="fa-hospital"
              items={results?.clinics}
              renderItem={(c) => (
                <Link key={c.id} to={clinicProfileUrl(c)} className="glass-card p-4 hover:shadow-md transition block group">
                  <div className="flex items-center gap-3">
                    <ClinicLogo clinic={c} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-emerald-700">{c.name}</p>
                      <p className="text-sm text-emerald-700 truncate">{c.city_name || 'Clinic'}</p>
                    </div>
                  </div>
                </Link>
              )}
            />
            <ResultSection
              title="Cities"
              icon="fa-location-dot"
              items={results?.locations}
              renderItem={(loc) => (
                <div key={loc.id} className="glass-card p-4 flex flex-col gap-2">
                  <p className="font-semibold text-slate-900">{loc.name}</p>
                  <p className="text-xs text-slate-500">{loc.state_name}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Link
                      to={`/doctors?city_id=${loc.id}`}
                      className="text-xs font-semibold text-primary-700 hover:underline"
                    >
                      Doctors
                    </Link>
                    <Link
                      to={`/clinics?city_id=${loc.id}`}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Clinics
                    </Link>
                  </div>
                </div>
              )}
            />
            <ResultSection
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
            <ResultSection
              title="Conditions"
              icon="fa-notes-medical"
              items={results?.conditions}
              renderItem={(c) => (
                <Link key={c.id} to={`/conditions/${c.slug}`} className="glass-card p-4 hover:shadow-md transition block">
                  <p className="font-semibold text-slate-900">{c.title}</p>
                </Link>
              )}
            />
            <ResultSection
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
                </Link>
              )}
            />
            {!results?.doctors?.length &&
              !results?.clinics?.length &&
              !results?.treatments?.length &&
              !results?.conditions?.length &&
              !results?.symptoms?.length &&
              !results?.locations?.length && (
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">No results found for &ldquo;{q}&rdquo;.</p>
                  <button type="button" className="btn-outline text-sm" onClick={() => navigate('/search')}>
                    Try another search
                  </button>
                </div>
              )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
