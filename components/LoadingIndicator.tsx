
import React from 'react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2 p-2">
      <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-sky-400 rounded-full animate-bounce"></div>
      <span className="text-sky-300 text-sm ml-2">AI думає...</span>
    </div>
  );
};
