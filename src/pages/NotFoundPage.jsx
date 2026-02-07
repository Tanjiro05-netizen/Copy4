import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#12131A] flex items-center justify-center text-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/home"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors inline-block"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
