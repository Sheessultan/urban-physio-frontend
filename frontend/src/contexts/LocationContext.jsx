import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

import { location, doctors, clinics } from '../services/api';

import { hasFunctionalConsent } from '../constants/cookieConsent';

import toast from 'react-hot-toast';

const LocationContext = createContext(null);
const STORAGE_KEY = 'selectedCity';

function unwrapList(res) {
  return res?.data ?? res ?? [];
}

function readSavedCity() {
  if (!hasFunctionalConsent()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

function formatLocationLabel(city, detectedLabel) {
  if (detectedLabel) return detectedLabel;
  if (!city?.name) return null;
  return city.state_name ? `${city.name}, ${city.state_name}` : city.name;
}

async function fetchProvidersForCity(cityId, coords = null) {
  try {
    const params = { city_id: cityId };
    if (coords?.lat != null && coords?.lng != null) {
      params.lat = coords.lat;
      params.lng = coords.lng;
    }
    const res = await location.cityProviders(cityId, params.lat, params.lng);
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
  const [locationLabel, setLocationLabel] = useState(null);
  /** 'gps' = device location, 'city' = manually selected city */
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

  const persistCity = useCallback((resolvedCity, source = 'gps') => {
    if (resolvedCity && hasFunctionalConsent()) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...resolvedCity,
          source,
          saved_at: Date.now(),
        })
      );
    }
  }, []);

  const applyProviderPayload = useCallback(
    (data, cityOverride = null, { userInitiated = false, fromGps = false } = {}) => {
      const resolvedCity = data?.city || cityOverride;
      const detectedLabel = data?.detected_label || resolvedCity?.detected_label || null;
      const docList = data?.doctors || [];
      const clinicList = data?.clinics || [];
      const has =
        data?.has_nearby_providers ??
        (docList.length > 0 || clinicList.length > 0);

      if (resolvedCity) {
        setCity(resolvedCity);
        setLocationLabel(formatLocationLabel(resolvedCity, detectedLabel));
      }

      setNearbyDoctors(docList);
      setNearbyClinics(clinicList);

      if (userInitiated) {
        setCoords(data?.coords ?? null);
        setShowSelector(false);
        if (resolvedCity) persistCity(resolvedCity, fromGps ? 'gps' : 'manual');
        return has;
      }

      if (fromGps) {
        setCoords(data?.coords ?? null);
        if (!has) {
          setShowSelector(true);
          return false;
        }
        setShowSelector(false);
        if (resolvedCity) persistCity(resolvedCity, 'gps');
        return true;
      }

      setShowSelector(!has);
      if (has && resolvedCity) persistCity(resolvedCity, 'gps');
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
        const payload = await fetchProvidersForCity(cityId, options.coords ?? coords);
        const merged = {
          ...payload,
          city: payload.city || cityData,
        };
        const has = applyProviderPayload(merged, cityData, options);

        if (options.userInitiated && cityData?.name) {
          const label = formatLocationLabel(cityData, merged.detected_label);
          if (has) {
            toast.success(`Showing care in ${label || cityData.name}`);
          } else {
            toast(`No doctors or clinics in ${cityData.name} yet. Try another nearby city.`, { icon: '📍' });
          }
        }
        return has;
      } catch {
        if (options.userInitiated && cityData) {
          setCity(cityData);
          setLocationLabel(formatLocationLabel(cityData));
          setCoords(options.coords ?? null);
          setLocationSource(options.fromGps ? 'gps' : 'city');
          setShowSelector(false);
          persistCity(cityData, options.fromGps ? 'gps' : 'manual');
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
    [applyProviderPayload, persistCity, coords]
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

        const hasProviders = applyProviderPayload(
          { ...data, coords: data.coords ?? { lat, lng } },
          null,
          { fromGps: true }
        );

        if (epoch !== locationEpoch.current) return;

        const label =
          data?.detected_label ||
          formatLocationLabel(data?.city) ||
          data?.city?.name;

        if (hasProviders && label) {
          const serviceName = data?.service_city?.name;
          const displayName = data?.city?.name;
          if (serviceName && displayName && serviceName !== displayName) {
            toast.success(`Showing care near ${displayName} · Providers in ${serviceName} area`);
          } else {
            toast.success(`Showing care near ${label}`);
          }
        } else if (label) {
          setShowSelector(true);
          toast(`We detected ${label}, but no doctors/clinics nearby yet. Please confirm your city.`, {
            icon: '📍',
            duration: 5000,
          });
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

        const saved = readSavedCity();
        if (saved?.id) {
          locationEpoch.current += 1;
          setLocationSource(saved.source === 'manual' ? 'city' : 'gps');
          setCoords(null);
          await loadCityProviders(saved.id, saved, {
            userInitiated: false,
            fromGps: saved.source !== 'manual',
          });
          return;
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [detectLocation, loadCityProviders]);

  const refreshLocation = useCallback(() => {
    if (locationSource === 'city' && city?.id) {
      return loadCityProviders(city.id, city, { userInitiated: true, coords });
    }
    return requestGeolocation();
  }, [locationSource, city, coords, loadCityProviders, requestGeolocation]);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const bootstrap = async () => {
      const saved = readSavedCity();

      if (saved?.source === 'manual' && saved?.id) {
        locationEpoch.current += 1;
        setLocationSource('city');
        setCoords(null);
        await loadCityProviders(saved.id, saved, { userInitiated: false });
        return;
      }

      requestGeolocation();
    };

    bootstrap();
  }, [loadCityProviders, requestGeolocation]);

  useEffect(() => {
    const onConsent = () => {
      if (!hasFunctionalConsent()) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const saved = readSavedCity();
        if (saved?.id && !city) {
          if (saved.source === 'manual') {
            loadCityProviders(saved.id, saved, { userInitiated: false });
          } else {
            requestGeolocation();
          }
        }
      }
    };

    window.addEventListener('tup-cookie-consent-updated', onConsent);
    return () => window.removeEventListener('tup-cookie-consent-updated', onConsent);
  }, [city, loadCityProviders, requestGeolocation]);

  const selectCity = async (cityData) => {
    if (!cityData?.id) return;
    locationEpoch.current += 1;
    setShowSelector(false);
    setCoords(null);
    setLocationSource('city');
    await loadCityProviders(cityData.id, cityData, { userInitiated: true });
  };

  const useCurrentLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setShowSelector(false);
    requestGeolocation();
  }, [requestGeolocation]);

  return (
    <LocationContext.Provider
      value={{
        coords,
        city,
        locationLabel,
        locationSource,
        nearbyDoctors,
        nearbyClinics,
        hasNearbyProviders,
        locationResolved,
        showSelector,
        loading,
        requestGeolocation: useCurrentLocation,
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
