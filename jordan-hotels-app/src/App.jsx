import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { InlineLoader } from './components/LoadingSpinner';

// Shared layout
import AppLayout from './layouts/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
const Home = React.lazy(() => import('./pages/home.jsx'));
const HotelDetails = React.lazy(() => import('./pages/HotelDetails.jsx'));
const SignUp = React.lazy(() => import('./pages/SignUp.jsx'));
const Verify = React.lazy(() => import('./pages/Verify'));
const Login = React.lazy(() => import('./pages/Login'));
const OAuthCallback = React.lazy(() => import('./pages/OAuthCallback.jsx'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Bookings = React.lazy(() => import('./pages/Bookings'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const AdminUpload = React.lazy(() => import('./pages/AdminUpload'));
const Destinations = React.lazy(() => import('./pages/Destinations.jsx'));
const Deals = React.lazy(() => import('./pages/Deals.jsx'));
const Flights = React.lazy(() => import('./pages/Flights.jsx'));
const Cars = React.lazy(() => import('./pages/Cars.jsx'));
const Experiences = React.lazy(() => import('./pages/Experiences.jsx'));
const Trends = React.lazy(() => import('./pages/Trends.jsx'));
const Insights = React.lazy(() => import('./pages/Insights.jsx'));
const TripPlanner = React.lazy(() => import('./pages/TripPlanner.jsx'));
const Wishlist = React.lazy(() => import('./pages/Wishlist.jsx'));
const Reviews = React.lazy(() => import('./pages/Reviews.jsx'));
const Support = React.lazy(() => import('./pages/Support.jsx'));
const About = React.lazy(() => import('./pages/About.jsx'));
const Blog = React.lazy(() => import('./pages/Blog.jsx'));
const BlogPost = React.lazy(() => import('./pages/BlogPost.jsx'));
const Terms = React.lazy(() => import('./pages/Terms.jsx'));
const Privacy = React.lazy(() => import('./pages/Privacy.jsx'));
const NotFound = React.lazy(() => import('./pages/NotFound.jsx'));
const SearchResults = React.lazy(() => import('./pages/SearchResults.jsx'));
const DestinationDetails = React.lazy(() => import('./pages/DestinationDetails.jsx'));
const DealsList = React.lazy(() => import('./pages/DealsList.jsx'));
const FlightsSearch = React.lazy(() => import('./pages/FlightsSearch.jsx'));
const CarsSearch = React.lazy(() => import('./pages/CarsSearch.jsx'));
const ExperiencesListing = React.lazy(() => import('./pages/ExperiencesListing.jsx'));
const Gallery = React.lazy(() => import('./pages/Gallery.jsx'));
const SpecialOffers = React.lazy(() => import('./pages/SpecialOffers.jsx'));
const InsureTrip = React.lazy(() => import('./pages/InsureTrip.jsx'));
const HotelsMap = React.lazy(() => import('./pages/HotelsMap.jsx'));
const FeaturedHotels = React.lazy(() => import('./pages/FeaturedHotels.jsx'));
const ContactConcierge = React.lazy(() => import('./pages/ContactConcierge.jsx'));
const SavedSearches = React.lazy(() => import('./pages/SavedSearches.jsx'));
import { ErrorBoundary } from './components/ErrorBoundary';
import ChatBot from './components/ChatBot.jsx';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public routes - anyone can access */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/support" element={<Support />} />

        {/* Protected routes - only logged in users */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/trip-planner" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
        <Route path="/saved-searches" element={<ProtectedRoute><SavedSearches /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/admin/upload" element={<ProtectedRoute><AdminUpload /></ProtectedRoute>} />

        {/* Semi-public routes - can view but need auth to book */}
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:id" element={<DestinationDetails />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/deals" element={<DealsList />} />
        <Route path="/flights" element={<FlightsSearch />} />
        <Route path="/cars" element={<CarsSearch />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/special-offers" element={<SpecialOffers />} />
        <Route path="/insure-trip" element={<InsureTrip />} />
        <Route path="/hotels-map" element={<HotelsMap />} />
        <Route path="/featured-hotels" element={<FeaturedHotels />} />
        <Route path="/concierge" element={<ContactConcierge />} />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WishlistProvider>
          <ChatBot />
          <Suspense
            fallback={
              <div className="flex justify-center py-10">
                <InlineLoader />
              </div>
            }
          >
            <AppRoutes />
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
            theme="light"
          />
        </WishlistProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
