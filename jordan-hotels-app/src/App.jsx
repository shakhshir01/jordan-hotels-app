import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { PreferencesProvider } from './context/PreferencesContext';
// Shared layout
import AppLayout from './layouts/AppLayout.jsx';
// Components
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import ChatBot from './components/ChatBot.jsx';
import MfaModal from './components/MfaModal.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Safe lazy loading with error recovery
const lazyWithRetry = (importFunc) => {
  return React.lazy(() =>
    importFunc().catch((error) => {
      console.warn('Failed to load chunk, attempting reload:', error);
      // Force hard reload to bypass service worker cache
      window.location.reload();
      // Return a promise that never resolves to prevent further errors
      return new Promise(() => {});
    })
  );
};

// Pages
const Home = lazyWithRetry(() => import('./pages/home.jsx'));
const HotelDetails = lazyWithRetry(() => import('./pages/HotelDetails.jsx'));
const SignUp = lazyWithRetry(() => import('./pages/SignUp.jsx'));
const Verify = lazyWithRetry(() => import('./pages/Verify'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const AuthCallback = lazyWithRetry(() => import('./pages/AuthCallback'));
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'));
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'));
const Profile = lazyWithRetry(() => import('./pages/Profile'));
const Bookings = lazyWithRetry(() => import('./pages/Bookings'));
const Checkout = lazyWithRetry(() => import('./pages/Checkout'));
const AdminUpload = lazyWithRetry(() => import('./pages/AdminUpload'));
const Destinations = lazyWithRetry(() => import('./pages/Destinations.jsx'));

const Trends = lazyWithRetry(() => import('./pages/Trends.jsx'));
const Insights = lazyWithRetry(() => import('./pages/Insights.jsx'));
const TripPlanner = lazyWithRetry(() => import('./pages/TripPlanner.jsx'));
const Wishlist = lazyWithRetry(() => import('./pages/Wishlist.jsx'));
const Reviews = lazyWithRetry(() => import('./pages/Reviews.jsx'));
const Support = lazyWithRetry(() => import('./pages/Support.jsx'));
const About = lazyWithRetry(() => import('./pages/About.jsx'));
const Blog = lazyWithRetry(() => import('./pages/Blog.jsx'));
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost.jsx'));
const Terms = lazyWithRetry(() => import('./pages/Terms.jsx'));
const Privacy = lazyWithRetry(() => import('./pages/Privacy.jsx'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound.jsx'));
const SearchResults = lazyWithRetry(() => import('./pages/SearchResults.jsx'));
const DestinationDetails = lazyWithRetry(() => import('./pages/DestinationDetails.jsx'));
const DealsList = lazyWithRetry(() => import('./pages/DealsList.jsx'));
const FlightsSearch = lazyWithRetry(() => import('./pages/FlightsSearch.jsx'));
const CarsSearch = lazyWithRetry(() => import('./pages/CarsSearch.jsx'));
const ExperiencesListing = React.lazy(() => import('./pages/ExperiencesListing.jsx'));
const ExperienceBooking = React.lazy(() => import('./pages/ExperienceBooking.jsx'));
const Gallery = React.lazy(() => import('./pages/Gallery.jsx'));
const InsureTrip = React.lazy(() => import('./pages/InsureTrip.jsx'));
const HotelsMap = React.lazy(() => import('./pages/HotelsMap.jsx'));
const FeaturedHotels = React.lazy(() => import('./pages/FeaturedHotels.jsx'));
const ContactConcierge = React.lazy(() => import('./pages/ContactConcierge.jsx'));
const SavedSearches = React.lazy(() => import('./pages/SavedSearches.jsx'));
const CityHotels = React.lazy(() => import('./pages/CityHotels.jsx'));
const CityExperiences = React.lazy(() => import('./pages/CityExperiences.jsx'));

const AppRoutes = React.memo(() => {
  const { user } = useAuth();

  // Scroll to top on route change for better UX
  const loc = useLocation();
  React.useEffect(() => {
    try {
      window.scrollTo({ top: 80, left: 0, behavior: 'auto' });
    } catch (_e) {
      window.scrollTo(0, 80);
    }
  }, [loc.pathname]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public routes - anyone can access */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/support" element={<Support />} />
        <Route path="/contact" element={<Navigate to="/support" replace />} />

        {/* Protected routes - only logged in users */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/trip-planner" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
        <Route path="/saved-searches" element={<ProtectedRoute><SavedSearches /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/admin/upload" element={<AdminRoute><AdminUpload /></AdminRoute>} />

        {/* Semi-public routes - can view but need auth to book */}
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:id" element={<DestinationDetails />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/experiences" element={<ExperiencesListing />} />
        <Route path="/experiences/:experienceId" element={<ExperienceBooking />} />
        <Route path="/experiences/book/:experienceId" element={<ProtectedRoute><ExperienceBooking /></ProtectedRoute>} />
        <Route path="/deals" element={<DealsList />} />
        <Route path="/flights" element={<FlightsSearch />} />
        <Route path="/cars" element={<CarsSearch />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/special-offers" element={<Navigate to="/deals" replace />} />
        <Route path="/insure-trip" element={<InsureTrip />} />
        <Route path="/hotels-map" element={<HotelsMap />} />
        <Route path="/featured-hotels" element={<FeaturedHotels />} />
        <Route path="/concierge" element={<ContactConcierge />} />
        <Route path="/cities/:city/hotels" element={<CityHotels />} />
        <Route path="/cities/:city/experiences" element={<CityExperiences />} />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
});

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PreferencesProvider>
          <AccessibilityProvider>
            <WishlistProvider>
            <Suspense
              fallback={
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <AppRoutes />
              <MfaModal />
            </Suspense>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            </WishlistProvider>
          </AccessibilityProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default React.memo(App);
