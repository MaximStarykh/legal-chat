import React from "react";
import {
  Menu,
  X,
  Send,
  Loader2,
  User,
  Bot,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

interface IconWrapperProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: React.ReactNode;
  size?: number;
  strokeWidth?: number;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ 
  icon, 
  className = "", 
  size = 20, 
  strokeWidth = 2,
  ...props 
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        "--icon-stroke-width": strokeWidth,
      } as React.CSSProperties}
      aria-hidden="true"
      {...props}
    >
      {icon}
    </span>
  );
};

export const AIIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
  strokeWidth = 2,
}) => (
  <IconWrapper
    icon={<Bot size={size} strokeWidth={strokeWidth} />}
    className={`text-green-600 ${className}`}
    size={size}
    strokeWidth={strokeWidth}
  />
);

export const SendIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
  strokeWidth = 2,
}) => (
  <IconWrapper
    icon={<Send size={size} strokeWidth={strokeWidth} />}
    className={`text-white ${className}`}
    size={size}
    strokeWidth={strokeWidth}
  />
);

export const LoadingSpinner: React.FC<IconProps> = ({
  className = "",
  size = 20,
  strokeWidth = 2,
}) => (
  <IconWrapper
    icon={
      <Loader2 className="animate-spin" size={size} strokeWidth={strokeWidth} />
    }
    className={`text-blue-600 ${className}`}
    size={size}
    strokeWidth={strokeWidth}
  />
);

export const UserIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
  strokeWidth = 2,
}) => (
  <IconWrapper
    icon={<User size={size} strokeWidth={strokeWidth} />}
    className={`text-blue-600 ${className}`}
    size={size}
    strokeWidth={strokeWidth}
  />
);

export const MenuIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
  strokeWidth = 2,
}) => (
  <IconWrapper
    icon={<Menu size={size} strokeWidth={strokeWidth} />}
    className={`text-gray-600 ${className}`}
    size={size}
    strokeWidth={strokeWidth}
  />
);

export const CloseIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
  strokeWidth = 2,
}) => (
  <IconWrapper
    icon={<X size={size} strokeWidth={strokeWidth} />}
    className={`text-gray-600 ${className}`}
    size={size}
    strokeWidth={strokeWidth}
  />
);

export const ErrorIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
  strokeWidth = 2,
}) => (
  <IconWrapper
    icon={<AlertCircle size={size} strokeWidth={strokeWidth} />}
    className={`text-red-500 ${className}`}
    size={size}
    strokeWidth={strokeWidth}
  />
);

export const WarningIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
  strokeWidth = 2,
}) => (
  <IconWrapper
    icon={<AlertTriangle size={size} strokeWidth={strokeWidth} />}
    className={`text-yellow-500 ${className}`}
    size={size}
    strokeWidth={strokeWidth}
  />
);

export const SuccessIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
  strokeWidth = 2,
}) => (
  <IconWrapper
    icon={<CheckCircle2 size={size} strokeWidth={strokeWidth} />}
    className={`text-green-500 ${className}`}
    size={size}
    strokeWidth={strokeWidth}
  />
);
