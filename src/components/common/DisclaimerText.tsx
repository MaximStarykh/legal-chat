
import React from 'react';

interface DisclaimerTextProps {
  text: string;
}

export const DisclaimerText: React.FC<DisclaimerTextProps> = ({ text }) => {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500">
        {text}
      </p>
      <p className="mt-1 text-xs text-gray-600">
        © {new Date().getFullYear()} AI Assistant. All rights reserved.
      </p>
    </div>
  );
};
