import React, { useState } from 'react';
import { Search, MapPin, Calendar, Filter, X } from 'lucide-react';

export const AdvancedSearch = ({ onSearch, onFilterChange }) => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500);
  const [rating, setRating] = useState(0);
  const [amenities, setAmenities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const amenityOptions = [
    'WiFi',
    'Swimming Pool',
    'Parking',
    'Restaurant',
    'Gym',
    'Spa',
    'Air Conditioning',
    'Room Service'
  ];

  const handleAmenityToggle = (amenity) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSearch = () => {
    onSearch({
      location,
      checkIn,
      checkOut,
      guests,
    });
  };

  const handleFilterChange = () => {
    onFilterChange({
      priceMin,
      priceMax,
      rating,
      amenities,
    });
  };

  const clearFilters = () => {
    setLocation('');
    setCheckIn('');
    setCheckOut('');
    setGuests(1);
    setPriceMin(0);
    setPriceMax(500);
    setRating(0);
    setAmenities([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Main Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Destination or city"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-black transition"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-blue-900 font-semibold hover:text-black transition"
        >
          <Filter size={20} />
          {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
        </button>
        {(priceMin > 0 || priceMax < 500 || rating > 0 || amenities.length > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
          >
            <X size={18} />
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-4">Price Range</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm text-slate-600">Min: ${priceMin}</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-slate-600">Max: ${priceMax}</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-4">Minimum Rating</h3>
            <div className="flex gap-3">
              {[0, 3, 4, 4.5, 5].map(r => (
                <button
                  key={r}
                  onClick={() => setRating(r)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    rating === r
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r === 0 ? 'All' : `${r}★+`}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {amenityOptions.map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-slate-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleFilterChange}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
