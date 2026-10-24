'use client';

export default function ClothesLoader({ text = 'Loading collection...' }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      {/* Animated Shirt SVG */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Pulsing Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-orange-200 animate-ping opacity-75" />
        
        {/* Animated Shirt Icon */}
        <svg
          className="w-12 h-12 text-orange-500 animate-bounce duration-700"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.38 3.46l-4.15-1.38a2 2 0 00-1.85.34L12 4.35 9.62 2.42a2 2 0 00-1.85-.34L3.62 3.46a1 1 0 00-.62.94V8a1 1 0 001 1h1.5v11a2 2 0 002 2h10a2 2 0 002-2V9H20a1 1 0 001-1V4.4a1 1 0 00-.62-.94zM12 6.5a1.5 1.5 0 011.5-1.5h.5l1.5 2.5H8.5L10 5h.5A1.5 1.5 0 0112 6.5z" />
        </svg>
      </div>

      {/* Loading Message */}
      {text && (
        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}