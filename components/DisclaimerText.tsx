
import React from 'react';

interface DisclaimerTextProps {
  text: string;
}

export const DisclaimerText: React.FC<DisclaimerTextProps> = ({ text }) => {
  return (
    <footer className="p-3 md:p-4 bg-slate-900/80 backdrop-blur-md text-center border-t border-sky-700">
      <p className="text-xs text-slate-400">{text}</p>
    </footer>
  );
};
