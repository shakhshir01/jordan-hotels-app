import { useState } from 'react';
import { Heart, Share2, MessageCircle, MapPin } from 'lucide-react';

export default function SocialSharing({ hotelName, destination, roomPrice }) {
  const [showShare, setShowShare] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 50);
  const [isLiked, setIsLiked] = useState(false);

  const shareText = `Just found an amazing deal at ${hotelName} in ${destination} for $${roomPrice}/night on VisitJo! 🏨✨`;
  const shareUrl = window.location.href;

  const shareOn = (platform) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(`Check out ${hotelName}`)}&body=${encodeURIComponent(shareText)}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'width=500,height=400');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
      <h3 className="font-bold text-gray-800 mb-3">💬 Share & Connect</h3>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
            isLiked ? 'bg-red-500 text-white' : 'bg-white border border-gray-300 hover:border-red-500'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'white' : 'none'} />
          <span className="text-sm font-medium">{likes}</span>
        </button>

        <button
          onClick={() => setShowShare(!showShare)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 hover:border-blue-500 transition"
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">Share</span>
        </button>

        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 hover:border-green-500 transition">
          <MessageCircle size={18} />
          <span className="text-sm font-medium">Reviews</span>
        </button>
      </div>

      {showShare && (
        <div className="bg-white border-t border-gray-200 pt-3 space-y-2">
          <button
            onClick={() => shareOn('facebook')}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <span>📘 Share on Facebook</span>
          </button>
          <button
            onClick={() => shareOn('twitter')}
            className="w-full flex items-center gap-2 px-3 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition"
          >
            <span>𝕏 Share on X (Twitter)</span>
          </button>
          <button
            onClick={() => shareOn('whatsapp')}
            className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            <span>💬 Share on WhatsApp</span>
          </button>
          <button
            onClick={() => shareOn('email')}
            className="w-full flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            <span>✉️ Share via Email</span>
          </button>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600 text-center">👥 {likes} travelers interested in this hotel</div>
      </div>
    </div>
  );
}
