import React from 'react';
import { AIIcon } from '../common/Icons';

interface WelcomeScreenProps {
  title: string;
  subtitle: string;
  disclaimer: string;
  className?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  title,
  subtitle,
  disclaimer,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4 py-12 ${className}`}>
      <div className="w-24 h-24 mb-6 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center shadow-md">
        <AIIcon className="w-12 h-12 text-blue-600" />
      </div>
      <h2 className="text-3xl font-bold mb-4 text-gray-900">{title}</h2>
      <p className="text-gray-600 text-lg max-w-2xl mb-6">{subtitle}</p>
      <p className="text-sm text-gray-500 max-w-2xl">{disclaimer}</p>
    </div>
  );
};
