import React from 'react';
import { AIIcon } from '../common/Icons';

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className = '',
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 mr-3 flex-shrink-0">
        <AIIcon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 max-w-[85%]">
        <div className="flex space-x-1">
          <div 
            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};
