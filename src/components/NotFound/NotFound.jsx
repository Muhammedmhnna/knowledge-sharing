import React from "react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white from-purple-400 to-pink-600 text-white p-4">
      <h1 className="text-6xl font-bold mb-4 text-black">404</h1>
      <h2 className="text-2xl mb-2 text-black">Oops! Page not found</h2>
      <p className="text-center mb-6 max-w-md text-black">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-md  transition-all"
      >
        Go Home
      </a>
    </div>
  );
}
