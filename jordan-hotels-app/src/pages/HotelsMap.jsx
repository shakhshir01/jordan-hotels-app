import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import realHotelsAPI from '../services/realHotelsData';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const JORDAN_CENTER = [31.24, 36.51];

const getHotelLatLng = (hotel) => {
  const loc = (hotel?.location || '').toLowerCase();
  if (loc.includes('amman')) return [31.9539, 35.9106];
  if (loc.includes('aqaba')) return [29.5319, 35.0061];
  if (loc.includes('petra') || loc.includes('wadi musa')) return [30.3285, 35.4444];
  if (loc.includes('wadi rum')) return [29.5764, 35.4195];
  if (loc.includes('dead sea') || loc.includes('sweimeh')) return [31.7191, 35.5744];
  return JORDAN_CENTER;
};

export default function HotelsMap() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const mapRef = useRef(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadHotels = async () => {
      const data = await realHotelsAPI.getAllHotels();
      setHotels(data);
      if (data.length > 0) setSelectedHotel(data[0]);
    };
    loadHotels();
  }, []);

  useEffect(() => {
    if (!selectedHotel || !mapRef.current) return;
    const latlng = getHotelLatLng(selectedHotel);
    mapRef.current.setView(latlng, 9, { animate: true });
  }, [selectedHotel]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Hotels Map</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg h-96 overflow-hidden border border-gray-200">
          <MapContainer
            center={JORDAN_CENTER}
            zoom={8}
            scrollWheelZoom
            className="h-full w-full"
            whenCreated={(map) => {
              mapRef.current = map;
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {hotels.map((hotel) => {
              const pos = getHotelLatLng(hotel);
              const hotelName = getHotelDisplayName(hotel, i18n.language);
              return (
                <Marker
                  key={hotel.id}
                  position={pos}
                  eventHandlers={{
                    click: () => setSelectedHotel(hotel),
                  }}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <div className="font-bold text-sm">{hotelName}</div>
                      <div className="text-xs text-gray-600">{hotel.location}</div>
                      <div className="text-xs font-bold text-blue-900 mt-1">{hotel.price} JOD/night</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
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
          </div>
        </div>
      </div>

      {selectedHotel && (
        (() => {
          const selectedName = getHotelDisplayName(selectedHotel, i18n.language);
          return (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src={selectedHotel.image}
              alt={selectedName}
              onError={createHotelImageOnErrorHandler(selectedHotel.id)}
              className="w-full h-64 object-cover rounded-lg"
            />
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
