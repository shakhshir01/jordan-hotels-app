import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

// Shared layout
import AppLayout from './layouts/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Home from './pages/home.jsx';
import HotelDetails from './pages/HotelDetails.jsx';
import SignUp from './pages/signup.jsx';
import Verify from './pages/Verify';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import Checkout from './pages/Checkout';
import AdminUpload from './pages/AdminUpload';
import Destinations from './pages/Destinations.jsx';
import Deals from './pages/Deals.jsx';
import Flights from './pages/Flights.jsx';
import Cars from './pages/Cars.jsx';
import Experiences from './pages/Experiences.jsx';
import TripPlanner from './pages/TripPlanner.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Reviews from './pages/Reviews.jsx';
import Support from './pages/Support.jsx';
import About from './pages/About.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import NotFound from './pages/NotFound.jsx';
import SearchResults from './pages/SearchResults.jsx';
import DestinationDetails from './pages/DestinationDetails.jsx';
import DealsList from './pages/DealsList.jsx';
import FlightsSearch from './pages/FlightsSearch.jsx';
import CarsSearch from './pages/CarsSearch.jsx';
import ExperiencesListing from './pages/ExperiencesListing.jsx';
import Gallery from './pages/Gallery.jsx';
import SpecialOffers from './pages/SpecialOffers.jsx';
import InsureTrip from './pages/InsureTrip.jsx';
import HotelsMap from './pages/HotelsMap.jsx';
import FeaturedHotels from './pages/FeaturedHotels.jsx';
import ContactConcierge from './pages/ContactConcierge.jsx';
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
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/admin/upload" element={<ProtectedRoute><AdminUpload /></ProtectedRoute>} />

        {/* Semi-public routes - can view but need auth to book */}
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:id" element={<DestinationDetails />} />
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
          <AppRoutes />
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
