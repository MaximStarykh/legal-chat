import React from 'react';
import { ErrorState } from '../../types';
import { WarningIcon, ErrorIcon } from '../common/Icons';

interface ErrorMessageProps {
  error: ErrorState | null;
  onRetry: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  className = '',
}) => {
  if (!error) return null;

  return (
    <div 
      className={`mb-4 p-3 rounded-lg ${
        error.isRecoverable 
          ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
          : 'bg-red-50 border border-red-200 text-red-800'
      } ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {error.isRecoverable ? (
            <WarningIcon className="h-5 w-5" />
          ) : (
            <ErrorIcon className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {error.message}
          </p>
          {error.isRecoverable && (
            <div className="mt-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                Спробувати знову
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
