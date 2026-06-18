import { useCallback, useEffect, useState } from 'react';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import { doctors, location } from '../services/api';

/**
 * Load verified doctors filtered by the user's selected city / GPS location.
 */
export function useLocationDoctors() {
  const { city, coords, loading: locLoading, setShowSelector } = useLocationContext();
  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasLocation = !!(city?.id || (coords?.lat != null && coords?.lng != null));

  const load = useCallback(async () => {
    if (!city?.id && (coords?.lat == null || coords?.lng == null)) {
      setDoctorList([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let docs = [];

      if (coords?.lat != null && coords?.lng != null) {
        const docRes = await location.nearbyDoctors(coords.lat, coords.lng, 50, city?.id);
        docs = docRes.data || [];
      }

      if (docs.length === 0 && city?.id) {
        const fallback = await doctors.list({ verified: 1, city_id: city.id });
        docs = fallback.data || [];
      }

      setDoctorList(Array.isArray(docs) ? docs : []);
    } catch {
      setDoctorList([]);
    } finally {
      setLoading(false);
    }
  }, [coords, city]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    doctorList,
    setDoctorList,
    loading: loading || locLoading,
    city,
    coords,
    hasLocation,
    reload: load,
    setShowSelector,
  };
}
