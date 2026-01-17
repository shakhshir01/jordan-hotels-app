import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const ProfileCompletionProgress = ({ profile, preferences, bookings }) => {
  const completionItems = [
    {
      key: 'name',
      label: 'Complete name',
      completed: !!(profile?.firstName && profile?.lastName),
    },
    {
      key: 'email',
      label: 'Email verified',
      completed: !!profile?.email,
    },
    {
      key: 'phone',
      label: 'Phone number',
      completed: !!profile?.phone,
    },
    {
      key: 'avatar',
      label: 'Profile photo',
      completed: !!(profile?.avatarUrl || profile?.avatar),
    },
    {
      key: 'preferences',
      label: 'Travel preferences',
      completed: !!(preferences?.currency && preferences?.language),
    },
    {
      key: 'bookings',
      label: 'First booking',
      completed: bookings.length > 0,
    },
  ];

  const completedCount = completionItems.filter(item => item.completed).length;
  const totalCount = completionItems.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="glass-card card-modern p-6 mb-6 animate-fade-in bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold gradient-text">Profile Completion</h3>
        <div className="text-2xl font-black gradient-text">{percentage}%</div>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {completionItems.map((item) => (
          <div key={item.key} className="flex items-center gap-3">
            {item.completed ? (
              <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            ) : (
              <Circle size={20} className="text-slate-400 flex-shrink-0" />
            )}
            <span className={`text-sm ${item.completed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {percentage < 100 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Complete your profile to unlock personalized recommendations and exclusive deals!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionProgress;