import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Shared layout
import AppLayout from './layouts/AppLayout.jsx';

// Existing pages (fix casing to match disk filenames)
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

// New pages
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
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Existing routes (keep) */}
            <Route path="/" element={<Home />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin/upload" element={<AdminUpload />} />

            {/* New routes */}
            <Route path="/search" element={<SearchResults />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:id" element={<DestinationDetails />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/deals" element={<DealsList />} />
            <Route path="/flights" element={<FlightsSearch />} />
            <Route path="/cars" element={<CarsSearch />} />
            <Route path="/trip-planner" element={<TripPlanner />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/support" element={<Support />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Must be LAST */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
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
    </ErrorBoundary>
  );
}

export default App;