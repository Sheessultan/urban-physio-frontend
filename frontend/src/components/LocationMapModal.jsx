import { useEffect, useRef, useState } from 'react';
import FaIcon from './FaIcon';
import GlassModal, { GlassModalHeader } from './GlassModal';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

const DEFAULT_CENTER = { lat: 19.076, lng: 72.8777 };

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  document.head.appendChild(l);
}

function osmLink(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

export default function LocationMapModal({ open, onClose, onConfirm, initialLat, initialLng }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState('');
  const [position, setPosition] = useState({
    lat: initialLat ?? DEFAULT_CENTER.lat,
    lng: initialLng ?? DEFAULT_CENTER.lng,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialLat != null && initialLng != null) {
      setPosition({ lat: initialLat, lng: initialLng });
    }
    setMapError('');
    setReady(false);
  }, [open, initialLat, initialLng]);

  useEffect(() => {
    if (!open || !mapRef.current) return undefined;

    let cancelled = false;

    (async () => {
      try {
        loadCss(LEAFLET_CSS);
        await loadScript(LEAFLET_JS);
        if (cancelled || !mapRef.current || !window.L) return;

        const L = window.L;
        const center = {
          lat: initialLat ?? position.lat,
          lng: initialLng ?? position.lng,
        };

        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
          markerRef.current = null;
        }

        const map = L.map(mapRef.current).setView([center.lat, center.lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const marker = L.marker([center.lat, center.lng], { draggable: true }).addTo(map);
        marker.on('dragend', () => {
          const { lat, lng } = marker.getLatLng();
          setPosition({ lat, lng });
        });
        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        mapInstance.current = map;
        markerRef.current = marker;
        setReady(true);
      } catch {
        setMapError('Could not load map. Check your internet connection.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!ready || !markerRef.current || !mapInstance.current) return;
    markerRef.current.setLatLng([position.lat, position.lng]);
    mapInstance.current.setView([position.lat, position.lng], mapInstance.current.getZoom());
  }, [position.lat, position.lng, ready]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => setLoading(false)
    );
  };

  const handleConfirm = () => {
    onConfirm(position);
    onClose();
  };

  const externalMap = osmLink(position.lat, position.lng);

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      size="md"
      titleId="location-map-modal-title"
      panelClassName="flex flex-col"
      zIndex={10000}
    >
      <GlassModalHeader
        titleId="location-map-modal-title"
        title="Pick your location"
        subtitle="Tap the map or drag the pin (OpenStreetMap)"
        icon="fa-map-location-dot"
        accent="primary"
        onClose={onClose}
      />

      {mapError ? (
        <div className="p-6 text-center text-sm text-slate-600">
          <FaIcon icon="fa-triangle-exclamation" className="text-amber-500 text-2xl mb-2" />
          <p>{mapError}</p>
        </div>
      ) : (
        <div ref={mapRef} className="h-80 w-full bg-slate-100/80 border-y border-white/60 z-0" style={{ minHeight: 320 }} />
      )}

      <div className="p-4 md:p-5 space-y-3 bg-white/40">
        <p className="text-xs text-slate-600 rounded-lg bg-white/70 border border-white/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <span>
            <FaIcon icon="fa-location-dot" className="text-primary-600 mr-1" />
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </span>
          <a
            href={externalMap}
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <FaIcon icon="fa-arrow-up-right-from-square" className="text-[10px]" />
            Open in map
          </a>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={loading || !!mapError}
            className="btn-outline flex-1 text-sm py-2"
          >
            <FaIcon icon="fa-crosshairs" className="mr-1" />
            {loading ? 'Locating...' : 'Current location'}
          </button>
          <button type="button" onClick={handleConfirm} disabled={!!mapError} className="btn-primary flex-1 text-sm py-2">
            Confirm location
          </button>
        </div>
      </div>
    </GlassModal>
  );
}
