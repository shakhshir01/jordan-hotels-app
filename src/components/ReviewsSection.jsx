import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { showSuccess, showError } from '../services/toastService';

export const ReviewsSection = ({ hotelId, reviews = [], onAddReview }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      showError('Please write a review');
      return;
    }

    setSubmitting(true);
    try {
      await onAddReview({
        hotelId,
        rating,
        comment,
        timestamp: new Date().toISOString(),
      });
      showSuccess('Review submitted successfully');
      setComment('');
      setRating(5);
    } catch (error) {
      showError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-slate-900">Reviews</h2>
          <div className="text-right">
            <p className="text-3xl font-bold text-yellow-500">{averageRating}★</p>
            <p className="text-sm text-slate-600">{reviews.length} reviews</p>
          </div>
        </div>

        {/* Average Rating Bar */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = reviews.filter(r => r.rating === stars).length;
              const percentage = (count / reviews.length) * 100;
              return (
                <div key={stars}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-700">{stars}★</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{count} reviews</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Review Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-slate-900 mb-4">Share Your Experience</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition ${
                  star <= rating ? 'text-yellow-500' : 'text-slate-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your stay..."
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none text-slate-900 placeholder-slate-400"
          />
          <p className="text-xs text-slate-600 mt-1">{comment.length}/500 characters</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-black transition disabled:opacity-50"
        >
          <Send size={18} />
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-slate-600 py-8">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {new Date(review.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-slate-700">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
