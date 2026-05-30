import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

import { location, doctors, clinics } from '../services/api';

import { hasFunctionalConsent } from '../constants/cookieConsent';

import toast from 'react-hot-toast';

const LocationContext = createContext(null);

function unwrapList(res) {
  return res?.data ?? res ?? [];
}

async function fetchProvidersForCity(cityId) {
  try {
    const res = await location.cityProviders(cityId);
    return res?.data ?? res;
  } catch {
    const [docRes, clinicRes] = await Promise.all([
      doctors.list({ city_id: cityId }),
      clinics.list({ city_id: cityId }),
    ]);
    const docList = unwrapList(docRes);
    const clinicList = unwrapList(clinicRes);
    return {
      doctors: docList,
      clinics: clinicList,
      has_nearby_providers: docList.length > 0 || clinicList.length > 0,
    };
  }
}

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState(null);
  /** 'gps' = device location, 'city' = manually selected city (GPS ignored) */
  const [locationSource, setLocationSource] = useState(null);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [nearbyClinics, setNearbyClinics] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationResolved, setLocationResolved] = useState(false);

  const initDone = useRef(false);
  /** Bumps when user manually picks a city — stale GPS callbacks are ignored */
  const locationEpoch = useRef(0);

  const hasNearbyProviders = nearbyDoctors.length > 0 || nearbyClinics.length > 0;

  const persistCity = useCallback((resolvedCity) => {
    if (resolvedCity && hasFunctionalConsent()) {
      localStorage.setItem('selectedCity', JSON.stringify(resolvedCity));
    }
  }, []);

  const applyProviderPayload = useCallback(
    (data, cityOverride = null, { userInitiated = false, fromGps = false } = {}) => {
      const resolvedCity = data?.city || cityOverride;
      const docList = data?.doctors || [];
      const clinicList = data?.clinics || [];
      const has =
        data?.has_nearby_providers ??
        (docList.length > 0 || clinicList.length > 0);

      if (userInitiated) {
        if (resolvedCity) setCity(resolvedCity);
        setNearbyDoctors(docList);
        setNearbyClinics(clinicList);
        setCoords(null);
        setShowSelector(false);
        persistCity(resolvedCity);
        return has;
      }

      if (fromGps && !has) {
        setNearbyDoctors([]);
        setNearbyClinics([]);
        setShowSelector(true);
        return false;
      }

      if (resolvedCity) setCity(resolvedCity);
      setNearbyDoctors(docList);
      setNearbyClinics(clinicList);
      if (data?.coords) setCoords(data.coords);
      setShowSelector(!has);
      if (has && resolvedCity) persistCity(resolvedCity);
      return has;
    },
    [persistCity]
  );

  const loadCityProviders = useCallback(
    async (cityId, cityData = null, options = {}) => {
      if (!cityId) {
        toast.error('Please choose a valid city');
        return false;
      }

      setLoading(true);
      try {
        const payload = await fetchProvidersForCity(cityId);
        const merged = {
          ...payload,
          city: payload.city || cityData,
        };
        const has = applyProviderPayload(merged, cityData, options);

        if (options.userInitiated && cityData?.name) {
          if (has) {
            toast.success(`Showing care in ${cityData.name}`);
          } else {
            toast(`No doctors or clinics in ${cityData.name} yet. Try another nearby city.`, { icon: '📍' });
          }
        }
        return has;
      } catch {
        if (options.userInitiated && cityData) {
          setCity(cityData);
          setCoords(null);
          setLocationSource('city');
          setShowSelector(false);
          persistCity(cityData);
          toast.success(`Location set to ${cityData.name}`);
          return false;
        }
        if (!options.userInitiated) setShowSelector(true);
        toast.error('Could not load providers for this city.');
        return false;
      } finally {
        setLoading(false);
        setLocationResolved(true);
      }
    },
    [applyProviderPayload, persistCity]
  );

  const detectLocation = useCallback(
    async (lat, lng, epoch) => {
      if (epoch !== locationEpoch.current) return;

      setLoading(true);
      try {
        const res = await location.detect(lat, lng);
        if (epoch !== locationEpoch.current) return;

        const data = res?.data ?? res;
        setCoords({ lat, lng });
        setLocationSource('gps');

        const hasProviders = applyProviderPayload(data, null, { fromGps: true });

        if (epoch !== locationEpoch.current) return;

        if (hasProviders && data?.city?.name) {
          toast.success(`Showing care near ${data.city.name}`);
        } else {
          setShowSelector(true);
          toast('No doctors or clinics near your current location. Please select your city manually.', {
            icon: '📍',
            duration: 5000,
          });
        }
      } catch {
        if (epoch !== locationEpoch.current) return;
        setShowSelector(true);
        toast.error('Could not detect location. Please select your city manually.');
      } finally {
        if (epoch === locationEpoch.current) {
          setLoading(false);
          setLocationResolved(true);
        }
      }
    },
    [applyProviderPayload]
  );

  const requestGeolocation = useCallback(() => {
    const epoch = ++locationEpoch.current;
    setLocationSource('gps');

    if (!navigator.geolocation) {
      setShowSelector(true);
      setLoading(false);
      setLocationResolved(true);
      toast.error('Geolocation not supported. Please select your city manually.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => detectLocation(pos.coords.latitude, pos.coords.longitude, epoch),
      async (err) => {
        if (epoch !== locationEpoch.current) return;

        if (hasFunctionalConsent()) {
          const saved = localStorage.getItem('selectedCity');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed?.id) {
                locationEpoch.current += 1;
                setCoords(null);
                setLocationSource('city');
                await loadCityProviders(parsed.id, parsed, { userInitiated: true });
                return;
              }
            } catch {
              /* ignore */
            }
          }
        }

        setLoading(false);
        setShowSelector(true);
        setLocationResolved(true);
        if (err?.code === 1) {
          toast.error('Location permission denied. Select your city manually.');
        } else {
          toast.error('Could not get GPS location. Select your city manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, [detectLocation, loadCityProviders]);

  const refreshLocation = useCallback(() => {
    if (locationSource === 'city' && city?.id) {
      return loadCityProviders(city.id, city, { userInitiated: true });
    }
    return requestGeolocation();
  }, [locationSource, city, loadCityProviders, requestGeolocation]);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const bootstrap = async () => {
      if (hasFunctionalConsent()) {
        const saved = localStorage.getItem('selectedCity');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed?.id) {
              locationEpoch.current += 1;
              setLocationSource('city');
              setCoords(null);
              await loadCityProviders(parsed.id, parsed, { userInitiated: true });
              return;
            }
          } catch {
            /* ignore */
          }
        }
      }

      requestGeolocation();
    };

    bootstrap();
  }, [loadCityProviders, requestGeolocation]);

  useEffect(() => {
    const onConsent = () => {
      if (!hasFunctionalConsent()) {
        localStorage.removeItem('selectedCity');
      } else {
        const saved = localStorage.getItem('selectedCity');
        if (saved && !city) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed?.id) {
              loadCityProviders(parsed.id, parsed, { userInitiated: true });
            }
          } catch {
            /* ignore */
          }
        }
      }
    };

    window.addEventListener('tup-cookie-consent-updated', onConsent);
    return () => window.removeEventListener('tup-cookie-consent-updated', onConsent);
  }, [city, loadCityProviders]);

  const selectCity = async (cityData) => {
    if (!cityData?.id) return;
    locationEpoch.current += 1;
    setShowSelector(false);
    setCoords(null);
    setLocationSource('city');
    await loadCityProviders(cityData.id, cityData, { userInitiated: true });
  };

  return (
    <LocationContext.Provider
      value={{
        coords,
        city,
        locationSource,
        nearbyDoctors,
        nearbyClinics,
        hasNearbyProviders,
        locationResolved,
        showSelector,
        loading,
        requestGeolocation,
        refreshLocation,
        selectCity,
        detectLocation,
        loadCityProviders,
        setShowSelector,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
