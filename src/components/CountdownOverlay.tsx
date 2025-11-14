import React from 'react';

interface CountdownOverlayProps {
  number: number | null;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ number }) => {
  if (number === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-500/95 to-accent-500/95 backdrop-blur-sm">
      <div className="text-center animate-pulse">
        {number > 0 ? (
          <div
            className="text-[200px] font-black text-white drop-shadow-2xl animate-bounce"
            style={{
              animation: 'countdownPulse 1s ease-in-out',
            }}
          >
            {number}
          </div>
        ) : (
          <div
            className="text-8xl font-black text-white drop-shadow-2xl"
            style={{
              animation: 'fadeZoom 0.5s ease-out',
            }}
          >
            GO!
          </div>
        )}
      </div>

      <style>{`
        @keyframes countdownPulse {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeZoom {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
