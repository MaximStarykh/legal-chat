
import React from 'react';

interface HeaderProps {
  title: string;
  description: string;
}

export const Header: React.FC<HeaderProps> = ({ title, description }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md shadow-lg p-4 md:p-6 text-center border-b border-sky-700">
      <div className="flex items-center justify-center space-x-3">
        <span className="text-4xl" role="img" aria-label="logo">⚖️</span>
        <h1 className="text-3xl md:text-4xl font-bold text-sky-400">{title}</h1>
      </div>
      <p className="text-sm md:text-base text-sky-200 mt-2 max-w-2xl mx-auto">{description}</p>
    </header>
  );
};
