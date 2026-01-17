import React, { useState, useMemo } from 'react';
import { Calendar, Users, Filter, Search, X } from 'lucide-react';
import { formatPrice } from '../utils/hotelPricing';

const BookingHistory = ({ bookings, preferences }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('checkIn');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          booking.hotelName?.toLowerCase().includes(searchLower) ||
          booking.location?.toLowerCase().includes(searchLower) ||
          booking.id?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false;
      }

      return true;
    });

    // Sort bookings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'checkIn':
          return new Date(b.checkIn || 0).getTime() - new Date(a.checkIn || 0).getTime();
        case 'checkOut':
          return new Date(b.checkOut || 0).getTime() - new Date(a.checkOut || 0).getTime();
        case 'price':
          return (b.totalPrice || 0) - (a.totalPrice || 0);
        case 'hotelName':
          return (a.hotelName || '').localeCompare(b.hotelName || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [bookings, searchTerm, statusFilter, sortBy]);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'checkIn', label: 'Check-in Date' },
    { value: 'checkOut', label: 'Check-out Date' },
    { value: 'price', label: 'Total Price' },
    { value: 'hotelName', label: 'Hotel Name' },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 min-h-[44px]"
          >
            <Filter size={18} />
            Filters
            {(searchTerm || statusFilter !== 'all') && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {(searchTerm ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 dark:text-slate-100 text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="glass-card p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Filters</h4>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setShowFilters(false);
              }}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 dark:text-slate-100"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {filteredAndSortedBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {bookings.length === 0 ? 'No bookings yet' : 'No bookings match your filters'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {bookings.length === 0
              ? 'Start your Jordan adventure by booking your first stay!'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {bookings.length === 0 && (
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary px-6 py-2 hover:scale-105 transition-all duration-300"
            >
              Browse Hotels
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedBookings.map((booking) => (
            <div key={booking.id} className="glass-card border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-glow hover:scale-[1.01] transition-all duration-300 bg-white dark:bg-slate-900">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold gradient-text mb-1">{booking.hotelName}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span>📍 {booking.location}</span>
                        <span>•</span>
                        <span>ID: {booking.id}</span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold shadow-glow ${
                        (booking.status || '').toLowerCase() === 'confirmed'
                          ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                          : (booking.status || '').toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                          : (booking.status || '').toLowerCase() === 'completed'
                          ? 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                      }`}
                    >
                      {(booking.status || 'pending').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide">Check-in</p>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">
                          {new Date(booking.checkIn).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide">Check-out</p>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">
                          {new Date(booking.checkOut).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide">Guests</p>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">{booking.guests}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide">Duration</p>
                      <p className="text-slate-900 dark:text-slate-100 font-medium">{booking.nights} night{booking.nights !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:text-right">
                  <div className="mb-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide mb-1">Total Amount</p>
                    <p className="text-2xl font-bold gradient-text">{formatPrice(booking.totalPrice, preferences.currency)}</p>
                  </div>

                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <button
                      onClick={() => {
                        // TODO: Implement booking modification
                        alert('Booking modification coming soon!');
                      }}
                      className="btn-secondary px-4 py-2 text-sm hover:scale-105 transition-all duration-300 min-h-[44px] mr-2"
                    >
                      Modify
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;