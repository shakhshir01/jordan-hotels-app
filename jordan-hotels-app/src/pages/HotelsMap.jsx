import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
// react-leaflet and leaflet are lazy-loaded to reduce initial bundle size
import hotelsService from '../services/hotelsService';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';
import { getHotelCoordinates } from '../utils/geo';
import { InlineLoader } from '../components/LoadingSpinner';

const JORDAN_CENTER = [31.24, 36.51];

const getHotelLatLng = (hotel) => {
  const coords = getHotelCoordinates(hotel);
  if (!coords) return null;
  return [coords.lat, coords.lon];
};

export default function HotelsMap() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const mapRef = useRef(null);
  const [LeafletComponents, setLeafletComponents] = useState(null);
  const { i18n } = useTranslation();

  const requestUserLocation = () => {
    setLoading(true);
    setLocationError('');

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLocationError('Location is not supported in this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos?.coords?.latitude);
        const lon = Number(pos?.coords?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          setLocationError('Could not read your location.');
          setLoading(false);
          return;
        }
        setUserLocation({ lat, lon });
      },
      (err) => {
        const msg = err?.message || 'Location permission denied.';
        setLocationError(msg);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60_000,
      }
    );
  };

  useEffect(() => {
    requestUserLocation();
  }, []);

  useEffect(() => {
    const loadNearbyHotels = async () => {
      if (!userLocation) return;
      setLoading(true);
      setLocationError('');

      try {
        // Only show hotels near the user, with real geo coordinates.
        const nearby = await hotelsService.getNearbyHotelsByGeo({
          lat: userLocation.lat,
          lon: userLocation.lon,
          limit: 40,
          targetKm: 25,
          pageLimit: 200,
          maxPages: 6,
        });

        const withCoords = (Array.isArray(nearby) ? nearby : []).filter((h) => getHotelLatLng(h));
        setHotels(withCoords);
        setSelectedHotel(withCoords[0] || null);
      } catch (_e) {
        setLocationError('Failed to load nearby hotels.');
        setHotels([]);
        setSelectedHotel(null);
      } finally {
        setLoading(false);
      }
    };

    loadNearbyHotels();
  }, [userLocation]);

  useEffect(() => {
    if (!selectedHotel || !mapRef.current) return;
    const latlng = getHotelLatLng(selectedHotel);
    if (!latlng) return;
    mapRef.current.setView(latlng, 13, { animate: true });
  }, [selectedHotel]);

  useEffect(() => {
    let mounted = true;
    async function loadLeaflet() {
      try {
        const [{ MapContainer, TileLayer, Marker, Popup }, L] = await Promise.all([
          import('react-leaflet'),
          import('leaflet'),
        ]);

        // configure default icon urls
        try {
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: (await import('leaflet/dist/images/marker-icon-2x.png')).default,
            iconUrl: (await import('leaflet/dist/images/marker-icon.png')).default,
            shadowUrl: (await import('leaflet/dist/images/marker-shadow.png')).default,
          });
        } catch (_e) {
          // ignore icon setup failures
        }

        if (mounted) setLeafletComponents({ MapContainer, TileLayer, Marker, Popup, L });
      } catch (_err) {
        // loading failed — keep map hidden
        // console.warn('Failed to load leaflet components', err);
      }
    }
    loadLeaflet();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Hotels Map</h1>

      {loading && (
        <InlineLoader message="Finding nearby hotels…" />
      )}

      {!loading && locationError && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
          <div className="font-semibold">Enable location to see nearby hotels on the map.</div>
          <div className="text-sm mt-1">{locationError}</div>
          <button
            type="button"
            onClick={requestUserLocation}
            className="mt-3 px-4 py-2 rounded-full border border-amber-200 bg-white text-sm font-semibold text-amber-900 hover:bg-amber-50"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg h-[55vh] sm:h-96 overflow-hidden border border-gray-200">
          {LeafletComponents ? (
            <LeafletComponents.MapContainer
              center={userLocation ? [userLocation.lat, userLocation.lon] : JORDAN_CENTER}
              zoom={userLocation ? 12 : 8}
              scrollWheelZoom
              className="h-full w-full"
              whenCreated={(map) => {
                mapRef.current = map;
              }}
            >
              <LeafletComponents.TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {hotels.map((hotel) => {
                const pos = getHotelLatLng(hotel);
                if (!pos) return null;
                const hotelName = getHotelDisplayName(hotel, i18n.language);
                return (
                  <LeafletComponents.Marker
                    key={hotel.id}
                    position={pos}
                    eventHandlers={{
                      click: () => setSelectedHotel(hotel),
                    }}
                  >
                    <LeafletComponents.Popup>
                      <div className="min-w-0 max-w-[16rem]">
                        <div className="font-bold text-sm break-words">{hotelName}</div>
                        <div className="text-xs text-gray-600 break-words">{hotel.location}</div>
                        <div className="text-xs font-bold text-blue-900 mt-1">{hotel.price} JOD/night</div>
                      </div>
                    </LeafletComponents.Popup>
                  </LeafletComponents.Marker>
                );
              })}
            </LeafletComponents.MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center">Loading map…</div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4">Hotels Nearby</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {hotels.map((hotel) => (
              (() => {
                const hotelName = getHotelDisplayName(hotel, i18n.language);
                return (
              <div
                key={hotel.id}
                onClick={() => setSelectedHotel(hotel)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedHotel?.id === hotel.id
                    ? 'bg-blue-100 border-2 border-blue-600'
                    : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                <p className="font-bold text-sm">{hotelName}</p>
                <p className="text-xs text-gray-600">{hotel.location}</p>
                <p className="text-sm font-semibold text-blue-600">{hotel.price} JOD</p>
              </div>
                );
              })()
            ))}

            {!loading && !locationError && hotels.length === 0 && (
              <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-4">
                No nearby hotels with coordinates were found.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedHotel && (
        (() => {
          const selectedName = getHotelDisplayName(selectedHotel, i18n.language);
          return (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={selectedHotel.image}
                alt={selectedName}
                onError={createHotelImageOnErrorHandler(selectedHotel.id)}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">{selectedName}</h2>
              <p className="text-gray-600 mb-4">{selectedHotel.description}</p>
              <p className="text-gray-700 mb-2">
                <strong>Phone:</strong> {selectedHotel.phone}
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Email:</strong> {selectedHotel.email}
              </p>
              <p className="text-2xl font-bold text-blue-600">{selectedHotel.price} JOD / night</p>
            </div>
          </div>
        </div>
          );
        })()
      )}
    </div>
  );
}
