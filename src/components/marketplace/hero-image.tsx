import { memo } from 'react';
import Image from 'next/image';

type HeroImageProps = {
  className?: string;
  priority?: boolean;
};

// Memoize the component to prevent unnecessary re-renders
const HeroImage = memo(({ className = "", priority = false }: HeroImageProps) => {
  return (
    <div className={`relative w-full h-full min-h-[300px] rounded-lg overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-300 z-0">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Abstract shapes - simplified */}
          <div className="absolute top-[10%] left-[15%] w-24 h-24 rounded-full bg-purple-500/20"></div>
          <div className="absolute top-[30%] right-[20%] w-32 h-32 rounded-full bg-purple-600/10"></div>
          <div className="absolute bottom-[15%] left-[30%] w-40 h-40 rounded-full bg-purple-400/15"></div>

          {/* Connection lines - simplified */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 400 300" 
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ 
              contain: 'paint',  // Optimize rendering
              contentVisibility: 'auto' // Let browser optimize visibility
            }}
          >
            <path
              d="M50,150 C100,50 300,250 350,150"
              stroke="#9333EA"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              fill="none"
            />
            <path
              d="M100,50 C200,100 250,150 300,100"
              stroke="#9333EA"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              fill="none"
            />
          </svg>

          {/* Document icons - only keeping two */}
          <div className="absolute top-[20%] left-[20%] flex items-center justify-center w-12 h-14 bg-white rounded-lg shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>

          <div className="absolute top-[40%] right-[25%] flex items-center justify-center w-12 h-14 bg-white rounded-lg shadow-md transform rotate-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>

          {/* Connection nodes - simplified */}
          <div className="absolute top-[15%] right-[40%] w-4 h-4 rounded-full bg-purple-600 shadow-lg shadow-purple-500/30"></div>
          <div className="absolute bottom-[30%] right-[30%] w-4 h-4 rounded-full bg-purple-600 shadow-lg shadow-purple-500/30"></div>
        </div>
      </div>

      {/* Overlay text */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md z-10">
        <p className="text-xs font-medium text-purple-800">Connect & Grow</p>
      </div>
    </div>
  );
});

HeroImage.displayName = 'HeroImage';

export default HeroImage;
  
  