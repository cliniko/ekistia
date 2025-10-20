import React from 'react';
import logo from './ekistia_logo.png';

interface LoadingScreenProps {
  isLoading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      {/* Minimalist loading content - Just the logo */}
      <div className="flex flex-col items-center gap-4">
        {/* Animated Ekistia Logo as the only loading indicator */}
        <div className="relative flex items-center justify-center">
          <img
            src={logo}
            alt="Ekistia"
            className="w-24 h-24 object-contain"
            style={{
              animation: 'logoLoad 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards, breathe 3s ease-in-out 1.5s infinite',
              opacity: 0
            }}
          />
        </div>

        {/* Simple text */}
        <h2
          className="text-xl font-semibold text-gray-900"
          style={{
            animation: 'fadeInUp 0.8s ease-out 0.4s forwards',
            opacity: 0
          }}
        >
          Ekistia
        </h2>
      </div>

      {/* Custom animation keyframes */}
      <style>{`
        @keyframes logoLoad {
          0% {
            transform: scale(0.3) rotate(-90deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) rotate(5deg);
            opacity: 1;
          }
          75% {
            transform: scale(0.98) rotate(-2deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.95;
          }
        }

        @keyframes fadeInUp {
          0% {
            transform: translateY(15px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
