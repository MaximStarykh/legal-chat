
import React, { useEffect, useState } from 'react';
import '../styles/animations.css';

const dots = ['.', '..', '...'];

export const LoadingIndicator: React.FC = () => {
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % dots.length);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1.5">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeDot 
                ? 'bg-green-500 scale-125' 
                : 'bg-green-300 scale-90'
            }`}
            style={{
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500 font-medium">
        Generating response{dots[activeDot]}
      </span>
    </div>
  );
};
