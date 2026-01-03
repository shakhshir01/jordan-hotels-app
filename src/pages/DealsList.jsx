import React, { useState, useEffect } from "react";
import realHotelsAPI from "../services/realHotelsData";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WishlistButton from "../components/WishlistButton";

const DISCOUNTS = [30, 25, 20, 35, 15, 22, 28, 18];

export default function DealsList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadHotels = async () => {
      const data = await realHotelsAPI.getFeaturedHotels();
      setHotels(data);
      setLoading(false);
    };
    loadHotels();
  }, []);

  const handleClaimDeal = (hotel, discount) => {
    if (!user) {
      navigate('/login', { state: { returnUrl: '/deals' } });
      return;
    }
    navigate('/checkout', { state: { hotel, discount } });
  };

  if (loading) return <div className="p-24 text-center">Loading deals...</div>;

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">Limited Time</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">Deals & Offers</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">Incredible discounts on Jordan's finest hotels</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel, idx) => {
            const discount = DISCOUNTS[idx % DISCOUNTS.length];
            const originalPrice = hotel.price;
            const discountedPrice = (originalPrice * (1 - discount / 100)).toFixed(2);
            
            return (
              <article key={hotel.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="relative h-48 overflow-hidden">
                  <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover hover:scale-110 transition" />
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                    -{discount}%
                  </div>
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                    ★ {hotel.rating}
                  </div>
                  <WishlistButton item={hotel} className="absolute bottom-4 right-4" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{hotel.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{hotel.location}</p>
                  
                  <div className="mb-6 space-y-1">
                    <p className="text-slate-400 line-through text-sm">{originalPrice} JOD/night</p>
                    <p className="text-3xl font-bold text-red-600">{discountedPrice} JOD/night</p>
                    <p className="text-xs text-slate-500">Save {(originalPrice - discountedPrice).toFixed(2)} JOD</p>
                  </div>

                  <button 
                    onClick={() => handleClaimDeal(hotel, discount)}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg hover:shadow-lg transition font-bold"
                  >
                    Claim Deal
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
