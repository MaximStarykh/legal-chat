import React from 'react';
import { ErrorIcon } from '../common/Icons';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div 
      className={`mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <ErrorIcon className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
