import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Verify from './pages/Verify';
import Login from './pages/Login';
import HotelDetails from './pages/HotelDetails';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import Checkout from './pages/Checkout';
import AdminUpload from './pages/AdminUpload';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin/upload" element={<AdminUpload />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;