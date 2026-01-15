import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Check, X, Calendar, Users, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { hotelAPI } from '../services/api';
import LazyStripePaymentIntent from '../components/stripe/LazyStripePaymentIntent';
import LazyPayPalButtons from '../components/paypal/LazyPayPalButtons';

const ExperienceBooking = () => {
  const { t } = useTranslation();
  const { experienceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingData: initialBookingData } = location.state || {};

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [createdBookingId, setCreatedBookingId] = useState('');

  // New booking options
  const [selectedRoomType, setSelectedRoomType] = useState('standard');
  const [bookingOptions, setBookingOptions] = useState({
    smokingRoom: false,
    accessibility: false,
    dietaryRestrictions: '',
    transportation: false,
    guide: false,
    photography: false,
    privateTour: false
  });
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) {
        setError('Experience ID not provided');
        setLoading(false);
        return;
      }

      try {
        // Use the API to get the specific experience
        const foundExperience = await hotelAPI.getExperienceById(experienceId);

        if (!foundExperience) {
          setError('Experience not found');
        } else {
          setExperience(foundExperience);
        }
      } catch (err) {
        setError('Failed to load experience');
        console.error('Error loading experience:', err);
      } finally {
        setLoading(false);
      }
    };

    loadExperience();
  }, [experienceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || 'Experience not found'}</h2>
          <button
            onClick={() => navigate('/experiences')}
            aria-label="Back to experiences"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 min-h-[44px] flex items-center justify-center"
          >
            Back to Experiences
          </button>
        </div>
      </div>
    );
  }

  const resolvedBookingData = initialBookingData || {
    date: new Date().toISOString().split('T')[0],
    participants: 1,
    time: '09:00'
  };

  // Define room types and pricing
  const roomTypes = {
    standard: {
      name: 'Standard Experience',
      description: 'Basic experience package with essential inclusions',
      priceMultiplier: 1.0,
      inclusions: ['Guided tour', 'Transportation', 'Entry fees']
    },
    deluxe: {
      name: 'Deluxe Experience',
      description: 'Enhanced experience with premium amenities',
      priceMultiplier: 1.15,
      inclusions: ['Guided tour', 'Private transportation', 'Entry fees', 'Refreshments', 'Photo session']
    },
    premium: {
      name: 'Premium Experience',
      description: 'Luxury experience with VIP treatment',
      priceMultiplier: 1.35,
      inclusions: ['Private guide', 'Luxury transportation', 'VIP entry', 'Gourmet meals', 'Professional photography', 'Souvenirs']
    },
    vip: {
      name: 'VIP Experience',
      description: 'Ultimate luxury experience with exclusive access',
      priceMultiplier: 1.6,
      inclusions: ['Personal guide', 'Private luxury vehicle', 'VIP access', 'Fine dining', 'Professional videography', 'Luxury souvenirs', '24/7 concierge']
    }
  };

  // Calculate additional costs
  const additionalCosts = {
    smokingRoom: 15,
    accessibility: 0, // No extra charge
    transportation: 25,
    guide: 40,
    photography: 35,
    privateTour: 75
  };

  // Calculate total price
  const basePrice = experience.price * resolvedBookingData.participants;
  const roomTypeMultiplier = roomTypes[selectedRoomType].priceMultiplier;
  const roomTypePrice = basePrice * roomTypeMultiplier;

  const additionalPrice = Object.entries(bookingOptions).reduce((total, [key, selected]) => {
    if (selected && additionalCosts[key]) {
      return total + (additionalCosts[key] * resolvedBookingData.participants);
    }
    return total;
  }, 0);

  const totalPrice = roomTypePrice + additionalPrice;

  const handleSubmit = async (paymentResult = null) => {
    setProcessing(true);
    try {
      // Simulate booking creation
      const bookingId = `exp_${Date.now()}`;
      setCreatedBookingId(bookingId);

      // Extract payment information
      let paymentIntentId = null;
      let paymentMethod = 'unknown';

      if (paymentResult) {
        // Handle Stripe payment result
        if (paymentResult.id && paymentResult.status === 'succeeded') {
          paymentIntentId = paymentResult.id;
          paymentMethod = 'stripe';
        }
        // Handle PayPal payment result
        else if (paymentResult.id && paymentResult.status === 'COMPLETED') {
          paymentIntentId = paymentResult.id;
          paymentMethod = 'paypal';
        }
      }

      // Here you would typically call an API to create the booking
      console.log('Creating booking:', {
        experienceId: experience.id,
        experienceTitle: experience.title,
        bookingData: resolvedBookingData,
        guestInfo,
        roomType: selectedRoomType,
        bookingOptions,
        additionalNotes,
        paymentIntentId,
        paymentMethod,
        pricing: {
          basePrice,
          roomTypePrice,
          additionalPrice,
          totalPrice
        }
      });

      // await experienceAPI.bookExperience(experience.id, {
      //   ...resolvedBookingData,
      //   ...guestInfo,
      //   roomType: selectedRoomType,
      //   bookingOptions,
      //   additionalNotes,
      //   paymentIntentId,
      //   paymentMethod,
      //   totalPrice
      // });

      setOrderComplete(true);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('experienceBooking.success.title', 'Booking Confirmed!')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('experienceBooking.success.message', 'Your experience has been booked successfully.')}
            </p>
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('experienceBooking.success.bookingId', 'Booking ID')}: {createdBookingId}
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/bookings')}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                {t('experienceBooking.success.viewBookings', 'View My Bookings')}
              </button>
              <button
                onClick={() => navigate('/experiences')}
                className="w-full bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-white py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
              >
                {t('experienceBooking.success.bookAnother', 'Book Another Experience')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Experience Details */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {experience.title}
            </h1>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {experience.id === 'e-petra-night' && '🏛️'}
                  {experience.id === 'e-wadi-rum-safari' && '🏜️'}
                  {experience.id === 'e-dead-sea-spa' && '🧖'}
                  {experience.id === 'e-amman-food-tour' && '🍽️'}
                  {experience.id === 'e-coral-reef-diving' && '🤿'}
                  {experience.id === 'e-jeep-adventure' && '🚙'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {experience.price} JOD per person
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>⏱️ {experience.duration}</span>
                    <span>📊 {experience.difficulty}</span>
                    <span>👥 Max {experience.maxParticipants}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300">
                {experience.description}
              </p>

              {experience.highlights && experience.highlights.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Highlights:</h4>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    {experience.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {experience.includes && experience.includes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What's Included:</h4>
                  <div className="flex flex-wrap gap-2">
                    {experience.includes.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('experienceBooking.summary.title', 'Booking Summary')}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('experienceBooking.summary.date', 'Date')}:
                  </span>
                  <span className="font-medium">
                    {new Date(resolvedBookingData.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('experienceBooking.summary.time', 'Time')}:
                  </span>
                  <span className="font-medium">
                    {resolvedBookingData.time}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('experienceBooking.summary.participants', 'Participants')}:
                  </span>
                  <span className="font-medium">
                    {resolvedBookingData.participants}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Package: {roomTypes[selectedRoomType].name}
                  </span>
                  <span className="font-medium">
                    {roomTypePrice.toFixed(2)} JOD
                  </span>
                </div>

                {additionalPrice > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Options:</p>
                    {bookingOptions.smokingRoom && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Smoking Room</span>
                        <span>{(additionalCosts.smokingRoom * resolvedBookingData.participants).toFixed(2)} JOD</span>
                      </div>
                    )}
                    {bookingOptions.transportation && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Premium Transportation</span>
                        <span>{(additionalCosts.transportation * resolvedBookingData.participants).toFixed(2)} JOD</span>
                      </div>
                    )}
                    {bookingOptions.guide && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Professional Guide</span>
                        <span>{(additionalCosts.guide * resolvedBookingData.participants).toFixed(2)} JOD</span>
                      </div>
                    )}
                    {bookingOptions.photography && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Professional Photography</span>
                        <span>{(additionalCosts.photography * resolvedBookingData.participants).toFixed(2)} JOD</span>
                      </div>
                    )}
                    {bookingOptions.privateTour && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Private Tour</span>
                        <span>{(additionalCosts.privateTour * resolvedBookingData.participants).toFixed(2)} JOD</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-slate-600 pt-3">
                  <span>{t('experienceBooking.summary.total', 'Total')}:</span>
                  <span>{totalPrice.toFixed(2)} JOD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t('experienceBooking.form.title', 'Complete Your Booking')}
            </h2>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {/* Experience Package Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Choose Your Experience Package
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(roomTypes).map(([key, roomType]) => (
                    <label
                      key={key}
                      className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRoomType === key
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-slate-600 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="roomType"
                        value={key}
                        checked={selectedRoomType === key}
                        onChange={(e) => setSelectedRoomType(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {roomType.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {roomType.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-purple-600">
                              +{(roomType.priceMultiplier - 1) * 100}% 
                            </div>
                            <div className="text-sm text-gray-500">
                              {(roomType.priceMultiplier * experience.price * resolvedBookingData.participants).toFixed(2)} JOD
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Includes:</p>
                          <div className="flex flex-wrap gap-1">
                            {roomType.inclusions.map((inclusion, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 bg-gray-100 dark:bg-slate-700 text-xs rounded-full"
                              >
                                {inclusion}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {selectedRoomType === key && (
                        <div className="absolute top-4 right-4 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Additional Options
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={bookingOptions.smokingRoom}
                      onChange={(e) => setBookingOptions(prev => ({ ...prev, smokingRoom: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Smoking Room
                      </span>
                      <span className="text-xs text-gray-500 ml-2">+15 JOD/person</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={bookingOptions.accessibility}
                      onChange={(e) => setBookingOptions(prev => ({ ...prev, accessibility: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Accessibility Support
                      </span>
                      <span className="text-xs text-green-600 ml-2">Free</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={bookingOptions.transportation}
                      onChange={(e) => setBookingOptions(prev => ({ ...prev, transportation: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Premium Transportation
                      </span>
                      <span className="text-xs text-gray-500 ml-2">+25 JOD/person</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={bookingOptions.guide}
                      onChange={(e) => setBookingOptions(prev => ({ ...prev, guide: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Professional Guide
                      </span>
                      <span className="text-xs text-gray-500 ml-2">+40 JOD/person</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={bookingOptions.photography}
                      onChange={(e) => setBookingOptions(prev => ({ ...prev, photography: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Professional Photography
                      </span>
                      <span className="text-xs text-gray-500 ml-2">+35 JOD/person</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={bookingOptions.privateTour}
                      onChange={(e) => setBookingOptions(prev => ({ ...prev, privateTour: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Private Tour
                      </span>
                      <span className="text-xs text-gray-500 ml-2">+75 JOD/person</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dietary Restrictions
                  </label>
                  <select
                    value={bookingOptions.dietaryRestrictions}
                    onChange={(e) => setBookingOptions(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="">None</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten Free</option>
                    <option value="halal">Halal</option>
                    <option value="kosher">Kosher</option>
                    <option value="other">Other (specify in notes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any special requests or additional information..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Guest Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('experienceBooking.form.guestInfo', 'Guest Information')}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('experienceBooking.form.fullName', 'Full Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestInfo.fullName}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('experienceBooking.form.email', 'Email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('experienceBooking.form.phone', 'Phone Number')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('experienceBooking.form.specialRequests', 'Special Requests')}
                  </label>
                  <textarea
                    value={guestInfo.specialRequests}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder={t('experienceBooking.form.specialRequestsPlaceholder', 'Any special requirements or notes...')}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('experienceBooking.form.paymentMethod', 'Payment Method')}
                </h3>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    {t('experienceBooking.form.creditCard', 'Credit/Debit Card')}
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    PayPal
                  </label>
                </div>
              </div>

              {/* Payment Section */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
                {paymentMethod === 'card' && (
                  <LazyStripePaymentIntent
                    amount={totalPrice * 100} // Convert to cents
                    currency="jod"
                    onCreatePaymentIntent={async ({ amount, currency }) => {
                      return await hotelAPI.createPaymentIntent({
                        amount,
                        currency,
                        metadata: {
                          experienceId: experience.id,
                          experienceTitle: experience.title,
                          participants: resolvedBookingData.participants,
                          bookingDate: resolvedBookingData.date,
                          customerEmail: guestInfo.email,
                          customerName: guestInfo.fullName,
                          roomType: selectedRoomType,
                          bookingOptions: JSON.stringify(bookingOptions),
                          additionalNotes,
                          basePrice,
                          roomTypePrice,
                          additionalPrice,
                          totalPrice
                        }
                      });
                    }}
                    onSuccess={handleSubmit}
                    onError={(error) => {
                      console.error('Stripe payment error:', error);
                      alert('Payment failed: ' + error.message);
                    }}
                    disabled={processing}
                    onProcessingChange={setProcessing}
                    billingDetails={{
                      name: guestInfo.fullName,
                      email: guestInfo.email,
                      phone: guestInfo.phone,
                    }}
                  />
                )}

                {paymentMethod === 'paypal' && (
                  <LazyPayPalButtons
                    amount={totalPrice}
                    currency="JOD"
                    onApproved={handleSubmit}
                    onError={(error) => {
                      console.error('PayPal payment error:', error);
                      alert('Payment failed: ' + error.message);
                    }}
                    disabled={processing}
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceBooking;