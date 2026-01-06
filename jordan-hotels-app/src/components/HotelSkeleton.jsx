import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const HotelSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <Skeleton height={250} />
      <div className="p-5">
        <Skeleton height={25} width="80%" className="mb-3" />
        <Skeleton height={16} width="60%" className="mb-4" />
        <Skeleton height={16} width="100%" className="mb-2" />
        <Skeleton height={16} width="90%" className="mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton height={24} width="25%" />
          <Skeleton height={40} width="30%" />
        </div>
      </div>
    </div>
  );
};

export const HotelGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-8 py-10">
      {Array.from({ length: count }).map((_, i) => (
        <HotelSkeleton key={i} />
      ))}
    </div>
  );
};

export default HotelSkeleton;
