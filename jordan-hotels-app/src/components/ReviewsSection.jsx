import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReviewsSection = ({ hotelId, reviews = [], onAddReview }) => {
  // Add sorting and credibility
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'rating'
  const { t } = useTranslation();
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    setSubmitting(true);
    try {
      await onAddReview({
        ...newReview,
        hotelId,
        timestamp: new Date().toISOString(),
      });
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error('Error adding review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    // Default: newest first
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('reviews.title', 'Reviews')}
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {averageRating}
              </span>
            </div>
            <span className="text-slate-600 dark:text-slate-400">
              ({reviews.length} {t('reviews.count', 'reviews')})
            </span>
          </div>
        )}
      </div>

      {/* Sorting Controls */}
      {reviews.length > 1 && (
        <div className="flex gap-2 items-center mb-2">
          <span className="text-sm text-slate-600">Sort by:</span>
            <button
              type="button"
              className={`px-2 py-1 rounded min-h-[44px] ${sortBy === 'date' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
              onClick={() => setSortBy('date')}
            >
            {t('reviews.sortNewest', 'Newest')}
          </button>
            <button
              type="button"
              className={`px-2 py-1 rounded min-h-[44px] ${sortBy === 'rating' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
              onClick={() => setSortBy('rating')}
            >
            {t('reviews.sortRating', 'Highest Rated')}
          </button>
        </div>
      )}

      {/* Add Review Form */}
      <form onSubmit={handleSubmit} className="surface p-6 space-y-4">
        <h4 className="font-bold text-slate-900 dark:text-slate-100">
          {t('reviews.addReview', 'Add a Review')}
        </h4>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('reviews.rating', 'Rating')}
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                className="p-3 min-h-[44px] min-w-[44px] rounded-full inline-flex items-center justify-center"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= newReview.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('reviews.comment', 'Comment')}
          </label>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            rows={3}
            placeholder={t('reviews.commentPlaceholder', 'Share your experience...')}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !newReview.comment.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-jordan-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          <Send className="w-4 h-4" />
          {submitting ? t('reviews.submitting', 'Submitting...') : t('reviews.submit', 'Submit Review')}
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            {t('reviews.noReviews', 'No reviews yet. Be the first to share your experience!')}
          </div>
        ) : (
          sortedReviews.map((review, index) => (
            <div key={index} className="surface p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(review.timestamp).toLocaleDateString()}
                </span>
                {/* Verified Stay badge if review.verified === true */}
                {review.verified && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    {t('reviews.verifiedStay', 'Verified Stay')}
                  </span>
                )}
              </div>
              <p className="text-slate-700 dark:text-slate-300">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;