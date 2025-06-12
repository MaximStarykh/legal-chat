import React, { useEffect } from "react";
import { ErrorIcon, CloseIcon } from "@/components/common/Icons";

interface NotificationProps {
  message: string;
  onClose?: () => void;
  /** Duration in ms before auto dismissing. Set to 0 to disable */
  duration?: number;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  onClose,
  duration = 4000,
  className = "",
}) => {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`pointer-events-auto max-w-sm w-full p-4 border border-red-200 rounded-md bg-red-50 text-red-800 shadow-md flex items-start space-x-2 ${className}`}
    >
      <ErrorIcon className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium flex-grow">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
};

export default Notification;
