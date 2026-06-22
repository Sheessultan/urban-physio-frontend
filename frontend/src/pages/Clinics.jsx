import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ClinicCard from '../components/ClinicCard';
import FaIcon from '../components/FaIcon';
import { clinics } from '../services/api';
import { useLocation } from '../contexts/LocationContext';

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'doctors', label: 'Most doctors' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'distance', label: 'Nearest first' },
];

function sortClinics(items, sortId) {
  const copy = [...items];
  const rating = (c) => Number(c.rating_avg) || 0;
  const doctors = (c) => Number(c.doctor_count) || 0;
  const name = (c) => (c.name || '').toLowerCase();
  const dist = (c) => (c.distance_km != null ? Number(c.distance_km) : null);

  switch (sortId) {
    case 'rating':
      return copy.sort((a, b) => rating(b) - rating(a) || name(a).localeCompare(name(b)));
    case 'doctors':
      return copy.sort((a, b) => doctors(b) - doctors(a) || rating(b) - rating(a));
    case 'name':
      return copy.sort((a, b) => name(a).localeCompare(name(b)));
    case 'distance':
      return copy.sort((a, b) => {
        const da = dist(a);
        const db = dist(b);
        if (da != null && db != null) return da - db;
        if (da != null) return -1;
        if (db != null) return 1;
        return rating(b) - rating(a);
      });
    case 'recommended':
    default:
      return copy.sort((a, b) => {
        const featA = Number(a.is_featured) || 0;
        const featB = Number(b.is_featured) || 0;
        if (featB !== featA) return featB - featA;
        const da = dist(a);
        const db = dist(b);
        if (da != null && db != null && da !== db) return da - db;
        return rating(b) - rating(a) || name(a).localeCompare(name(b));
      });
  }
}

export default function Clinics() {
  const [searchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const [searchApi, setSearchApi] = useState(() => searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recommended');
  const { nearbyClinics, city, setShowSelector, loading: locLoading } = useLocation();

  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchInput(q);
    setSearchApi(q);
  }, [searchParams]);

  const urlCityId = searchParams.get('city_id');
  const effectiveCityId = urlCityId ? Number(urlCityId) : city?.id;

  useEffect(() => {
    const t = setTimeout(() => setSearchApi(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const hasSearch = Boolean(searchApi.trim());
      if (!hasSearch && nearbyClinics.length) {
        setList(nearbyClinics);
        return;
      }
      const res = await clinics.list({
        city_id: effectiveCityId || undefined,
        search: hasSearch ? searchApi : undefined,
      });
      setList(res.data || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [searchApi, effectiveCityId, nearbyClinics]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(() => sortClinics(list, sortBy), [list, sortBy]);

  const stats = useMemo(() => {
    const n = sorted.length;
    if (!n) return { count: 0, avgRating: null, totalDoctors: 0 };
    let sum = 0;
    let rated = 0;
    let docSum = 0;
    for (const c of sorted) {
      const r = Number(c.rating_avg);
      if (r > 0) {
        sum += r;
        rated++;
      }
      docSum += Number(c.doctor_count) || 0;
    }
    return {
      count: n,
      avgRating: rated ? (sum / rated).toFixed(1) : null,
      totalDoctors: docSum,
    };
  }, [sorted]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/40">
        <div className="mesh-blob w-[420px] h-[420px] -top-32 -right-20 bg-emerald-300/30" />
        <div className="mesh-blob w-[320px] h-[320px] bottom-0 left-0 bg-teal-300/25" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 md:pt-14 md:pb-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2">
              Partner clinics
            </p>
            <h1 className="section-title text-3xl sm:text-4xl md:text-5xl">Find a clinic</h1>
            <p className="section-subtitle mt-3">
              Search, compare and book verified Urban Physio partner clinics for in-person physiotherapy care.
            </p>
          </div>

          {!loading && stats.count > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="glass rounded-2xl px-4 py-3 border border-white/60 shadow-sm">
                <p className="text-[11px] font-bold uppercase text-slate-500">Clinics</p>
                <p className="text-xl font-bold text-slate-900">{stats.count}</p>
              </div>
              {stats.avgRating && (
                <div className="glass rounded-2xl px-4 py-3 border border-white/60 shadow-sm">
                  <p className="text-[11px] font-bold uppercase text-slate-500">Avg rating</p>
                  <p className="text-xl font-bold text-amber-700 inline-flex items-center gap-1">
                    <FaIcon icon="fa-star" className="text-sm" />
                    {stats.avgRating}
                  </p>
                </div>
              )}
              {stats.totalDoctors > 0 && (
                <div className="glass rounded-2xl px-4 py-3 border border-white/60 shadow-sm">
                  <p className="text-[11px] font-bold uppercase text-slate-500">Physiotherapists</p>
                  <p className="text-xl font-bold text-emerald-700">{stats.totalDoctors}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative">
        <div className="card !p-4 md:!p-5 mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 min-w-0">
              <FaIcon
                icon="fa-magnifying-glass"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"
              />
              <input
                className="input-field pl-11 !py-3"
                placeholder="Search by clinic name, area or city…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search clinics"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="min-w-[200px]">
                <label className="sr-only">Sort by</label>
                <select
                  className="input-field !py-3 text-sm w-full"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                to="/book?type=clinic"
                className="btn-primary text-center whitespace-nowrap !py-3 px-5 text-sm inline-flex items-center justify-center gap-2 !bg-emerald-600 hover:!bg-emerald-700"
              >
                <FaIcon icon="fa-calendar-plus" />
                Book clinic visit
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Location</span>
            {city ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-sm font-medium border border-emerald-100">
                  <FaIcon icon="fa-location-dot" className="text-emerald-600" />
                  {city.name}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSelector(true)}
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                >
                  Change city
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowSelector(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
              >
                <FaIcon icon="fa-map-location-dot" />
                Select your city
              </button>
            )}
            {locLoading && <span className="text-xs text-slate-400">Detecting…</span>}
            {!searchApi.trim() && nearbyClinics.length > 0 && (
              <span className="text-xs text-slate-500 ml-auto max-w-[14rem] text-right">
                Showing clinics near you first — search to browse all.
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-white/60 bg-white/40 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                {sorted.length} clinic{sorted.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">Compare ratings, doctors & locations</p>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {sorted.map((c) => (
                <ClinicCard key={c.id} clinic={c} variant="listing" />
              ))}
            </div>
            {!sorted.length && (
              <div className="card text-center py-16 md:py-20 max-w-lg mx-auto mt-4">
                <FaIcon icon="fa-hospital" className="text-5xl text-slate-200 mb-4" />
                <p className="font-semibold text-slate-800 text-lg">No clinics match</p>
                <p className="text-slate-500 text-sm mt-2 px-4">
                  Try another city, clear your search, or book an online consultation instead.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <button type="button" onClick={() => setShowSelector(true)} className="btn-primary text-sm">
                    Choose city
                  </button>
                  <button
                    type="button"
                    className="btn-outline text-sm"
                    onClick={() => setSearchInput('')}
                  >
                    Clear search
                  </button>
                  <Link to="/doctors" className="btn-outline text-sm">
                    Find physiotherapists
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
