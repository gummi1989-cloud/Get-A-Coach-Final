import React from 'react';

interface TwintLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TwintLogo: React.FC<TwintLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/twint_logo.png"
        alt="TWINT"
        className={`${sizeClasses[size]} w-auto object-contain rounded-md shadow-2xs`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export const TwintBadgeIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 36 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl bg-black flex items-center justify-center shrink-0 shadow-xs overflow-hidden p-1 ${className}`}
    >
      <img
        src="/twint_logo.png"
        alt="TWINT"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

